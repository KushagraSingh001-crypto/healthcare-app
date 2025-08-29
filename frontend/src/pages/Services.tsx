import React from "react";

const services = [
  {
    title: "Book Appointments",
    description: "Easily schedule appointments with your preferred doctor at your convenience.",
    icon: "📅",
  },
  {
    title: "Health Records",
    description: "Access and manage your health history, prescriptions, and reports in one place.",
    icon: "📂",
  },
  {
    title: "Video Consultations",
    description: "Connect with doctors via secure video calls for instant consultations.",
    icon: "💻",
  },
  {
    title: "AI Health Insights",
    description: "Get AI-powered insights about your health trends and recommendations.",
    icon: "🤖",
  },
  {
    title: "24/7 Support",
    description: "We’re here to help at any time with your healthcare needs.",
    icon: "📞",
  },
  {
    title: "Doctor Dashboard",
    description: "Doctors can efficiently manage patients, schedules, and prescriptions.",
    icon: "🩺",
  },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold text-foreground mb-4">Our Services</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          At HealthConnect, we bring doctors and patients together with powerful digital tools.  
          Here’s what we offer to make your healthcare experience seamless.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-healthcare-card hover:bg-healthcare-card-hover rounded-2xl p-8 shadow-md transition-transform duration-300 hover:scale-105 border border-border"
          >
            <div className="text-5xl mb-6">{service.icon}</div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">{service.title}</h3>
            <p className="text-muted-foreground">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
