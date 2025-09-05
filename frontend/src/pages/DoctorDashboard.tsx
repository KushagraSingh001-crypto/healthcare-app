import React, { useState, useEffect } from 'react';
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
  LogOut,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { dashboardAPI, appointmentAPI, userAPI } from '../services/api';

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dashboardResponse = await dashboardAPI.getDoctorDashboard();
      const data = dashboardResponse.data.data;
      console.log('Dashboard data loaded:', data);
      
      setDashboardData(data);
      setPendingRequests(data.pendingRequests || []);
      setTodaySchedule(data.todaySchedule || []);
      setUpcomingSchedule(data.upcomingSchedule || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [appointmentId]: action }));
      const status = action === 'accept' ? 'confirmed' : 'rejected';
      
      
      const originalAppointment = pendingRequests.find(apt => apt.id === appointmentId);
      if (!originalAppointment) {
        throw new Error('Appointment not found');
      }
      
      console.log(`${action}ing appointment:`, originalAppointment);
      
      
      const response = await appointmentAPI.updateAppointmentStatus(appointmentId, { status });
      console.log('Appointment status updated:', response.data);
      
      
      setPendingRequests(prev =>
        prev.filter(appointment => appointment.id !== appointmentId)
      );
      

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const appointmentDate = new Date(originalAppointment.date);
      const appointmentDateStr = appointmentDate.toISOString().split('T')[0];
      const isToday = appointmentDateStr === todayStr;
      
      console.log('Date comparison:', { todayStr, appointmentDateStr, isToday });
      
    
      if (action === 'accept') {
        const newScheduleItem = {
          id: appointmentId,
          patientName: originalAppointment.patientName,
          patientEmail: originalAppointment.patientEmail || '',
          patientPhone: originalAppointment.patientPhone || '',
          patientAvatar: originalAppointment.patientAvatar || '',
          reason: originalAppointment.reason,
          time: originalAppointment.time,
          date: originalAppointment.date,
          appointmentType: originalAppointment.appointmentType || originalAppointment.type,
          status: 'confirmed',
          isUrgent: originalAppointment.isUrgent || false,
          duration: originalAppointment.duration,
          patientNotes: originalAppointment.patientNotes || ''
        };
        
        if (isToday) {
          setTodaySchedule(prev => {
            
            const exists = prev.find(item => item.id === appointmentId);
            if (exists) return prev;
            
            const updated = [...prev, newScheduleItem].sort((a, b) => a.time.localeCompare(b.time));
            console.log('Updated today schedule:', updated);
            return updated;
          });
        } else {
          setUpcomingSchedule(prev => {
            
            const exists = prev.find(item => item.id === appointmentId);
            if (exists) return prev;
            
            const updated = [...prev, newScheduleItem].sort((a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)
            );
            console.log('Updated upcoming schedule:', updated);
            return updated;
          });
        }
      }
      
      
      setDashboardData(prev => {
        const newStats = {
          ...prev.statistics,
          pendingRequests: Math.max(0, (prev.statistics?.pendingRequests || 0) - 1),
        };
        
        if (isToday) {
          if (action === 'reject') {
            
            newStats.todayAppointments = Math.max(0, (prev.statistics?.todayAppointments || 0) - 1);
          }
        
        } else if (action === 'accept') {
          
          newStats.upcomingAppointments = (prev.statistics?.upcomingAppointments || 0) + 1;
        }
        
        return {
          ...prev,
          statistics: newStats
        };
      });
      
      console.log(`Appointment ${action}ed successfully`);
    } catch (err) {
      console.error(`Error ${action}ing appointment:`, err);
      setError(`Failed to ${action} appointment: ${err.message}`);
      
      
      setTimeout(() => {
        loadDashboardData();
      }, 1000);
    } finally {
      setActionLoading(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  const handleLogout = async () => {
    try {
      await userAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInitials = (name) => {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadDashboardData}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Rendering dashboard with data:', {
    pendingCount: pendingRequests.length,
    todayCount: todaySchedule.length,
    upcomingCount: upcomingSchedule.length,
    statistics: dashboardData?.statistics
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-healthcare-card border-r border-border p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Avatar className="w-12 h-12">
            <AvatarImage src={dashboardData?.doctor?.profilePicture || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(dashboardData?.doctor?.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">{dashboardData?.doctor?.fullName}</h3>
            <p className="text-sm text-muted-foreground">{dashboardData?.doctor?.speciality}</p>
            {dashboardData?.doctor?.isVerified && (
              <Badge variant="secondary" className="text-xs mt-1">Verified</Badge>
            )}
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
            onClick={() => window.location.href = '/doctor-appointments'}
          >
            <CalendarCheck className="w-4 h-4 mr-3" />
            Appointments
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => window.location.href = '/doctor-messages'}
          >
            <MessageCircle className="w-4 h-4 mr-3" />
            Messages
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => window.location.href = '/doctor-profile'}
          >
            <User className="w-4 h-4 mr-3" />
            Profile
          </Button>
        </nav>
        {/* Profile Completion */}
        {dashboardData?.doctor?.profileCompletion < 100 && (
          <div className="mt-8 p-4 bg-primary/10 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Complete Profile</h4>
            <div className="w-full bg-primary/20 rounded-full h-2 mb-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${dashboardData.doctor.profileCompletion}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {dashboardData.doctor.profileCompletion}% complete
            </p>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/doctor-profile'}
            >
              Update Profile
            </Button>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your appointments and patients</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={loadDashboardData}>
              <Clock className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardData?.statistics?.todayAppointments || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardData?.statistics?.totalPatients || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardData?.statistics?.completedToday || 0}
                  </p>
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
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardData?.statistics?.pendingRequests || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                  <p className="text-2xl font-bold text-foreground">
                    {dashboardData?.statistics?.upcomingAppointments || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Appointment Requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Appointment Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-4">
              {pendingRequests.map((appointment) => (
                <Card key={appointment.id} className="bg-healthcare-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={appointment.patientAvatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(appointment.patientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(appointment.time)}
                            </div>
                          </div>
                          {(appointment.type || appointment.appointmentType) && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {appointment.type || appointment.appointmentType}
                            </Badge>
                          )}
                          {appointment.isUrgent && (
                            <Badge variant="destructive" className="text-xs mt-1 ml-2">
                              Urgent
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">Pending</Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading[appointment.id] === 'reject'}
                          onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                        >
                          {actionLoading[appointment.id] === 'reject' ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-1" />
                          )}
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          disabled={actionLoading[appointment.id] === 'accept'}
                          onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                        >
                          {actionLoading[appointment.id] === 'accept' ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Today's Schedule */}
        {todaySchedule && todaySchedule.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Today's Schedule ({todaySchedule.length})
            </h2>
            <div className="space-y-4">
              {todaySchedule.map((appointment) => (
                <Card key={appointment.id} className="bg-healthcare-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={appointment.patientAvatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(appointment.patientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(appointment.time)}
                            </div>
                            {appointment.appointmentType && (
                              <Badge variant="outline" className="text-xs">
                                {appointment.appointmentType}
                              </Badge>
                            )}
                            {appointment.isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="default">
                          Confirmed
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="secondary">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button size="sm">View Details</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Upcoming Schedule */}
        {upcomingSchedule && upcomingSchedule.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Upcoming Appointments (Next 7 Days) ({upcomingSchedule.length})
            </h2>
            <div className="space-y-4">
              {upcomingSchedule.map((appointment) => (
                <Card key={appointment.id} className="bg-healthcare-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={appointment.patientAvatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(appointment.patientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{appointment.patientName}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(appointment.time)}
                            </div>
                            {appointment.appointmentType && (
                              <Badge variant="outline" className="text-xs">
                                {appointment.appointmentType}
                              </Badge>
                            )}
                            {appointment.isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="default">
                          Confirmed
                        </Badge>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty States */}
        {!todaySchedule?.length && !upcomingSchedule?.length && !pendingRequests?.length && (
          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No appointments today</h3>
              <p className="text-muted-foreground">
                You have no scheduled appointments or pending requests for today.
              </p>
              <Button className="mt-4" onClick={loadDashboardData}>
                Refresh Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;