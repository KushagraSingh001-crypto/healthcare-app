import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  Stethoscope,
  CheckCircle,
  Search,
  Star,
  Loader2,
  AlertCircle,
  Shield
} from 'lucide-react';
import { doctorAPI, appointmentAPI } from '../services/api';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  
  // Data states
  const [doctors, setDoctors] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const appointmentTypes = [
    { id: 'consultation', name: 'General Consultation', duration: '30 min' },
    { id: 'checkup', name: 'Regular Checkup', duration: '45 min' },
    { id: 'followup', name: 'Follow-up Visit', duration: '20 min' },
    { id: 'emergency', name: 'Urgent Care', duration: '60 min' }
  ];

  // Load doctors on component mount
  useEffect(() => {
    loadDoctors();
  }, [specialtyFilter]);

  // Load availability when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadDoctorAvailability();
    }
  }, [selectedDoctor, selectedDate]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorAPI.getAll();
      console.log('Doctors response:', response);
      
      // Handle different response structures
      const doctorsData = response.data?.data || response.data || [];
      setDoctors(doctorsData);
      
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the correct doctor ID - handle both direct doctor objects and populated ones
      const doctorId = selectedDoctor._id || selectedDoctor.userId?._id || selectedDoctor.userId;
      console.log('Loading availability for doctor:', doctorId, 'date:', selectedDate);
      
      if (!doctorId) {
        console.error('No doctor ID found in selectedDoctor:', selectedDoctor);
        throw new Error('Doctor ID not found');
      }

      const response = await doctorAPI.getAvailability(doctorId);
      console.log('Availability response:', response);
      
      setAvailability(response.data?.data || response.data || {});
      
    } catch (err) {
      console.error('Error loading availability:', err);
      // Don't show error for availability - just use default slots
      setAvailability(null);
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends for demo - in real app this would be based on doctor availability
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const getAvailableTimeSlots = () => {
    // Default time slots if availability data is not available
    const defaultSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    if (!availability) {
      return defaultSlots;
    }
    
    try {
      const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
      const daySchedule = availability.availability?.find(day => day.day === dayOfWeek);
      
      if (!daySchedule || !daySchedule.isAvailable) {
        return defaultSlots;
      }
      
      // Filter out booked times
      const bookedTimes = availability.bookedTimes || [];
      return defaultSlots.filter(slot => !bookedTimes.includes(slot));
    } catch (error) {
      console.error('Error processing availability:', error);
      return defaultSlots;
    }
  };

  const handleDoctorSelect = (doctor) => {
    console.log('Selected doctor:', doctor);
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedTime('');
    setAvailability(null);
    setError(null);
    setCurrentStep(2);
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      setCurrentStep(3);
    }
  };

  const handleBookingConfirm = async () => {
    try {
      setBookingLoading(true);
      setError(null);
      
      // Get the correct doctor ID for booking - try multiple possible locations
      let doctorId = null;
      
      if (selectedDoctor._id) {
        doctorId = selectedDoctor._id;
      } else if (selectedDoctor.userId) {
        doctorId = typeof selectedDoctor.userId === 'string' 
          ? selectedDoctor.userId 
          : selectedDoctor.userId._id;
      }
      
      console.log('Doctor ID for booking:', doctorId);
      console.log('Selected doctor object:', selectedDoctor);
      
      if (!doctorId) {
        throw new Error('Doctor ID not found. Please select a doctor again.');
      }

      const appointmentData = {
        doctorId: doctorId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        appointmentType,
        reason: reason.trim()
      };
      
      console.log('Booking appointment with data:', appointmentData);
      
      const response = await appointmentAPI.bookAppointment(appointmentData);
      console.log('Booking response:', response);
      
      setCurrentStep(4);
    } catch (err) {
      console.error('Error booking appointment:', err);
      let errorMessage = 'Failed to book appointment. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    // Handle different data structures more robustly
    const doctorUser = doctor.userId || doctor;
    const doctorName = doctorUser?.fullName || doctor?.fullName || '';
    const doctorSpecialty = doctor.speciality || '';
    
    const matchesSearch = doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctorSpecialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = specialtyFilter === 'all' || doctorSpecialty === specialtyFilter;
    
    return matchesSearch && matchesSpecialty;
  });

  const availableDates = generateAvailableDates();
  const availableTimeSlots = getAvailableTimeSlots();

  // Get unique specialties for filter
  const specialties = [...new Set(doctors.map(doctor => doctor.speciality).filter(Boolean))];

  const renderStep1 = () => (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select a Doctor</h2>
        <p className="text-muted-foreground">Choose the healthcare provider you'd like to see</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name or specialty"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={specialtyFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSpecialtyFilter('all')}
            className="bg-background border-border"
          >
            All Specialties
          </Button>
          {specialties.map(specialty => (
            <Button
              key={specialty}
              variant={specialtyFilter === specialty ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSpecialtyFilter(specialty)}
              className="bg-background border-border"
            >
              {specialty}
            </Button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading doctors...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-8 text-red-600 bg-background rounded-lg p-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <Button 
            onClick={loadDoctors} 
            variant="outline" 
            size="sm" 
            className="ml-4"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Doctor Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-lg">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No doctors found matching your criteria.</p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => {
              // Handle different data structures
              const doctorUser = doctor.userId || doctor;
              const doctorName = doctorUser?.fullName || doctor?.fullName || 'Unknown Doctor';
              const doctorSpecialty = doctor.speciality || 'General';
              
              return (
                <Card 
                  key={doctor._id || doctor.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow bg-card border-border"
                  onClick={() => handleDoctorSelect(doctor)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={doctorUser?.profilePicture} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {doctorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {doctorName}
                          </h3>
                          {doctor.isVerified && (
                            <Shield className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <Badge variant="secondary" className="mb-2">
                          {doctorSpecialty}
                          {doctor.speciality === 'Other' && doctor.otherSpeciality && 
                            ` - ${doctor.otherSpeciality}`
                          }
                        </Badge>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            {doctor.rating || 'New'}
                            {doctor.totalReviews > 0 && ` (${doctor.totalReviews})`}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {doctor.yearsOfExperience || 0}+ years
                          </div>
                        </div>
                        {doctor.clinicInfo?.clinicName && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {doctor.clinicInfo.clinicName}
                          </p>
                        )}
                      </div>
                      <Button className="bg-primary hover:bg-primary/90">Select Doctor</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => {
    const doctorUser = selectedDoctor?.userId || selectedDoctor;
    const doctorName = doctorUser?.fullName || selectedDoctor?.fullName || 'Unknown Doctor';
    
    return (
      <div className="min-h-screen bg-background">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Select Date & Time</h2>
          <p className="text-muted-foreground">Choose your preferred appointment slot</p>
        </div>

        {/* Selected Doctor Info */}
        <Card className="mb-6 bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={doctorUser?.profilePicture} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {doctorName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{doctorName}</h3>
                <p className="text-sm text-muted-foreground">{selectedDoctor?.speciality}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Date Selection */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Select Date</h3>
              <div className="grid grid-cols-2 gap-2">
                {availableDates.map((date) => (
                  <Button
                    key={date}
                    variant={selectedDate === date ? 'default' : 'secondary'}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedTime(''); // Reset time when date changes
                      setError(null); // Clear any previous errors
                    }}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <span className="text-xs">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="font-medium">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Select Time</h3>
              {!selectedDate ? (
                <p className="text-muted-foreground">Please select a date first</p>
              ) : loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                  <span className="text-muted-foreground">Loading availability...</span>
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <p className="text-muted-foreground">No available slots for this date</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableTimeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'secondary'}
                      onClick={() => setSelectedTime(time)}
                      className="justify-center"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setCurrentStep(1)} className="bg-card border-border">
            Back
          </Button>
          <Button 
            onClick={handleDateTimeSelect} 
            disabled={!selectedDate || !selectedTime}
            className="bg-primary hover:bg-primary/90"
          >
            Continue
          </Button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    const doctorUser = selectedDoctor?.userId || selectedDoctor;
    const doctorName = doctorUser?.fullName || selectedDoctor?.fullName || 'Unknown Doctor';
    
    return (
      <div className="min-h-screen bg-background">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Appointment Details</h2>
          <p className="text-muted-foreground">Provide additional information about your visit</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Appointment Type */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <Label className="text-lg font-medium text-foreground mb-4 block">Appointment Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointmentTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer border-2 transition-colors ${
                      appointmentType === type.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/30 bg-card'
                    }`}
                    onClick={() => setAppointmentType(type.id)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium text-foreground">{type.name}</h4>
                      <p className="text-sm text-muted-foreground">{type.duration}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reason for Visit */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <Label htmlFor="reason" className="text-lg font-medium text-foreground">
                Reason for Visit *
              </Label>
              <Textarea
                id="reason"
                placeholder="Please describe your symptoms or the reason for this appointment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2 bg-background border-border"
                rows={4}
                maxLength={500}
              />
              <div className="text-sm text-muted-foreground mt-1">
                {reason.length}/500 characters
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor:</span>
                <span className="text-foreground">{doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Specialty:</span>
                <span className="text-foreground">{selectedDoctor?.speciality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="text-foreground">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="text-foreground">
                  {appointmentTypes.find(t => t.id === appointmentType)?.name || 'Not selected'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setCurrentStep(2)} className="bg-card border-border">
            Back
          </Button>
          <Button 
            onClick={handleBookingConfirm} 
            disabled={!appointmentType || !reason.trim() || bookingLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {bookingLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              'Book Appointment'
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    const doctorUser = selectedDoctor?.userId || selectedDoctor;
    const doctorName = doctorUser?.fullName || selectedDoctor?.fullName || 'Unknown Doctor';
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Appointment Booked Successfully!</h2>
          <p className="text-muted-foreground mb-6">
            Your appointment request has been sent to {doctorName}. 
            You'll receive a confirmation email and notification once the doctor accepts your request.
          </p>

          <Card className="text-left mb-6 bg-card border-border">
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor:</span>
                <span className="text-foreground">{doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground">
                  {new Date(selectedDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="text-foreground">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="text-foreground">
                  {appointmentTypes.find(t => t.id === appointmentType)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary">Pending Confirmation</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/patient-dashboard')}
              className="bg-card border-border"
            >
              Back to Dashboard
            </Button>
            <Button onClick={() => {
              // Reset form for new booking
              setCurrentStep(1);
              setSelectedDoctor(null);
              setSelectedDate('');
              setSelectedTime('');
              setAppointmentType('');
              setReason('');
              setError(null);
              setAvailability(null);
            }}
            className="bg-primary hover:bg-primary/90"
            >
              Book Another Appointment
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
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
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of 4
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-4 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Select Doctor</span>
            <span>Date & Time</span>
            <span>Details</span>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default BookAppointment;