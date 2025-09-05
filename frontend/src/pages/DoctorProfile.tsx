import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select';
import {
  ArrowLeft,
  Camera,
  Save,
  Edit,
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { doctorAPI } from '../services/api';

const specialities = [
  'General Practitioner',
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Psychiatrist',
  'Radiologist',
  'Other',
];

const DoctorProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    speciality: '',
    otherSpeciality: '',
    yearsOfExperience: 0,
    clinicName: '',
    clinicAddress: '',
    bio: '',
    licenseNumber: '',
    education: ''
  });

  
  useEffect(() => {
    loadDoctorProfile();
  }, []);

  const loadDoctorProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await doctorAPI.getProfile();
      const profile = response.data.data;
      
      
      setProfileData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        speciality: profile.speciality || '',
        otherSpeciality: profile.otherSpeciality || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        clinicName: profile.clinicInfo?.clinicName || '',
        clinicAddress: profile.clinicInfo?.clinicAddress || '',
        bio: profile.bio || '',
        licenseNumber: profile.licenseNumber || '',
        education: profile.education || ''
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      
      const updateData = {
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        speciality: profileData.speciality,
        otherSpeciality: profileData.speciality === 'Other' ? profileData.otherSpeciality : '',
        yearsOfExperience: profileData.yearsOfExperience || 0,
        licenseNumber: profileData.licenseNumber,
        education: profileData.education,
        clinicInfo: {
          clinicName: profileData.clinicName,
          clinicAddress: profileData.clinicAddress
        },
        bio: profileData.bio
      };

      const response = await doctorAPI.updateProfile(updateData);
      
      
      const updatedProfile = response.data.data;
      setProfileData({
        fullName: updatedProfile.fullName || '',
        email: updatedProfile.email || '',
        phone: updatedProfile.phone || '',
        speciality: updatedProfile.speciality || '',
        otherSpeciality: updatedProfile.otherSpeciality || '',
        yearsOfExperience: updatedProfile.yearsOfExperience || 0,
        clinicName: updatedProfile.clinicInfo?.clinicName || '',
        clinicAddress: updatedProfile.clinicInfo?.clinicAddress || '',
        bio: updatedProfile.bio || '',
        licenseNumber: updatedProfile.licenseNumber || '',
        education: updatedProfile.education || ''
      });

      setIsEditing(false);
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadDoctorProfile(); 
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/doctor-dashboard')}>
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
                <Button variant="secondary" onClick={handleCancel} disabled={saving}>
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
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
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
                      {profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
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
                <p className="text-muted-foreground">
                  {profileData.speciality === 'Other' && profileData.otherSpeciality
                    ? profileData.otherSpeciality
                    : profileData.speciality}
                </p>
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
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{profileData.yearsOfExperience} years experience</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{profileData.clinicName}</span>
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
                        required
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
                        required
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
                    <Label htmlFor="licenseNumber" className="text-foreground">License Number</Label>
                    {isEditing ? (
                      <Input
                        id="licenseNumber"
                        value={profileData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        className="mt-1 bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.licenseNumber}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="education" className="text-foreground">Education</Label>
                  {isEditing ? (
                    <Input
                      id="education"
                      value={profileData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      className="mt-1 bg-input border-border text-foreground"
                    />
                  ) : (
                    <p className="mt-1 text-foreground">{profileData.education}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="bg-healthcare-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="speciality" className="text-foreground">Speciality</Label>
                    {isEditing ? (
                      <Select value={profileData.speciality} onValueChange={(value) => handleInputChange('speciality', value)}>
                        <SelectTrigger className="mt-1 bg-input border-border">
                          <SelectValue placeholder="Select speciality" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialities.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-foreground">
                        {profileData.speciality === 'Other' && profileData.otherSpeciality
                          ? profileData.otherSpeciality
                          : profileData.speciality}
                      </p>
                    )}
                  </div>
                  {isEditing && profileData.speciality === 'Other' && (
                    <div>
                      <Label htmlFor="otherSpeciality" className="text-foreground">Other Speciality</Label>
                      <Input
                        id="otherSpeciality"
                        value={profileData.otherSpeciality}
                        onChange={(e) => handleInputChange('otherSpeciality', e.target.value)}
                        className="mt-1 bg-input border-border text-foreground"
                        placeholder="Specify your speciality"
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="yearsOfExperience" className="text-foreground">Years of Experience</Label>
                    {isEditing ? (
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        min="0"
                        value={profileData.yearsOfExperience}
                        onChange={(e) =>
                          handleInputChange(
                            'yearsOfExperience',
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="mt-1 bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.yearsOfExperience} years</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="clinicName" className="text-foreground">Clinic/Hospital Name</Label>
                    {isEditing ? (
                      <Input
                        id="clinicName"
                        value={profileData.clinicName}
                        onChange={(e) => handleInputChange('clinicName', e.target.value)}
                        className="mt-1 bg-input border-border text-foreground"
                      />
                    ) : (
                      <p className="mt-1 text-foreground">{profileData.clinicName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="clinicAddress" className="text-foreground">Clinic Address</Label>
                  {isEditing ? (
                    <Input
                      id="clinicAddress"
                      value={profileData.clinicAddress}
                      onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                      className="mt-1 bg-input border-border text-foreground"
                    />
                  ) : (
                    <p className="mt-1 text-foreground">{profileData.clinicAddress}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bio" className="text-foreground">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="mt-1 bg-input border-border text-foreground min-h-[120px]"
                      placeholder="Tell patients about yourself, your experience, and approach to healthcare..."
                    />
                  ) : (
                    <p className="mt-1 text-foreground">{profileData.bio || 'No bio provided'}</p>
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

export default DoctorProfile;