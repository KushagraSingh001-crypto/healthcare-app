import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserIcon, Stethoscope } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">HealthConnect</span>
        </div>
        <div className="flex space-x-4">
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">About</span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Services</span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Contact</span>
          <Button variant="secondary" onClick={() => navigate('/login')}>Login</Button>
          <Button onClick={() => navigate('/signup')}>Sign Up</Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-foreground mb-6">
            Welcome to<br />HealthConnect
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Your trusted partner in healthcare management. Please select your role to continue.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="flex gap-8 max-w-4xl w-full">
          {/* Patient Card */}
          <div 
            onClick={() => navigate('/signup?role=patient')}
            className="flex-1 bg-healthcare-card hover:bg-healthcare-card-hover rounded-2xl p-12 cursor-pointer transition-all duration-300 hover:scale-105 border border-border"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <UserIcon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">I'm a Patient</h2>
              <p className="text-muted-foreground text-lg">
                Access your health records and appointments.
              </p>
            </div>
          </div>

          {/* Doctor Card */}
          <div 
            onClick={() => navigate('/signup?role=doctor')}
            className="flex-1 bg-healthcare-card hover:bg-healthcare-card-hover rounded-2xl p-12 cursor-pointer transition-all duration-300 hover:scale-105 border border-border"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">I'm a Doctor</h2>
              <p className="text-muted-foreground text-lg">
                Manage your patients and schedule.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;