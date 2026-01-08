import nodemailer from 'nodemailer';

let transporter = null;
let transporterReady = false;
let transporterError = null;

/**
 * Initialize email transporter with proper configuration
 * This runs once at startup and doesn't crash if it fails
 */
export const initializeEmailService = async () => {
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.error('❌ EMAIL SERVICE: Missing GMAIL_USER or GMAIL_PASSWORD environment variables');
      transporterReady = false;
      transporterError = 'Email credentials not configured';
      return null;
    }

    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use TLS
      auth: {
        user: gmailUser,
        pass: gmailPass
      },
      pool: {
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 4000,
        rateLimit: 14
      }
    });

    // Verify connection at startup (blocking)
    return new Promise((resolve) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('❌ EMAIL SERVICE: Verification failed -', error.message);
          console.error('   Code:', error.code);
          console.error('   SMTP will retry automatically');
          transporterReady = false;
          transporterError = error.message;
          resolve(false);
        } else {
          console.log('✅ EMAIL SERVICE: SMTP connection verified and ready');
          transporterReady = true;
          transporterError = null;
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('❌ EMAIL SERVICE: Initialization failed -', error.message);
    transporterReady = false;
    transporterError = error.message;
    return false;
  }
};

/**
 * Send email with automatic retry and fail-safe design
 * Returns { success: boolean, error?: string }
 */
export const sendEmail = async (mailOptions, retries = 2) => {
  try {
    if (!transporter) {
      console.warn('⚠️  EMAIL: Transporter not initialized');
      return { success: false, error: 'Email service not initialized' };
    }

    // Attempt to send with retry logic
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ EMAIL SENT: ${mailOptions.subject} to ${mailOptions.to} (MessageID: ${info.messageId})`);
        return { success: true };
      } catch (error) {
        console.warn(`⚠️  EMAIL FAILED (Attempt ${attempt}/${retries}): ${error.message}`);
        
        if (attempt < retries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        } else {
          // All retries exhausted
          console.error(`❌ EMAIL FAILED after ${retries} attempts:`, error.message);
          return { success: false, error: error.message };
        }
      }
    }
  } catch (error) {
    console.error('❌ EMAIL SERVICE ERROR:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send email without blocking - fire and forget with logging
 */
export const sendEmailAsync = (mailOptions) => {
  if (!transporter) {
    console.warn('⚠️  EMAIL: Transporter not initialized, skipping async send');
    return;
  }

  transporter.sendMail(mailOptions).catch(error => {
    console.warn(`⚠️  ASYNC EMAIL FAILED: ${error.message} (to: ${mailOptions.to})`);
  });
};

/**
 * Get email service status
 */
export const getEmailServiceStatus = () => {
  return {
    ready: transporterReady,
    error: transporterError,
    configured: !!process.env.GMAIL_USER && !!process.env.GMAIL_PASSWORD
  };
};

export default {
  initializeEmailService,
  sendEmail,
  sendEmailAsync,
  getEmailServiceStatus
};
