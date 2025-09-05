import React, { useState, useEffect } from 'react';
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
  Calendar,
  Loader2
} from 'lucide-react';
import { patientAPI } from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    bloodType: '',
    allergies: '',
    chronicConditions: [],
    currentMedications: [],
    age: 0,
    role: 'patient',
    isActive: true
  });

  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `Age ${age}`;
  };

  
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setError('');
      setLoading(true);
      
      const response = await patientAPI.getProfile();
      const data = response.data.data;
      
      setProfileData({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
        address: data.address || '',
        emergencyContact: data.emergencyContact || '',
        bloodType: data.bloodType || '',
        allergies: data.allergies || '',
        chronicConditions: data.chronicConditions || [],
        currentMedications: data.currentMedications || [],
        age: data.age || 0,
        role: data.role || 'patient',
        isActive: data.isActive || true
      });
      
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSaving(true);

      
      const updateData = {
        fullName: profileData.fullName.trim(),
        phone: profileData.phone.trim(),
        dateOfBirth: profileData.dateOfBirth || undefined,
        address: profileData.address.trim(),
        emergencyContact: profileData.emergencyContact.trim(),
        bloodType: profileData.bloodType,
        allergies: profileData.allergies.trim(),
        chronicConditions: profileData.chronicConditions,
        currentMedications: profileData.currentMedications
      };

      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const response = await patientAPI.updateProfile(updateData);
      const updatedData = response.data.data;
      
      
      setProfileData(prev => ({
        ...prev,
        fullName: updatedData.fullName || prev.fullName,
        phone: updatedData.phone || prev.phone,
        dateOfBirth: updatedData.dateOfBirth ? new Date(updatedData.dateOfBirth).toISOString().split('T')[0] : prev.dateOfBirth,
        address: updatedData.address || prev.address,
        emergencyContact: updatedData.emergencyContact || prev.emergencyContact,
        bloodType: updatedData.bloodType || prev.bloodType,
        allergies: updatedData.allergies || prev.allergies,
        chronicConditions: updatedData.chronicConditions || prev.chronicConditions,
        currentMedications: updatedData.currentMedications || prev.currentMedications,
        age: updatedData.age || prev.age
      }));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setError(error.response?.data?.message || 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field, value) => {
    
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setProfileData(prev => ({ ...prev, [field]: arrayValue }));
  };

  const getArrayAsString = (array) => {
    return Array.isArray(array) ? array.join(', ') : '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

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
                <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
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

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

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
                      {getInitials(profileData.fullName)}
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
                <CardTitle className="text-foreground">{profileData.fullName || 'No Name'}</CardTitle>
                <p className="text-muted-foreground">Patient</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{profileData.email || 'No email'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{profileData.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{calculateAge(profileData.dateOfBirth) || 'Age not set'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{profileData.address || 'No address'}</span>
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
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.fullName || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <p className="mt-1 text-foreground">{profileData.email || 'Not provided'}</p>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1 bg-input border-border text-foreground"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.phone || 'Not provided'}</p>
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
                      <p className="mt-1 text-foreground">
                        {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
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
                      placeholder="Enter your address"
                    />
                  ) : (
                    <p className="mt-1 text-foreground">{profileData.address || 'Not provided'}</p>
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
                      <select
                        id="bloodType"
                        value={profileData.bloodType}
                        onChange={(e) => handleInputChange('bloodType', e.target.value)}
                        className="mt-1 w-full p-2 border border-border rounded-md bg-input text-foreground"
                      >
                        <option value="">Select Blood Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.bloodType || 'Not provided'}</p>
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
                        placeholder="Name - Phone Number"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.emergencyContact || 'Not provided'}</p>
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
                      placeholder="Enter known allergies"
                    />
                  ) : (
                    <p className="mt-1 text-foreground">{profileData.allergies || 'None listed'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="chronicConditions" className="text-foreground">Chronic Conditions</Label>
                  {isEditing ? (
                    <Input
                      id="chronicConditions"
                      value={getArrayAsString(profileData.chronicConditions)}
                      onChange={(e) => handleArrayInputChange('chronicConditions', e.target.value)}
                      className="mt-1 bg-input border-border text-foreground"
                      placeholder="Separate conditions with commas"
                    />
                  ) : (
                    <p className="mt-1 text-foreground">
                      {profileData.chronicConditions?.length > 0 
                        ? profileData.chronicConditions.join(', ') 
                        : 'None listed'
                      }
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="currentMedications" className="text-foreground">Current Medications</Label>
                  {isEditing ? (
                    <Input
                      id="currentMedications"
                      value={getArrayAsString(profileData.currentMedications)}
                      onChange={(e) => handleArrayInputChange('currentMedications', e.target.value)}
                      className="mt-1 bg-input border-border text-foreground"
                      placeholder="Separate medications with commas"
                    />
                  ) : (
                    <p className="mt-1 text-foreground">
                      {profileData.currentMedications?.length > 0 
                        ? profileData.currentMedications.join(', ') 
                        : 'None listed'
                      }
                    </p>
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