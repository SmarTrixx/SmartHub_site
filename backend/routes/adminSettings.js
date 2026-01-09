import express from 'express';
import { getEmailServiceStatus } from '../services/emailService.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/admin/settings - Get admin settings (email config, etc.)
 * Requires admin authentication
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const emailStatus = getEmailServiceStatus();

    res.json({
      success: true,
      settings: {
        email: {
          primaryAccount: {
            email: process.env.GMAIL_USER ? process.env.GMAIL_USER.split('@')[0] + '@...' : 'Not configured',
            status: emailStatus.primary.ready ? 'connected' : 'disconnected',
            error: emailStatus.primary.error || null,
            configured: emailStatus.primary.configured
          },
          secondaryAccount: {
            email: process.env.GMAIL_USER_SECONDARY ? process.env.GMAIL_USER_SECONDARY.split('@')[0] + '@...' : 'Not configured',
            status: emailStatus.secondary.ready ? 'connected' : 'disconnected',
            error: emailStatus.secondary.error || null,
            configured: emailStatus.secondary.configured
          }
        }
      },
      systemStatus: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        emailService: {
          primary: emailStatus.primary,
          secondary: emailStatus.secondary
        }
      }
    });
  } catch (error) {
    console.error('❌ ADMIN SETTINGS ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin settings'
    });
  }
});

/**
 * GET /api/admin/settings/email-status - Get detailed email configuration status
 * Requires admin authentication
 */
router.get('/email-status', authenticateAdmin, async (req, res) => {
  try {
    const emailStatus = getEmailServiceStatus();

    res.json({
      success: true,
      email: {
        primary: {
          configured: emailStatus.primary.configured,
          ready: emailStatus.primary.ready,
          error: emailStatus.primary.error,
          account: process.env.GMAIL_USER || 'Not configured'
        },
        secondary: {
          configured: emailStatus.secondary.configured,
          ready: emailStatus.secondary.ready,
          error: emailStatus.secondary.error,
          account: process.env.GMAIL_USER_SECONDARY || 'Not configured'
        }
      }
    });
  } catch (error) {
    console.error('❌ EMAIL STATUS ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve email status'
    });
  }
});

export default router;
