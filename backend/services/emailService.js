// import nodemailer from 'nodemailer';

// let transporter = null;
// let transporterSecondary = null;
// let transporterReady = false;
// let transporterSecondaryReady = false;
// let transporterError = null;
// let transporterSecondaryError = null;

// /**
//  * Initialize email transporter with proper configuration
//  * This runs once at startup and doesn't crash if it fails
//  */
// export const initializeEmailService = async () => {
//   try {
//     const gmailUser = process.env.GMAIL_USER;
//     const gmailPass = process.env.GMAIL_PASSWORD;
//     const gmailUserSecondary = process.env.GMAIL_USER_SECONDARY;
//     const gmailPassSecondary = process.env.GMAIL_PASSWORD_SECONDARY;

//     if (!gmailUser || !gmailPass) {
//       console.error('❌ EMAIL SERVICE: Missing GMAIL_USER or GMAIL_PASSWORD environment variables');
//       transporterReady = false;
//       transporterError = 'Email credentials not configured';
//       return null;
//     }

//     // Initialize primary transporter
//     transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: true, // Use TLS
//       auth: {
//         user: gmailUser,
//         pass: gmailPass
//       },
//       pool: {
//         maxConnections: 5,
//         maxMessages: 100,
//         rateDelta: 4000,
//         rateLimit: 14
//       }
//     });

//     // Initialize secondary transporter if credentials provided
//     if (gmailUserSecondary && gmailPassSecondary) {
//       transporterSecondary = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 465,
//         secure: true,
//         auth: {
//           user: gmailUserSecondary,
//           pass: gmailPassSecondary
//         },
//         pool: {
//           maxConnections: 5,
//           maxMessages: 100,
//           rateDelta: 4000,
//           rateLimit: 14
//         }
//       });

//       console.log('✅ EMAIL SERVICE: Secondary transporter configured');
//     }

//     // Verify primary connection at startup (blocking)
//     return new Promise((resolve) => {
//       transporter.verify((error, success) => {
//         if (error) {
//           console.error('❌ EMAIL SERVICE: Verification failed -', error.message);
//           console.error('   Code:', error.code);
//           console.error('   SMTP will retry automatically');
//           transporterReady = false;
//           transporterError = error.message;
//           resolve(false);
//         } else {
//           console.log('✅ EMAIL SERVICE: SMTP connection verified and ready');
//           transporterReady = true;
//           transporterError = null;
          
//           // Verify secondary if available
//           if (transporterSecondary) {
//             transporterSecondary.verify((secondaryError, secondarySuccess) => {
//               if (secondaryError) {
//                 console.warn('⚠️  EMAIL SERVICE: Secondary transporter verification failed -', secondaryError.message);
//                 transporterSecondaryReady = false;
//                 transporterSecondaryError = secondaryError.message;
//               } else {
//                 console.log('✅ EMAIL SERVICE: Secondary transporter verified and ready');
//                 transporterSecondaryReady = true;
//                 transporterSecondaryError = null;
//               }
//             });
//           }
          
//           resolve(true);
//         }
//       });
//     });
//   } catch (error) {
//     console.error('❌ EMAIL SERVICE: Initialization failed -', error.message);
//     transporterReady = false;
//     transporterError = error.message;
//     return false;
//   }
// };

// /**
//  * Send email with automatic retry and fail-safe design
//  * Options: { mailOptions, emailType: 'primary|secondary', retries: 2 }
//  * Returns { success: boolean, error?: string }
//  */
// export const sendEmail = async (mailOptions, emailType = 'primary', retries = 2) => {
//   try {
//     const selectedTransporter = emailType === 'secondary' && transporterSecondary ? transporterSecondary : transporter;
    
//     if (!selectedTransporter) {
//       console.warn(`⚠️  EMAIL: ${emailType} transporter not initialized`);
//       return { success: false, error: 'Email service not initialized' };
//     }

//     // Attempt to send with retry logic
//     for (let attempt = 1; attempt <= retries; attempt++) {
//       try {
//         const info = await selectedTransporter.sendMail(mailOptions);
//         console.log(`✅ EMAIL SENT [${emailType}]: ${mailOptions.subject} to ${mailOptions.to} (MessageID: ${info.messageId})`);
//         return { success: true };
//       } catch (error) {
//         console.warn(`⚠️  EMAIL FAILED (Attempt ${attempt}/${retries}): ${error.message}`);
        
