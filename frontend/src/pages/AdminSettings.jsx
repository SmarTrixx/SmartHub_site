import { useState, useEffect } from 'react';
import { FiSettings, FiMail, FiCheckCircle, FiAlertCircle, FiWifiOff } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSettings();
  }, [apiUrl]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${apiUrl}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (response.data.success) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${apiUrl}/admin/settings/email-status`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (response.data.success) {
        setSettings(prev => ({
          ...prev,
          systemStatus: {
            ...prev.systemStatus,
            emailService: response.data.email
          }
        }));
      }
    } catch (err) {
      console.error('Error refreshing settings:', err);
      setError(err.response?.data?.message || 'Failed to refresh settings');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0057FF] to-cyan-600 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-white text-center py-12">
            <div className="animate-spin mb-4"><FiSettings className="text-4xl mx-auto" /></div>
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  const emailStatus = settings?.systemStatus?.emailService;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0057FF] to-cyan-600 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <FiSettings className="text-3xl" />
            System Settings
          </h1>
          <p className="text-white/80 mt-2">Email configuration status and system information</p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
            <FiAlertCircle className="text-xl mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/10 backdrop-blur-xl rounded-lg p-8 border border-white/20 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FiMail className="text-2xl" />
              Email Configuration Status
            </h2>
            <button onClick={handleRefresh} disabled={refreshing} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all disabled:opacity-50">
              {refreshing ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Primary Email (Contact Forms)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/60 text-sm">Account</p>
                    <p className="text-white font-mono">{emailStatus?.primary?.account || 'Not configured'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {emailStatus?.primary?.configured ? (
                      emailStatus.primary.ready ? (
                        <><FiCheckCircle className="text-green-400 text-lg" /><span className="text-green-400 text-sm font-medium">Connected</span></>
                      ) : (
                        <><FiAlertCircle className="text-yellow-400 text-lg" /><span className="text-yellow-400 text-sm font-medium">Disconnected</span></>
                      )
                    ) : (
                      <><FiWifiOff className="text-red-400 text-lg" /><span className="text-red-400 text-sm font-medium">Not Configured</span></>
                    )}
                  </div>
                </div>
                {emailStatus?.primary?.error && (
                  <div className="text-red-300 text-sm bg-red-500/10 p-3 rounded">
                    <p className="font-medium">Error:</p>
                    <p>{emailStatus.primary.error}</p>
                  </div>
                )}
                <div className="text-white/60 text-sm">
                  <p>📧 Uses: <span className="text-white">GMAIL_USER</span></p>
                  <p>💌 Purpose: <span className="text-white">Contact form submissions</span></p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Secondary Email (Optional - Studio/Admin)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/60 text-sm">Account</p>
                    <p className="text-white font-mono">{emailStatus?.secondary?.account || 'Not configured'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {emailStatus?.secondary?.configured ? (
                      emailStatus.secondary.ready ? (
                        <><FiCheckCircle className="text-green-400 text-lg" /><span className="text-green-400 text-sm font-medium">Connected</span></>
                      ) : (
                        <><FiAlertCircle className="text-yellow-400 text-lg" /><span className="text-yellow-400 text-sm font-medium">Disconnected</span></>
                      )
                    ) : (
                      <><FiWifiOff className="text-gray-400 text-lg" /><span className="text-gray-400 text-sm font-medium">Not Configured</span></>
                    )}
                  </div>
                </div>
                {emailStatus?.secondary?.error && (
                  <div className="text-yellow-300 text-sm bg-yellow-500/10 p-3 rounded">
                    <p className="font-medium">Error:</p>
                    <p>{emailStatus.secondary.error}</p>
                  </div>
                )}
                <div className="text-white/60 text-sm">
                  <p>📧 Uses: <span className="text-white">GMAIL_USER_SECONDARY (optional)</span></p>
                  <p>💌 Purpose: <span className="text-white">Future use - studio notifications</span></p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-xl rounded-lg p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/60 text-sm">Environment</p>
              <p className="text-white font-mono text-lg">{settings?.systemStatus?.environment || 'N/A'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-white/60 text-sm">Last Check</p>
              <p className="text-white font-mono text-sm">{settings?.systemStatus?.timestamp ? new Date(settings.systemStatus.timestamp).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-blue-50/10 border border-blue-400/30 rounded-lg p-6 text-white">
          <h3 className="font-semibold mb-4">ℹ️ Configuration (Vercel Environment Variables)</h3>
          <div className="text-sm space-y-3 text-white/80">
            <div>
              <p className="font-medium text-white mb-2">Primary Email (Required):</p>
              <div className="bg-black/30 p-3 rounded font-mono text-xs space-y-1">
                <p>GMAIL_USER=contact.smarthubz@gmail.com</p>
                <p>GMAIL_PASSWORD=your_app_password</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-white mb-2">Secondary Email (Optional):</p>
              <div className="bg-black/30 p-3 rounded font-mono text-xs space-y-1">
                <p>GMAIL_USER_SECONDARY=studio.smarthubz@gmail.com</p>
                <p>GMAIL_PASSWORD_SECONDARY=your_app_password</p>
              </div>
            </div>
            <p className="mt-4 text-xs">💡 Use app-specific passwords from your Google account security settings, not your regular Gmail password</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;
