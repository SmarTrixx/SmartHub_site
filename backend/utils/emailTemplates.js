// Email templates for notifications
export const emailTemplates = {
  // Contact form confirmation
  contactConfirmation: (name) => ({
    subject: 'We received your message - SmartHub Studio',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0057FF 0%, #00D4FF 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Thank you for reaching out!</h1>
        </div>
        <div style="padding: 40px 20px; background: #f9f9f9;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            We have received your message and appreciate you taking the time to contact SmartHub Studio. 
            Our team will review your inquiry and get back to you as soon as possible.
          </p>
          <div style="background: white; border-left: 4px solid #0057FF; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>Expected Response Time:</strong> 24-48 business hours
            </p>
          </div>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            In the meantime, feel free to explore our services at 
            <a href="https://smarthubz.vercel.app" style="color: #0057FF; text-decoration: none;">smarthubz.vercel.app</a>
          </p>
        </div>
        <div style="background: #22223B; color: white; padding: 30px 20px; text-align: center; font-size: 14px;">
          <p style="margin: 5px 0;">SmartHub Studio | Custom Software & Design Solutions</p>
          <p style="margin: 5px 0;">📧 contact.smarthubz@gmail.com</p>
          <p style="margin: 5px 0; color: #999;">© 2025 SmartHub Studio. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  // Admin notification
  contactAdminNotification: (name, email, message) => ({
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #22223B; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">New Contact Form Submission</h2>
        </div>
        <div style="padding: 30px 20px; background: white;">
          <div style="background: #f5f5f5; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
            <p style="margin: 0 0 10px 0;"><strong style="color: #0057FF;">Name:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0;"><strong style="color: #0057FF;">Email:</strong> 
              <a href="mailto:${email}" style="color: #0057FF; text-decoration: none;">${email}</a>
            </p>
            <p style="margin: 0;"><strong style="color: #0057FF;">Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="border-left: 4px solid #0057FF; padding: 20px; background: #f9f9f9; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #22223B;">Message:</h3>
            <p style="white-space: pre-wrap; color: #666; line-height: 1.6;">${message}</p>
          </div>
          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Action Required:</strong> Please review and respond to this inquiry.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Service request confirmation
  serviceRequestConfirmation: (name, serviceType, referenceId) => ({
    subject: `Your Service Request #${referenceId} - SmartHub Studio`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0057FF 0%, #00D4FF 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Request Received! ✓</h1>
        </div>
        <div style="padding: 40px 20px; background: #f9f9f9;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Thank you for submitting your service request! We've received your details and will begin reviewing your project needs.
          </p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 30px 0; border: 2px solid #0057FF;">
            <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">REFERENCE ID</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0057FF; font-family: monospace;">#${referenceId}</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Keep this ID for your records</p>
          </div>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong style="color: #22223B;">Service Type:</strong></p>
            <p style="margin: 0; color: #0057FF; font-size: 18px; font-weight: bold;">${serviceType}</p>
          </div>
          <h3 style="color: #22223B; margin-top: 30px;">What's Next?</h3>
          <ol style="color: #666; line-height: 1.8; font-size: 14px;">
            <li><strong>Review:</strong> Our team will carefully review your requirements (24-48 hours)</li>
            <li><strong>Contact:</strong> We'll reach out with initial feedback and timeline estimate</li>
            <li><strong>Proposal:</strong> Detailed project scope and pricing will be provided</li>
            <li><strong>Kickoff:</strong> Once approved, we'll begin your project immediately</li>
          </ol>
          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            Have questions? Reply to this email or contact us at contact.smarthubz@gmail.com
          </p>
        </div>
        <div style="background: #22223B; color: white; padding: 30px 20px; text-align: center; font-size: 14px;">
          <p style="margin: 5px 0;">SmartHub Studio | Custom Software & Design Solutions</p>
          <p style="margin: 5px 0;">📧 contact.smarthubz@gmail.com | 📱 +234 903 922 3824</p>
          <p style="margin: 5px 0; color: #999;">© 2025 SmartHub Studio. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  // Service request admin notification
  serviceRequestAdminNotification: (clientName, clientEmail, serviceType, referenceId, projectDetails) => ({
    subject: `New Service Request #${referenceId} - ${serviceType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 0 auto;">
        <div style="background: #22223B; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
          <h2 style="margin: 0; font-size: 18px;">New Service Request Submitted</h2>
        </div>
        <div style="background: white; padding: 15px; border-left: 4px solid #0057FF; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Reference ID:</strong> <code style="background: #f5f5f5; padding: 2px 4px; font-family: monospace;">${referenceId}</code></p>
          <p style="margin: 5px 0;"><strong>Service Type:</strong> ${serviceType}</p>
          <p style="margin: 5px 0;"><strong>Client Name:</strong> ${clientName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${clientEmail}" style="color: #0057FF;">${clientEmail}</a></p>
        </div>
        <h3 style="margin: 20px 0 10px 0; color: #22223B;">Project Details:</h3>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; white-space: pre-wrap; font-size: 14px; color: #666; line-height: 1.6; max-height: 200px; overflow-y: auto;">
          ${projectDetails}
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'https://smarthubz.vercel.app'}/admin/service-requests" style="background: #0057FF; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block; font-weight: bold;">
            Review in Admin Panel
          </a>
        </p>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-top: 20px;">
          <p style="margin: 0; color: #856404; font-size: 13px;">
            <strong>⚠️ Action Required:</strong> This request is waiting for your review and response.
          </p>
        </div>
      </div>
    `
  }),

  // Service request status update
  serviceRequestStatusUpdate: (name, referenceId, status, message) => {
    const statusColors = {
      'pending': '#FFA500',
      'reviewing': '#0057FF',
      'approved': '#28a745',
      'in-progress': '#6f42c1',
      'completed': '#20c997',
      'rejected': '#dc3545'
    };

    const statusMessages = {
      'pending': 'Your request is queued and will be reviewed shortly.',
      'reviewing': 'Our team is actively reviewing your project requirements.',
      'approved': 'Great news! Your project has been approved and we\'re ready to move forward.',
      'in-progress': 'Your project is now in active development/progress.',
      'completed': 'Your project is complete! We\'re preparing final deliverables.',
      'rejected': 'Unfortunately, we are unable to proceed with this request at this time.'
    };

    return {
      subject: `Update: Your Service Request #${referenceId} - ${status.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${statusColors[status]}; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; text-transform: uppercase;">Status Update</h1>
          </div>
          <div style="padding: 40px 20px; background: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 16px; color: #666; line-height: 1.6; margin-bottom: 20px;">
              ${statusMessages[status]}
            </p>
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid ${statusColors[status]};">
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">REQUEST REFERENCE ID</p>
              <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: bold; color: ${statusColors[status]}; font-family: monospace;">#${referenceId}</p>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">CURRENT STATUS</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${statusColors[status]}; text-transform: uppercase;">${status}</p>
            </div>
            ${message ? `<div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #0057FF;">Additional Notes:</h4>
              <p style="margin: 0; color: #666; font-size: 14px;">${message}</p>
            </div>` : ''}
            <p style="font-size: 14px; color: #999; margin-top: 30px;">
              If you have any questions, please don't hesitate to contact us.
            </p>
          </div>
          <div style="background: #22223B; color: white; padding: 30px 20px; text-align: center; font-size: 14px;">
            <p style="margin: 5px 0;">SmartHub Studio | Custom Software & Design Solutions</p>
            <p style="margin: 5px 0;">📧 contact.smarthubz@gmail.com | 📱 +234 903 922 3824</p>
            <p style="margin: 5px 0; color: #999;">© 2025 SmartHub Studio. All rights reserved.</p>
          </div>
        </div>
      `
    };
  }
};