//         if (attempt < retries) {
//           // Wait before retry
//           await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
//           continue;
//         } else {
//           // All retries exhausted
//           console.error(`❌ EMAIL FAILED after ${retries} attempts:`, error.message);
//           return { success: false, error: error.message };
//         }
//       }
//     }
//   } catch (error) {
//     console.error('❌ EMAIL SERVICE ERROR:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// /**
//  * Send email without blocking - fire and forget with logging
//  */
// export const sendEmailAsync = (mailOptions, emailType = 'primary') => {
//   const selectedTransporter = emailType === 'secondary' && transporterSecondary ? transporterSecondary : transporter;
  
//   if (!selectedTransporter) {
//     console.warn(`⚠️  EMAIL: ${emailType} transporter not initialized, skipping async send`);
//     return;
//   }

//   selectedTransporter.sendMail(mailOptions).catch(error => {
//     console.warn(`⚠️  ASYNC EMAIL FAILED [${emailType}]: ${error.message} (to: ${mailOptions.to})`);
//   });
// };

// /**
//  * Get email service status
//  */
// export const getEmailServiceStatus = () => {
//   return {
//     primary: {
//       ready: transporterReady,
//       error: transporterError,
//       configured: !!process.env.GMAIL_USER && !!process.env.GMAIL_PASSWORD
//     },
//     secondary: {
//       ready: transporterSecondaryReady,
//       error: transporterSecondaryError,
//       configured: !!process.env.GMAIL_USER_SECONDARY && !!process.env.GMAIL_PASSWORD_SECONDARY
//     }
//   };
// };

// export default {
//   initializeEmailService,
//   sendEmail,
//   sendEmailAsync,
//   getEmailServiceStatus
// };



import nodemailer from 'nodemailer';

let transporterPrimary = null;
let transporterSecondary = null;

let primaryReady = false;
let secondaryReady = false;

let primaryError = null;
let secondaryError = null;

/**
 * Initialize Email Service
 */
export const initializeEmailService = async () => {
  try {
    const {
      GMAIL_USER,
      GMAIL_PASSWORD,
      GMAIL_USER_SECONDARY,
      GMAIL_PASSWORD_SECONDARY
    } = process.env;

    /* PRIMARY – CONTACT / SUPPORT */
    if (GMAIL_USER && GMAIL_PASSWORD) {
      transporterPrimary = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_PASSWORD
        }
      });

      transporterPrimary.verify((err) => {
        if (err) {
          primaryReady = false;
          primaryError = err.message;
          console.error('❌ PRIMARY MAIL FAILED:', err.message);
        } else {
          primaryReady = true;
          primaryError = null;
          console.log('✅ PRIMARY MAIL READY:', GMAIL_USER);
        }
      });
    }

    /* SECONDARY – SERVICES / ADMIN */
    if (GMAIL_USER_SECONDARY && GMAIL_PASSWORD_SECONDARY) {
      transporterSecondary = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: GMAIL_USER_SECONDARY,
          pass: GMAIL_PASSWORD_SECONDARY
        }
      });

      transporterSecondary.verify((err) => {
        if (err) {
          secondaryReady = false;
          secondaryError = err.message;
          console.error('❌ SECONDARY MAIL FAILED:', err.message);
        } else {
          secondaryReady = true;
          secondaryError = null;
          console.log('✅ SECONDARY MAIL READY:', GMAIL_USER_SECONDARY);
        }
      });
    }
  } catch (err) {
    console.error('❌ EMAIL INIT ERROR:', err.message);
  }
};

/**
 * Send Email (STRICT ROUTING)
 */
export const sendEmail = async (mailOptions, emailType = 'primary', retries = 2) => {
  const transporter =
    emailType === 'secondary' ? transporterSecondary : transporterPrimary;

  if (!transporter) {
    return { success: false, error: 'Email transporter not initialized' };
  }

  for (let i = 1; i <= retries; i++) {
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (err) {
      if (i === retries) {
        return { success: false, error: err.message };
      }
      await new Promise(r => setTimeout(r, 1000 * i));
    }
  }
};

/**
 * Status helper
 */
export const getEmailServiceStatus = () => ({
  primary: {
    ready: primaryReady,
    error: primaryError,
    email: process.env.GMAIL_USER
  },
  secondary: {
    ready: secondaryReady,
    error: secondaryError,
    email: process.env.GMAIL_USER_SECONDARY
  }
});

export default {
  initializeEmailService,
  sendEmail,
  getEmailServiceStatus
};
