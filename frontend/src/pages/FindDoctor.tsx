import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Stethoscope,
  Star,
  MapPin,
  Clock,
  Bell,
  User
} from 'lucide-react';
import doctorEmily from '@/assets/doctor-emily-carter.jpg';
import doctorEthan from '@/assets/doctor-ethan-bennett.jpg';
import doctorOlivia from '@/assets/doctor-olivia-hayes.jpg';
import doctorRobert from '@/assets/doctor-robert-harris.jpg';

const FindDoctor = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const doctors = [
    {
      id: 1,
      name: 'Dr. Amelia Carter',
      specialty: 'Cardiology',
      image: doctorEmily,
      rating: 4.8,
      experience: '15+ years',
      description: 'Dr. Carter is a renowned cardiologist with over 15 years of experience in treating heart conditions.',
      location: 'New York, NY'
    },
    {
      id: 2,
      name: 'Dr. Ethan Bennett',
      specialty: 'Pediatrics',
      image: doctorEthan,
      rating: 4.9,
      experience: '8+ years',
      description: 'Dr. Bennett is a compassionate pediatrician dedicated to the health and well-being of children.',
      location: 'Los Angeles, CA'
    },
    {
      id: 3,
      name: 'Dr. Olivia Hayes',
      specialty: 'Dermatology',
      image: doctorOlivia,
      rating: 4.7,
      experience: '12+ years',
      description: 'Dr. Hayes specializes in skin care, treating a wide range of dermatological issues with expertise.',
      location: 'Chicago, IL'
    },
    {
      id: 4,
      name: 'Dr. Noah Thompson',
      specialty: 'Orthopedics',
      image: doctorRobert,
      rating: 4.6,
      experience: '10+ years',
      description: 'Dr. Thompson is an orthopedic surgeon known for his expertise in sports injuries and joint replacement.',
      location: 'Miami, FL'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">HealthFirst</span>
          </div>
          <div className="flex space-x-6">
            <button onClick={() => navigate('/patient-dashboard')} className="text-muted-foreground hover:text-foreground">Home</button>
            <button className="text-primary font-medium">Find a Doctor</button>
            <button onClick={() => navigate('/appointments')} className="text-primary font-medium">Appointments</button>
            <button onClick={() => navigate('/messages')} className="text-muted-foreground hover:text-foreground">Messages</button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="w-5 h-5 text-muted-foreground cursor-pointer" />
          <Avatar className="w-8 h-8 cursor-pointer">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">JM</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium text-foreground">Jessica Miller</div>
            <div className="text-muted-foreground">Patient</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Find a Doctor</h1>
            <p className="text-muted-foreground">Search for doctors and book appointments with ease.</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialty"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground"
                />
              </div>
              <Button className="px-8">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="flex gap-4">
              <Button variant="secondary" className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Specialty: All
              </Button>
              <Button variant="secondary" className="flex items-center">
                Insurance: All
              </Button>
              <Button variant="secondary" className="flex items-center">
                Language: English
              </Button>
              <Button variant="secondary" className="flex items-center">
                Gender: Any
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Available Doctors (4)</h2>
          </div>

          {/* Doctor Cards */}
          <div className="grid gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="bg-healthcare-card border-border">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Doctor Image */}
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={doctor.image} 
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>

                    {/* Doctor Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-1">{doctor.name}</h3>
                          <Badge variant="secondary" className="mb-2">{doctor.specialty}</Badge>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              {doctor.rating}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {doctor.experience}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {doctor.location}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">{doctor.description}</p>

                      <div className="flex gap-3">
                        <Button onClick={() => navigate('/book-appointment')}>Book Now</Button>
                        <Button variant="secondary">View Profile</Button>
                      </div>
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

export default FindDoctor;