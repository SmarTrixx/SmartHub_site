import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiLogOut, FiHome, FiImage, FiUser, FiTool, FiMail } from 'react-icons/fi';
import { authAPI } from '../services/api';

const AdminDashboard = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Verify token is still valid
    const verifyToken = async () => {
      try {
        await authAPI.verify();
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
      }
    };

    verifyToken();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FiImage, label: 'Projects', path: '/admin/projects' },
    { icon: FiUser, label: 'Profile', path: '/admin/profile' },
    { icon: FiTool, label: 'Services', path: '/admin/services' },
    { icon: FiMail, label: 'Service Requests', path: '/admin/service-requests' }
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed md:relative w-64 h-screen bg-[#22223B] text-white shadow-lg z-50"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold">Smarthubz Studio</h2>
          <p className="text-sm text-gray-400">Admin Panel</p>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.path}
                href={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#0057FF] transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4 border-t border-white/10 pt-6">
          <div className="mb-4">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-semibold text-white">{user?.name || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-semibold"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
          <h1 className="text-lg font-bold text-[#22223B]">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
