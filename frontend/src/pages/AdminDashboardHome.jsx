import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiImage, FiTool, FiUser, FiArrowRight, FiMail } from 'react-icons/fi';
import axios from 'axios';
import api, { projectsAPI, servicesAPI, profileAPI } from '../services/api';
import AdminDashboard from '../components/AdminDashboard';

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    projects: 0,
    services: 0,
    profile: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      const [projectsRes, servicesRes, profileRes, requestsRes] = await Promise.all([
        projectsAPI.getAll(),
        servicesAPI.getAll(),
        profileAPI.get(),
        axios.get(
          `${process.env.REACT_APP_API_URL}/service-requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => ({ data: { requests: [] } }))
      ]);

      const requests = requestsRes.data?.requests || [];
      const pendingCount = requests.filter(r => r.status === 'pending').length;

      setStats({
        projects: projectsRes.data?.projects?.length || projectsRes.data?.length || 0,
        services: servicesRes.data?.length || 0,
        profile: profileRes.data,
        totalRequests: requests.length,
        pendingRequests: pendingCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.message);
      // Set default values so page doesn't appear broken
      setStats({
        projects: 0,
        services: 0,
        profile: null
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, description, link, bgColor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`rounded-lg shadow-lg p-6 text-white cursor-pointer transition-all hover:shadow-xl ${bgColor}`}
    >
      <Link to={link} className="block h-full">
        <div className="flex items-start justify-between mb-4">
          <Icon size={32} className="opacity-80" />
          <span className="text-2xl font-bold">{value}</span>
        </div>
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm opacity-90 mb-4">{description}</p>
        <div className="flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
          Manage <FiArrowRight size={16} />
        </div>
      </Link>
    </motion.div>
  );

  return (
    <AdminDashboard>
      <div className="space-y-8">
        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0057FF]"></div>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          >
            <p>Error loading dashboard: {error}</p>
          </motion.div>
        )}

        {!loading && (
          <>
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold text-[#22223B]">Welcome to Admin Panel</h1>
              <p className="text-gray-600 mt-2">
                {stats.profile?.name ? `Hello, ${stats.profile.name}!` : 'Manage your portfolio and content from here.'}
              </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <StatCard
                icon={FiImage}
                title="Projects"
                value={stats.projects}
                description="Portfolio projects"
                link="/admin/projects"
                bgColor="bg-gradient-to-br from-[#0057FF] to-blue-700"
              />
              <StatCard
                icon={FiTool}
                title="Services"
                value={stats.services}
                description="Service offerings"
                link="/admin/services"
                bgColor="bg-gradient-to-br from-cyan-600 to-cyan-800"
              />
              <StatCard
                icon={FiUser}
                title="Profile"
                value="✓"
                description="Your profile info"
                link="/admin/profile"
                bgColor="bg-gradient-to-br from-purple-600 to-purple-800"
              />
              <StatCard
                icon={FiMail}
                title="Requests"
                value={stats.pendingRequests}
                description={`${stats.totalRequests} total`}
                link="/admin/service-requests"
                bgColor="bg-gradient-to-br from-red-600 to-red-800"
              />
            </div>
          </>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-[#22223B] mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/admin/projects"
              className="p-6 border-2 border-[#0057FF] rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between group"
            >
              <div>
                <h3 className="font-bold text-[#22223B] group-hover:text-[#0057FF]">Add New Project</h3>
                <p className="text-sm text-gray-600">Create and showcase a new portfolio item</p>
              </div>
              <FiImage className="text-[#0057FF] text-2xl group-hover:translate-x-2 transition-transform" />
            </Link>

            <Link
              to="/admin/profile"
              className="p-6 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-between group"
            >
              <div>
                <h3 className="font-bold text-[#22223B] group-hover:text-purple-600">Update Profile</h3>
                <p className="text-sm text-gray-600">Manage your profile and social links</p>
              </div>
              <FiUser className="text-purple-600 text-2xl group-hover:translate-x-2 transition-transform" />
            </Link>

            <Link
              to="/admin/services"
              className="p-6 border-2 border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors flex items-center justify-between group"
            >
              <div>
                <h3 className="font-bold text-[#22223B] group-hover:text-cyan-600">Add Service</h3>
                <p className="text-sm text-gray-600">Create a new service offering</p>
              </div>
              <FiTool className="text-cyan-600 text-2xl group-hover:translate-x-2 transition-transform" />
            </Link>

            <Link
              to="/"
              className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
            >
              <div>
                <h3 className="font-bold text-[#22223B]">View Website</h3>
                <p className="text-sm text-gray-600">See your portfolio in action</p>
              </div>
              <FiArrowRight className="text-gray-600 text-2xl group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-[#22223B] mb-6">System Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-600">Admin Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Online
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-600">Database Connection</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Operational
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#0057FF]/10 to-cyan-600/10 border border-[#0057FF]/30 rounded-lg p-6"
        >
          <h3 className="font-bold text-[#22223B] mb-2">💡 Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Keep your profile up-to-date with recent work and social links</li>
            <li>• Add projects with clear descriptions and multiple images</li>
            <li>• Use meaningful tags for better project filtering</li>
            <li>• Regularly update your services to reflect current offerings</li>
          </ul>
        </motion.div>
      </div>
    </AdminDashboard>
  );
};

export default AdminDashboardHome;
