import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Stethoscope, Loader2 } from 'lucide-react';
import { userAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    if (location.state?.email) {
      setEmail(location.state.email);
    }

   
    clearExistingAuth();
  }, [location.state]);

  const clearExistingAuth = () => {
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage(''); 
    setLoading(true);

    try {
      console.log('Starting login process...');
      
      const loginData = {
        email: email.trim(),
        password,
        role 
      };

      console.log('Login data:', { ...loginData, password: '[HIDDEN]' });
      
      const response = await userAPI.login(loginData);
      console.log('Login response:', response.data);

      const { user } = response.data.data;

      
      console.log('Login successful, redirecting to dashboard...');
      
      
      if (user.role === 'patient') {
        navigate('/patient-dashboard');
      } else if (user.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        throw new Error('Invalid user role');
      }

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">HealthConnect</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue to your dashboard.</p>
          </div>

          {/* Success Message from Registration */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label className="text-foreground mb-4 block">I am a...</Label>
              <RadioGroup value={role} onValueChange={setRole} className="flex space-x-6" disabled={loading}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="patient" id="patient" disabled={loading} />
                  <Label htmlFor="patient" className="text-foreground">Patient</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="doctor" id="doctor" disabled={loading} />
                  <Label htmlFor="doctor" className="text-foreground">Doctor</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 bg-input border-border text-foreground"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 bg-input border-border text-foreground"
                required
                disabled={loading}
              />
              <div className="text-right mt-2">
                <button 
                  type="button" 
                  className="text-primary hover:underline text-sm"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          <div className="text-center mt-6">
            <span className="text-muted-foreground">Don't have an account? </span>
            <button 
              onClick={() => navigate('/signup')} 
              className="text-primary hover:underline"
              disabled={loading}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;