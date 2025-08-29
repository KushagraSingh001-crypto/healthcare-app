import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Stethoscope,
  Plus,
  Edit,
  Trash2,
  MessageCircle,
  Phone,
  Video
} from 'lucide-react';
import doctorEmily from '@/assets/doctor-emily-carter.jpg';
import doctorRobert from '@/assets/doctor-robert-harris.jpg';

const Appointments = () => {
  const navigate = useNavigate();

  // TODO: Backend Integration - Fetch user's appointments from database
  // This should get appointments based on current user's ID
  const appointments = {
    upcoming: [
      {
        id: 1,
        doctorName: 'Dr. Emily Carter',
        doctorImage: doctorEmily,
        specialty: 'General Practitioner',
        date: '2023-12-18',
        time: '10:30 AM',
        type: 'General Consultation',
        status: 'confirmed',
        reason: 'Regular checkup and health assessment'
      },
      {
        id: 2,
        doctorName: 'Dr. Robert Harris',
        doctorImage: doctorRobert,
        specialty: 'Cardiologist',
        date: '2023-12-22',
        time: '2:00 PM',
        type: 'Follow-up',
        status: 'pending',
        reason: 'Follow-up for cardiovascular health monitoring'
      }
    ],
    past: [
      {
        id: 3,
        doctorName: 'Dr. Emily Carter',
        doctorImage: doctorEmily,
        specialty: 'General Practitioner',
        date: '2023-12-10',
        time: '11:00 AM',
        type: 'General Consultation',
        status: 'completed',
        reason: 'Annual physical examination'
      }
    ]
  };

  const handleReschedule = (appointmentId) => {
    // TODO: Backend Integration - Update appointment in database
    // Navigate to booking page with appointment data pre-filled
    navigate(`/book-appointment?reschedule=${appointmentId}`);
  };

  const handleCancel = async (appointmentId) => {
    // TODO: Backend Integration - Cancel appointment
    /*
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (response.ok) {
        // Send cancellation notification to doctor
        await sendCancellationNotification(appointmentId);
        // Refresh appointments list
        fetchAppointments();
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
    */
    console.log('Cancel appointment:', appointmentId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-healthcare-green text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const renderAppointmentCard = (appointment, showActions = true) => (
    <Card key={appointment.id} className="bg-healthcare-card border-border">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={appointment.doctorImage} />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-foreground">{appointment.doctorName}</h3>
                <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{appointment.specialty}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(appointment.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {appointment.time}
                </div>
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground mb-1">Type: {appointment.type}</p>
                <p className="text-sm text-muted-foreground">{appointment.reason}</p>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex flex-col space-y-2">
              {appointment.status === 'confirmed' && (
                <>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="secondary">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleReschedule(appointment.id)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Reschedule
                  </Button>
                </>
              )}
              {appointment.status === 'pending' && (
                <>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleReschedule(appointment.id)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleCancel(appointment.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient-dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">HealthConnect</span>
            </div>
          </div>
          <Button onClick={() => navigate('/book-appointment')}>
            <Plus className="w-4 h-4 mr-2" />
            Book New Appointment
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
          <p className="text-muted-foreground">Manage your upcoming and past appointments</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {appointments.upcoming.length > 0 ? (
              appointments.upcoming.map(appointment => renderAppointmentCard(appointment))
            ) : (
              <Card className="bg-healthcare-card border-border">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Appointments</h3>
                  <p className="text-muted-foreground mb-4">You don't have any scheduled appointments.</p>
                  <Button onClick={() => navigate('/book-appointment')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Book Your First Appointment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {appointments.past.length > 0 ? (
              appointments.past.map(appointment => renderAppointmentCard(appointment, false))
            ) : (
              <Card className="bg-healthcare-card border-border">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Past Appointments</h3>
                  <p className="text-muted-foreground">Your appointment history will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Appointments;