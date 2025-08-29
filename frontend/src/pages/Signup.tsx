import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope } from 'lucide-react';
import healthcareHero from '@/assets/healthcare-hero.jpg';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, redirect based on role
    if (role === 'patient') {
      navigate('/patient-dashboard');
    } else {
      navigate('/doctor-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col">
        {/* Navigation */}
        <nav className="flex items-center p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">HealthFirst</span>
          </div>
        </nav>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
              <p className="text-muted-foreground">Join us to manage your health with ease.</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <Label className="text-foreground mb-4 block">I am a...</Label>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant={role === 'patient' ? 'default' : 'secondary'}
                    onClick={() => setRole('patient')}
                    className="flex-1"
                  >
                    Patient
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'doctor' ? 'default' : 'secondary'}
                    onClick={() => setRole('doctor')}
                    className="flex-1"
                  >
                    Doctor
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1 bg-input border-border text-foreground"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-foreground">Contact Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(123) 456-7890"
                  className="mt-1 bg-input border-border text-foreground"
                  required
                />
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
                />
              </div>

              <Button type="submit" className="w-full">
                Sign up
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-muted-foreground">Already a member? </span>
              <button onClick={() => navigate('/login')} className="text-primary hover:underline">
                Log in here
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="flex-1 relative">
        <img 
          src={healthcareHero} 
          alt="Healthcare professional with tablet" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 flex items-end">
          <div className="p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Your Health, Simplified</h2>
            <p className="text-lg text-gray-200">
              Access your medical records, book appointments, and connect with your doctor, all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;