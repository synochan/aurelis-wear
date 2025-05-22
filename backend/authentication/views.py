from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer
)

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
        
        return Response({
            "token": token.key,
            "user": {
                "id": user.id,
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name,
            }
        }, status=status.HTTP_201_CREATED)

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
            }
        })

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