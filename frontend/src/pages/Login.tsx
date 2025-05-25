import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLogin } from '@/api/apiHooks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription 
} from "@/components/ui/card";

// Define form schema with zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: login, isPending } = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    // Clear any previous error
    setServerError(null);
    
    login(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'You have been logged in successfully.',
          });
          navigate('/'); // Redirect to home page after login
        },
        onError: (error: any) => {
          console.error('Login error:', error);
          setServerError(error.message || 'Failed to log in. Please check your credentials.');
          toast({
            title: 'Error',
            description: 'Failed to log in. Please check your credentials.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <h1 className="text-3xl font-bold mb-8 text-center">Log In to Your Account</h1>

      {serverError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            {...register('email')}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            {...register('password')}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Logging in...' : 'Log In'}
        </Button>

        <div className="text-center mt-6">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login; 