import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  MessageCircle, 
  User, 
  Plus,
  Clock,
  LayoutDashboard,
  CalendarPlus,
  LogOut,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  FileText,
  Loader2
} from 'lucide-react';

// Import your existing API service
import { userAPI, dashboardAPI } from '../services/api';

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const [userResponse, dashboardResponse] = await Promise.all([
        userAPI.getCurrentUser(),
        dashboardAPI.getPatientDashboard()
      ]);

      
      const userData = userResponse.data?.data || userResponse.data;
      const dashboardInfo = dashboardResponse.data?.data || dashboardResponse.data;

      setCurrentUser(userData);
      setDashboardData(dashboardInfo);

    } catch (err) {
      console.error('Data fetch error:', err);
      
      let errorMessage = 'Failed to load data';
      
      if (err.response) {
        errorMessage = err.response.data?.message || `HTTP error! status: ${err.response.status}`;
        
        if (err.response.status === 401) {
          window.location.href = '/login';
          return;
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else {
        errorMessage = err.message || 'Failed to load data';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await userAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-500 text-white';
      case 'pending': return 'bg-blue-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'book-appointment':
        window.location.href = '/book-appointment';
        break;
      case 'medical-history':
        window.location.href = '/medical-history';
        break;
      case 'update-profile':
        window.location.href = '/profile';
        break;
      default:
        console.log(`Action ${action} not implemented yet`);
        break;
    }
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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Alert className="max-w-lg border border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <div className="mb-2 font-semibold">Error loading dashboard</div>
            <div className="mb-4 text-sm">{error}</div>
            <div className="space-x-2">
              <Button 
                onClick={fetchInitialData} 
                variant="outline" 
                size="sm" 
                className="border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                Retry
              </Button>
              <Button 
                onClick={() => window.location.href = '/login'} 
                variant="outline" 
                size="sm" 
                className="border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                Go to Login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  
  const patientInfo = dashboardData?.patient || {};
  const userInfo = currentUser || {};
  
  
  const patient = {
    fullName: patientInfo.fullName || userInfo.fullName || 'User',
    email: patientInfo.email || userInfo.email || '',
    profilePicture: patientInfo.profilePicture || userInfo.profilePicture || '',
    profileCompletion: patientInfo.profileCompletion || 0
  };

  const { 
    statistics = {}, 
    upcomingAppointments = [], 
    recentAppointments = [], 
    quickActions = [] 
  } = dashboardData || {};

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-healthcare-card border-r border-border p-6">
        <div className="flex items-center space-x-3 mb-8">
          <Avatar className="w-12 h-12">
            <AvatarImage src={patient.profilePicture} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {patient.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">{patient.fullName}</h3>
            <p className="text-sm text-muted-foreground">Patient</p>
          </div>
        </div>

        <nav className="space-y-2">
          <Button className="w-full justify-start" variant="default">
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => window.location.href = '/appointments'}
          >
            <CalendarPlus className="w-4 h-4 mr-3" />
            My Appointments
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => window.location.href = '/messages'}
          >
            <MessageCircle className="w-4 h-4 mr-3" />
            Messages
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => window.location.href = '/profile'}
          >
            <User className="w-4 h-4 mr-3" />
            Profile
          </Button>
        </nav>

        {/* Profile Completion */}
        {patient.profileCompletion < 100 && (
          <div className="mt-8 p-4 bg-primary/10 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Complete Profile</h4>
            <div className="w-full bg-primary/20 rounded-full h-2 mb-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${patient.profileCompletion}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {patient.profileCompletion}% complete
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/profile'}
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
            <p className="text-muted-foreground">
              Welcome back, {patient.fullName?.split(' ')[0] || 'User'}!
            </p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Appointments</p>
                  <p className="text-2xl font-bold text-foreground">{statistics?.totalAppointments || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{statistics?.completedAppointments || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-primary">{statistics?.pendingAppointments || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-healthcare-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics?.upcomingAppointments || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Upcoming Appointments</h2>
            <Button onClick={() => window.location.href = '/book-appointment'}>
              <Plus className="w-4 h-4 mr-2" />
              Book New
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAppointments?.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="bg-healthcare-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={appointment.doctorImage} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {appointment.doctorName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'Dr'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{appointment.doctorName || 'Doctor'}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.speciality || 'General'}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(appointment.date)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatTime(appointment.time)}
                      </div>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Unknown'}
                      </div>
                      {appointment.reason && (
                        <p className="text-sm text-muted-foreground italic">"{appointment.reason}"</p>
                      )}
                      <Button 
                        className="w-full" 
                        onClick={() => window.location.href = `/appointments/${appointment.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card 
                className="bg-healthcare-card border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors"
                onClick={() => window.location.href = '/book-appointment'}
              >
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Book Your First Appointment</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Schedule your appointment with a healthcare provider
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {quickActions?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  className="bg-healthcare-card border-border hover:shadow-md cursor-pointer transition-shadow"
                  onClick={() => handleQuickAction(action.action)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        {action.icon === 'calendar-plus' && <CalendarPlus className="w-5 h-5 text-primary" />}
                        {action.icon === 'file-medical' && <FileText className="w-5 h-5 text-primary" />}
                        {action.icon === 'user' && <User className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Appointments */}
        {recentAppointments?.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Recent Appointments</h2>
            <Card className="bg-healthcare-card border-border">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {appointment.doctorName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'Dr'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-foreground">{appointment.doctorName || 'Doctor'}</h4>
                          <p className="text-sm text-muted-foreground">{appointment.speciality || 'General'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(appointment.date)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(appointment.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;