from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse
from django.http import JsonResponse
import uuid
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer
)
from .models import UserProfile

class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        token, created = Token.objects.get_or_create(user=user)
        
        # Generate verification token
        user.profile.verification_token = uuid.uuid4()
        user.profile.save()
        
        # Send verification email
        self.send_verification_email(user)
        
        return Response({
            "token": token.key,
            "user": {
                "id": user.id,
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "emailVerified": user.profile.email_verified,
            },
            "message": "Please check your email to verify your account."
        }, status=status.HTTP_201_CREATED)
    
    def send_verification_email(self, user):
        frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
        verification_url = f"{frontend_url}/verify-email/{user.profile.verification_token}"
        
        subject = "Verify your email address for Aurelis Wear"
        message = f"""
        Hello {user.first_name},
        
        Thank you for registering at Aurelis Wear! Please verify your email address by clicking the link below:
        
        {verification_url}
        
        This link will expire in 24 hours.
        
        Best regards,
        Aurelis Wear Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

class LoginView(APIView):
    """
    API endpoint for user login
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data.get('email')
        password = serializer.validated_data.get('password')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "No user found with this email address."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        authenticated_user = authenticate(username=user.username, password=password)
        
        if not authenticated_user:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token, created = Token.objects.get_or_create(user=authenticated_user)
        
        return Response({
            "token": token.key,
            "user": {
                "id": authenticated_user.id,
                "email": authenticated_user.email,
                "firstName": authenticated_user.first_name,
                "lastName": authenticated_user.last_name,
                "emailVerified": authenticated_user.profile.email_verified,
            }
        })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def verify_email(request, token):
    """Verify user email with token"""
    try:
        profile = UserProfile.objects.get(verification_token=token)
        
        if profile.email_verified:
            return Response({"detail": "Email already verified."}, status=status.HTTP_200_OK)
        
        profile.email_verified = True
        profile.save()
        
        return Response({
            "detail": "Email successfully verified.",
            "email": profile.user.email
        }, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({"detail": "Invalid or expired verification token."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_verification(request):
    """Resend verification email"""
    email = request.data.get('email')
    
    if not email:
        return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        if user.profile.email_verified:
            return Response({"detail": "Email already verified."}, status=status.HTTP_200_OK)
        
        # Generate new verification token
        user.profile.verification_token = uuid.uuid4()
        user.profile.save()
        
        # Send verification email
        frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
        verification_url = f"{frontend_url}/verify-email/{user.profile.verification_token}"
        
        subject = "Verify your email address for Aurelis Wear"
        message = f"""
        Hello {user.first_name},
        
        You requested a new verification link for your Aurelis Wear account. Please verify your email address by clicking the link below:
        
        {verification_url}
        
        This link will expire in 24 hours.
        
        Best regards,
        Aurelis Wear Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({"detail": "Verification email sent."}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"detail": "No account found with that email address."}, status=status.HTTP_404_NOT_FOUND)

class UserView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for retrieving and updating user profile
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    """
    API endpoint for changing user password
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response(
                {"detail": "Both current and new password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify current password
        if not user.check_password(current_password):
            return Response(
                {"detail": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({"detail": "Password changed successfully."})

class LogoutView(APIView):
    """
    API endpoint for user logout
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Delete the user's token to logout
        request.user.auth_token.delete()
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK) 