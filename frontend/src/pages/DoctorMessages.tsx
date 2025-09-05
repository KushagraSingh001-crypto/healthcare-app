import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Send,
  Paperclip,
  Stethoscope,
  ArrowLeft,
  Bell,
  Phone,
  Video
} from 'lucide-react';

const DoctorMessages = () => {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');

  const messages = [
    {
      id: 1,
      sender: 'doctor',
      content: "Hello, Sarah! How are you feeling today?",
      time: '10:30 AM',
      avatar: ''
    },
    {
      id: 2,
      sender: 'patient',
      content: "Hi Dr. Carter, I'm feeling a bit better, thank you. Still experiencing some discomfort in my lower back.",
      time: '10:31 AM',
      avatar: ''
    },
    {
      id: 3,
      sender: 'doctor',
      content: "Okay, I'll adjust your medication dosage. Please take it twice a day, and let me know if the discomfort persists.",
      time: '10:32 AM',
      avatar: ''
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    // Normally send to backend
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/doctor-dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">HealthConnect</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/doctor-dashboard')}>Dashboard</Button>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/messages')}>Messages</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/doctor-profile')}>Profile</Button>
          <Bell className="w-5 h-5 text-muted-foreground cursor-pointer" />
          <Avatar className="w-8 h-8 cursor-pointer" onClick={() => navigate('/doctor-profile')}>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">DC</AvatarFallback>
          </Avatar>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground">SJ</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Sarah Johnson</h2>
                  <p className="text-sm text-muted-foreground">Patient</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'patient' && (
                    <Avatar className="w-8 h-8 mr-3">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground">SJ</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-md ${message.sender === 'doctor' ? 'order-1' : ''}`}>
                    <div className={`p-4 rounded-2xl ${
                      message.sender === 'doctor'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-healthcare-card text-foreground'
                    }`}>
                      <p>{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-2">
                      {message.sender === 'doctor' ? 'You · ' : 'Sarah Johnson · '}{message.time}
                    </p>
                  </div>
                  {message.sender === 'doctor' && (
                    <Avatar className="w-8 h-8 ml-3">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground">DC</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-border">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" type="button">
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-input border-border text-foreground"
                />
              </div>
              <Button type="submit">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Patient Info Sidebar */}
        <div className="w-80 bg-healthcare-card border-l border-border p-6">
          <div className="text-center mb-6">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">SJ</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold text-foreground mb-1">Sarah Johnson</h3>
            <p className="text-muted-foreground">Patient</p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Patient Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age</span>
                  <span className="text-foreground">32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="text-foreground">Female</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blood Type</span>
                  <span className="text-foreground">O+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition</span>
                  <span className="text-foreground">Back Pain</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Allergies</span>
                  <span className="text-foreground">None</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Recent Medical History</h4>
              <Card className="bg-background border-border">
                <CardContent className="p-4">
                  <div className="text-sm">
                    <h5 className="font-medium text-foreground mb-1">Lower Back Pain Treatment</h5>
                    <p className="text-muted-foreground">Started: Oct 15, 2024</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Upcoming Appointments</h4>
              <Card className="bg-background border-border">
                <CardContent className="p-4">
                  <div className="text-sm">
                    <h5 className="font-medium text-foreground mb-1">Follow-up Consultation</h5>
                    <p className="text-muted-foreground">December 22, 2023, 2:00 PM</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-background border-border mt-3">
                <CardContent className="p-4">
                  <div className="text-sm">
                    <h5 className="font-medium text-foreground mb-1">Physical Therapy Review</h5>
                    <p className="text-muted-foreground">January 5, 2024, 11:00 AM</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Current Medications</h4>
              <Card className="bg-background border-border">
                <CardContent className="p-4">
                  <div className="text-sm">
                    <h5 className="font-medium text-foreground mb-1">Ibuprofen 400mg</h5>
                    <p className="text-muted-foreground">Twice daily with meals</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;