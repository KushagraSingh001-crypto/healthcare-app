import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Camera, 
  Save, 
  Edit,
  Stethoscope,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Sophia Clark',
    email: 'sophia.clark@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1993-05-15',
    address: '123 Main St, New York, NY 10001',
    emergencyContact: 'John Clark - +1 (555) 987-6543',
    bloodType: 'O+',
    allergies: 'Penicillin, Shellfish'
  });

  const handleSave = () => {
    // Here you would save the profile data to your backend
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

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
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <Card className="bg-healthcare-card border-border">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      SC
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-foreground">{profileData.fullName}</CardTitle>
                <p className="text-muted-foreground">Patient</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{profileData.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{profileData.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">Age 30</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">New York, NY</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-healthcare-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="mt-1 bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.fullName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1 bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1 bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.phone}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-foreground">Date of Birth</Label>
                    {isEditing ? (
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="mt-1 bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-foreground">Address</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="mt-1 bg-input border-border text-foreground"
                    />
                  ) : (
                    <p className="mt-1 text-foreground">{profileData.address}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="bg-healthcare-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodType" className="text-foreground">Blood Type</Label>
                    {isEditing ? (
                      <Input
                        id="bloodType"
                        value={profileData.bloodType}
                        onChange={(e) => handleInputChange('bloodType', e.target.value)}
                        className="mt-1 bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.bloodType}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact" className="text-foreground">Emergency Contact</Label>
                    {isEditing ? (
                      <Input
                        id="emergencyContact"
                        value={profileData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        className="mt-1 bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.emergencyContact}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="allergies" className="text-foreground">Allergies</Label>
                  {isEditing ? (
                    <Input
                      id="allergies"
                      value={profileData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      className="mt-1 bg-input border-border text-foreground"
                    />
                  ) : (
                    <p className="mt-1 text-foreground">{profileData.allergies}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;