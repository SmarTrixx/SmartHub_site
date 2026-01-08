// Session management for admin authentication
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
const WARNING_THRESHOLD = 7 * 60 * 60 * 1000; // 7 hours before timeout
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity

let sessionTimer = null;
let inactivityTimer = null;
let lastActivityTime = null;

export const sessionManager = {
  // Initialize session tracking
  init: (onSessionExpired) => {
    lastActivityTime = Date.now();
    
    // Clear previous timers
    if (sessionTimer) clearTimeout(sessionTimer);
    if (inactivityTimer) clearTimeout(inactivityTimer);

    // Absolute session timeout (8 hours)
    sessionTimer = setTimeout(() => {
      sessionManager.logout(onSessionExpired, 'Session expired. Please log in again.');
    }, SESSION_TIMEOUT);

    // Inactivity timeout (30 minutes)
    inactivityTimer = setTimeout(() => {
      if (Date.now() - lastActivityTime >= INACTIVITY_TIMEOUT) {
        sessionManager.logout(onSessionExpired, 'You have been logged out due to inactivity.');
      }
    }, INACTIVITY_TIMEOUT);

    // Track user activity
    const trackActivity = () => {
      lastActivityTime = Date.now();
      
      // Reset inactivity timer
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (Date.now() - lastActivityTime >= INACTIVITY_TIMEOUT) {
          sessionManager.logout(onSessionExpired, 'You have been logged out due to inactivity.');
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Listen for user activity
    document.addEventListener('click', trackActivity);
    document.addEventListener('keypress', trackActivity);
    document.addEventListener('mousemove', trackActivity);
  },

  // Logout and clear session
  logout: (callback, message) => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('sessionStartTime');
    
    if (sessionTimer) clearTimeout(sessionTimer);
    if (inactivityTimer) clearTimeout(inactivityTimer);
    
    if (callback) {
      callback(message);
    }
  },

  // Get remaining session time
  getRemainingTime: () => {
    const startTime = localStorage.getItem('sessionStartTime');
    if (!startTime) return null;

    const elapsed = Date.now() - parseInt(startTime);
    const remaining = SESSION_TIMEOUT - elapsed;

    if (remaining <= 0) return 0;
    return remaining;
  },

  // Check if session is about to expire
  isSessionWarning: () => {
    const remaining = sessionManager.getRemainingTime();
    if (!remaining) return false;
    return remaining < WARNING_THRESHOLD && remaining > 0;
  },

  // Extend session (on user activity or explicit action)
  extendSession: () => {
    localStorage.setItem('sessionStartTime', Date.now().toString());
    
    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
      sessionManager.logout(null, 'Session expired.');
    }, SESSION_TIMEOUT);
  },

  // Cleanup on logout/unmount
  cleanup: () => {
    if (sessionTimer) clearTimeout(sessionTimer);
    if (inactivityTimer) clearTimeout(inactivityTimer);
    
    document.removeEventListener('click', sessionManager.extendSession);
    document.removeEventListener('keypress', sessionManager.extendSession);
  }
};

export default sessionManager;
