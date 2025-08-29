import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MessageCircle, 
  User, 
  Clock,
  LayoutDashboard,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Phone,
  Video,
  LogOut
} from 'lucide-react';

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const appointments = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      time: '10:30 AM',
      date: 'Dec 18, 2023',
      type: 'General Checkup',
      status: 'pending',
      avatar: ''
    },
    {
      id: 2,
      patientName: 'Michael Chen',
      time: '2:00 PM',
      date: 'Dec 18, 2023',
      type: 'Follow-up',
      status: 'confirmed',
      avatar: ''
    },
    {
      id: 3,
      patientName: 'Emma Wilson',
      time: '3:30 PM',
      date: 'Dec 18, 2023',
      type: 'Consultation',
      status: 'pending',
      avatar: ''
    }
  ];

  const handleAppointmentAction = (appointmentId, action) => {
    console.log(`${action} appointment ${appointmentId}`);
  };

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
            <AvatarFallback className="bg-primary text-primary-foreground">DC</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">Dr. Carter</h3>
            <p className="text-sm text-muted-foreground">Cardiologist</p>
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
          >
            <CalendarCheck className="w-4 h-4 mr-3" />
            Appointments
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/doctor-messages')}
          >
            <MessageCircle className="w-4 h-4 mr-3" />
            Messages
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/doctor-profile')}
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
            <p className="text-muted-foreground">Manage your appointments and patients</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold text-foreground">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-healthcare-teal/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-healthcare-teal" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold text-foreground">142</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-healthcare-green/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-healthcare-green" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-foreground">5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Requests */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Appointment Requests</h2>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="bg-healthcare-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={appointment.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {appointment.patientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-1" />
                            {appointment.date}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                      {appointment.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="secondary">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button size="sm">View Details</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;