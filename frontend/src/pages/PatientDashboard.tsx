import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  MessageCircle, 
  User, 
  Plus,
  Clock,
  LayoutDashboard,
  CalendarPlus,
  LogOut
} from 'lucide-react';
import doctorEmily from '@/assets/doctor-emily-carter.jpg';
import doctorRobert from '@/assets/doctor-robert-harris.jpg';

const PatientDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear tokens or auth state here
    localStorage.removeItem('token'); // example
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-healthcare-card border-r border-border p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Avatar className="w-12 h-12">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">SC</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">Sophia Clark</h3>
            <p className="text-sm text-muted-foreground">Patient</p>
          </div>
        </div>

        <nav className="space-y-2">
          <Button variant="default" className="w-full justify-start">
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/appointments')}
          >
            <CalendarPlus className="w-4 h-4 mr-3" />
            My Appointments
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/messages')}
          >
            <MessageCircle className="w-4 h-4 mr-3" />
            Messages
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/profile')}
          >
            <User className="w-4 h-4 mr-3" />
            Profile
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Sophia!</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Upcoming Appointments</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dr. Emily Carter Appointment */}
            <Card className="bg-healthcare-card border-border">
              <CardHeader className="pb-4">
                <div className="relative h-32 -mx-6 -mt-6 mb-4 rounded-t-lg overflow-hidden">
                  <img 
                    src={doctorEmily} 
                    alt="Dr. Emily Carter" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-healthcare-card/80 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <h3 className="font-semibold text-white">Dr. Emily Carter</h3>
                    <p className="text-sm text-gray-200">General Practitioner</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Monday, Dec 18, 2023
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    10:30 AM
                  </div>
                  <Button className="w-full">View Details</Button>
                </div>
              </CardContent>
            </Card>

            {/* Dr. Robert Harris Appointment */}
            <Card className="bg-healthcare-card border-border">
              <CardHeader className="pb-4">
                <div className="relative h-32 -mx-6 -mt-6 mb-4 rounded-t-lg overflow-hidden">
                  <img 
                    src={doctorRobert} 
                    alt="Dr. Robert Harris" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-healthcare-card/80 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <h3 className="font-semibold text-white">Dr. Robert Harris</h3>
                    <p className="text-sm text-gray-200">Cardiologist</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Friday, Dec 22, 2023
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    2:00 PM
                  </div>
                  <Button variant="secondary" className="w-full">Reschedule</Button>
                </div>
              </CardContent>
            </Card>

            {/* Book New Appointment */}
            <Card 
              className="bg-healthcare-card border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => navigate('/book-appointment')}
            >
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Book New Appointment</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Schedule your next appointment with a healthcare provider
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
