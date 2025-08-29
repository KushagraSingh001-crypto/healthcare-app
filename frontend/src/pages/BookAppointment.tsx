import React, { useState } from 'react';
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
  Star
} from 'lucide-react';
import doctorEmily from '@/assets/doctor-emily-carter.jpg';
import doctorEthan from '@/assets/doctor-ethan-bennett.jpg';
import doctorOlivia from '@/assets/doctor-olivia-hayes.jpg';
import doctorRobert from '@/assets/doctor-robert-harris.jpg';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Backend Integration - Fetch doctors from database
  // This should be replaced with actual API call to get doctors
  const doctors = [
    {
      id: 1,
      name: 'Dr. Emily Carter',
      specialty: 'General Practitioner',
      image: doctorEmily,
      rating: 4.8,
      experience: '15+ years',
      nextAvailable: '2023-12-18',
      // TODO: Backend - Fetch real availability from doctor's schedule
      availableSlots: ['09:00', '10:30', '11:00', '14:00', '15:30', '16:00']
    },
    {
      id: 2,
      name: 'Dr. Ethan Bennett',
      specialty: 'Pediatrics',
      image: doctorEthan,
      rating: 4.9,
      experience: '8+ years',
      nextAvailable: '2023-12-19',
      availableSlots: ['10:00', '11:30', '13:00', '14:30', '16:00']
    },
    {
      id: 3,
      name: 'Dr. Olivia Hayes',
      specialty: 'Dermatology',
      image: doctorOlivia,
      rating: 4.7,
      experience: '12+ years',
      nextAvailable: '2023-12-20',
      availableSlots: ['09:30', '11:00', '13:30', '15:00', '16:30']
    },
    {
      id: 4,
      name: 'Dr. Robert Harris',
      specialty: 'Cardiology',
      image: doctorRobert,
      rating: 4.6,
      experience: '10+ years',
      nextAvailable: '2023-12-21',
      availableSlots: ['08:30', '10:00', '11:30', '14:00', '15:30']
    }
  ];

  const appointmentTypes = [
    { id: 'consultation', name: 'General Consultation', duration: '30 min' },
    { id: 'checkup', name: 'Regular Checkup', duration: '45 min' },
    { id: 'followup', name: 'Follow-up Visit', duration: '20 min' },
    { id: 'emergency', name: 'Urgent Care', duration: '60 min' }
  ];

  // TODO: Backend Integration - Generate available dates based on doctor's schedule
  // This should fetch real availability from the database
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends for demo (this should be based on doctor's actual availability)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(2);
  };

  const handleDateTimeSelect = () => {
    if (selectedDate && selectedTime) {
      setCurrentStep(3);
    }
  };

  const handleBookingConfirm = async () => {
    // TODO: Backend Integration - Save appointment to database
    // This should include:
    // 1. Create appointment record with patient_id, doctor_id, date, time, type, reason
    // 2. Update doctor's availability (remove booked slot)
    // 3. Send confirmation email to patient and doctor
    // 4. Create notification records for both parties
    
    /*
    const appointmentData = {
      patient_id: getCurrentUserId(), // Get from auth context
      doctor_id: selectedDoctor.id,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      appointment_type: appointmentType,
      reason: reason,
      status: 'pending' // Doctor needs to accept/reject
    };
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(appointmentData)
      });
      
      if (response.ok) {
        // Send email notifications
        await sendAppointmentNotification(appointmentData);
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Failed to book appointment:', error);
    }
    */
    
    // For demo purposes, just go to confirmation
    setCurrentStep(4);
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStep1 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select a Doctor</h2>
        <p className="text-muted-foreground">Choose the healthcare provider you'd like to see</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors by name or specialty"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border text-foreground"
          />
        </div>
      </div>

      {/* Doctor Cards */}
      <div className="space-y-4">
        {filteredDoctors.map((doctor) => (
          <Card 
            key={doctor.id} 
            className="bg-healthcare-card border-border cursor-pointer hover:bg-healthcare-card-hover transition-colors"
            onClick={() => handleDoctorSelect(doctor)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={doctor.image} />
                  <AvatarFallback>DR</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{doctor.name}</h3>
                  <Badge variant="secondary" className="mb-2">{doctor.specialty}</Badge>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {doctor.rating}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {doctor.experience}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Next available: {new Date(doctor.nextAvailable).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button>Select Doctor</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Date & Time</h2>
        <p className="text-muted-foreground">Choose your preferred appointment slot</p>
      </div>

      {/* Selected Doctor Info */}
      <Card className="bg-healthcare-card border-border mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={selectedDoctor?.image} />
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{selectedDoctor?.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedDoctor?.specialty}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Date Selection */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Select Date</h3>
          <div className="grid grid-cols-2 gap-2">
            {availableDates.map((date) => (
              <Button
                key={date}
                variant={selectedDate === date ? 'default' : 'secondary'}
                onClick={() => setSelectedDate(date)}
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
        </div>

        {/* Time Selection */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Select Time</h3>
          {selectedDate ? (
            <div className="grid grid-cols-2 gap-2">
              {selectedDoctor?.availableSlots.map((time) => (
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
          ) : (
            <p className="text-muted-foreground">Please select a date first</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="secondary" onClick={() => setCurrentStep(1)}>Back</Button>
        <Button 
          onClick={handleDateTimeSelect} 
          disabled={!selectedDate || !selectedTime}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Appointment Details</h2>
        <p className="text-muted-foreground">Provide additional information about your visit</p>
      </div>

      <div className="space-y-6">
        {/* Appointment Type */}
        <div>
          <Label className="text-lg font-medium text-foreground mb-4 block">Appointment Type</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointmentTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer border-2 transition-colors ${
                  appointmentType === type.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-healthcare-card hover:border-primary/50'
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
        </div>

        {/* Reason for Visit */}
        <div>
          <Label htmlFor="reason" className="text-lg font-medium text-foreground">Reason for Visit</Label>
          <Textarea
            id="reason"
            placeholder="Please describe your symptoms or the reason for this appointment..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2 bg-input border-border text-foreground"
            rows={4}
          />
        </div>

        {/* Summary */}
        <Card className="bg-healthcare-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Appointment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Doctor:</span>
              <span className="text-foreground">{selectedDoctor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="text-foreground">{new Date(selectedDate).toLocaleDateString()}</span>
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
        <Button variant="secondary" onClick={() => setCurrentStep(2)}>Back</Button>
        <Button 
          onClick={handleBookingConfirm} 
          disabled={!appointmentType || !reason.trim()}
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center">
      <div className="w-20 h-20 bg-healthcare-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-healthcare-green" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Appointment Booked Successfully!</h2>
      <p className="text-muted-foreground mb-6">
        Your appointment request has been sent to {selectedDoctor?.name}. 
        You'll receive a confirmation once the doctor accepts your request.
      </p>

      <Card className="bg-healthcare-card border-border text-left max-w-md mx-auto mb-6">
        <CardContent className="p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Doctor:</span>
            <span className="text-foreground">{selectedDoctor?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="text-foreground">{new Date(selectedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="text-foreground">{selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant="secondary">Pending Confirmation</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-x-3">
        <Button variant="secondary" onClick={() => navigate('/patient-dashboard')}>
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
        }}>
          Book Another Appointment
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
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
      <div className="bg-healthcare-card border-b border-border">
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