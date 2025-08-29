import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background p-10">
      <h1 className="text-4xl font-bold mb-6 text-foreground">Contact Us</h1>
      <p className="text-lg text-muted-foreground max-w-3xl mb-6">
        Have questions or need support? Reach out to us!
      </p>
      <p className="text-lg text-muted-foreground">📧 Email: support@healthconnect.com</p>
      <p className="text-lg text-muted-foreground">📞 Phone: +91 98765 43210</p>
    </div>
  );
};

export default Contact;
