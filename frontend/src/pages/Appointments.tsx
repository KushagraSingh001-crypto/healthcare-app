import React, { useState, useEffect } from 'react';
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
  Video,
  Loader2
} from 'lucide-react';
import { appointmentAPI } from '@/services/api';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await appointmentAPI.getUserAppointments();
      const allAppointments = response.data.data; 
      
      const now = new Date();
      const upcoming = [];
      const past = [];
      
      allAppointments.forEach(appointment => {
        
        const appointmentDate = new Date(appointment.date);
        const [hours, minutes] = appointment.time.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
      
        if (appointmentDate >= now && ['pending', 'confirmed'].includes(appointment.status)) {
          upcoming.push({
            id: appointment.id,
            doctorName: appointment.doctorName,
            doctorEmail: appointment.doctorEmail,
            doctorImage: null, 
            specialty: appointment.specialty,
            date: appointment.date,
            time: appointment.time,
            type: appointment.type,
            status: appointment.status,
            reason: appointment.reason,
            notes: appointment.notes,
            createdAt: appointment.createdAt
          });
        } else {
          past.push({
            id: appointment.id,
            doctorName: appointment.doctorName,
            doctorEmail: appointment.doctorEmail,
            doctorImage: null,
            specialty: appointment.specialty,
            date: appointment.date,
            time: appointment.time,
            type: appointment.type,
            status: appointment.status,
            reason: appointment.reason,
            notes: appointment.notes,
            createdAt: appointment.createdAt
          });
        }
      });
      
      setAppointments({ upcoming, past });
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      
      if (error.response?.status === 401) {
        setError('Please log in to view your appointments.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.response?.data?.message || 'Failed to load appointments. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = (appointmentId) => {
    
    navigate(`/book-appointment?reschedule=${appointmentId}`);
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setActionLoading(appointmentId);
      setError(null);
      
      await appointmentAPI.cancelAppointment(appointmentId);
      
      await fetchAppointments();
      
      console.log('Appointment cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      setError(error.response?.data?.message || 'Failed to cancel appointment. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'completed': return 'bg-blue-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'rejected': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderAppointmentCard = (appointment, showActions = true) => (
    <Card key={appointment.id} className="bg-healthcare-card border-border">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={appointment.doctorImage} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {appointment.doctorName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
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
                  {formatDate(appointment.date)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(appointment.time)}
                </div>
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground mb-1">
                  Type: <span className="font-normal capitalize">{appointment.type}</span>
                </p>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Reason:</span> {appointment.reason}
                </p>
                {appointment.notes && (
                  <div className="mt-2 p-2 bg-input rounded-md">
                    {appointment.notes.doctorNotes && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Doctor's Notes:</strong> {appointment.notes.doctorNotes}
                      </p>
                    )}
                    {appointment.notes.patientNotes && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Patient's Notes:</strong> {appointment.notes.patientNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex flex-col space-y-2">
              {appointment.status === 'confirmed' && (
                <>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="secondary" disabled>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" disabled>
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" disabled>
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleReschedule(appointment.id)}
                    disabled={actionLoading === appointment.id}
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
                    variant="outline"
                    onClick={() => handleReschedule(appointment.id)}
                    disabled={actionLoading === appointment.id}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleCancel(appointment.id)}
                    disabled={actionLoading === appointment.id}
                  >
                    {actionLoading === appointment.id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1" />
                    )}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

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
          <Button onClick={() => navigate('/book-appointment')} className="bg-primary hover:bg-primary/90">
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

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAppointments}
                className="mt-2"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({appointments.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Appointments ({appointments.past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {appointments.upcoming.length > 0 ? (
              appointments.upcoming.map(appointment => renderAppointmentCard(appointment))
            ) : (
              <Card className="bg-healthcare-card border-border">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-input rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Appointments</h3>
                  <p className="text-muted-foreground mb-4">You don't have any scheduled appointments.</p>
                  <Button onClick={() => navigate('/book-appointment')} className="bg-primary hover:bg-primary/90">
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
                  <div className="w-16 h-16 bg-input rounded-full flex items-center justify-center mx-auto mb-4">
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