import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiAlertCircle, FiTool } from 'react-icons/fi';
import axios from 'axios';
import AdminDashboard from '../components/AdminDashboard';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    icon: 'FiCode',
    features: '',
    price: 'Contact for pricing',
    status: 'active',
    order: 0
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/services`);
      setServices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setLoading(false);
      setMessage({ type: 'error', text: 'Failed to load services' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      if (editingService) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/services/${editingService.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage({ type: 'success', text: 'Service updated successfully!' });
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/services`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage({ type: 'success', text: 'Service created successfully!' });
      }

      setShowForm(false);
      setEditingService(null);
      resetForm();
      fetchServices();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save service' });
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      id: service.id,
      title: service.title,
      description: service.description,
      icon: service.icon,
      features: service.features.join(', '),
      price: service.price,
      status: service.status,
      order: service.order
    });
    setShowForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/services/${serviceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Service deleted successfully!' });
      fetchServices();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete service' });
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      icon: 'FiCode',
      features: '',
      price: 'Contact for pricing',
      status: 'active',
      order: 0
    });
    setEditingService(null);
  };

  return (
    <AdminDashboard>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#22223B]">Services</h1>
            <p className="text-gray-600">Manage your service offerings</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#0057FF] text-white rounded-lg hover:shadow-lg transition-all"
          >
            <FiPlus size={20} />
            Add Service
          </button>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-lg flex items-gap-3 ${
              message.type === 'success'
                ? 'bg-green-100/50 text-green-700 border border-green-300'
                : 'bg-red-100/50 text-red-700 border border-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <FiCheckCircle className="flex-shrink-0" />
            ) : (
              <FiAlertCircle className="flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-[#22223B]">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#22223B] mb-2">Service ID</label>
                  <input
                    type="text"
                    name="id"
                    placeholder="e.g., software-dev"
                    value={formData.id}
                    onChange={handleChange}
                    disabled={!!editingService}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#22223B] mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Service Title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Service description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  rows="4"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#22223B] mb-2">Icon Class</label>
                  <input
                    type="text"
                    name="icon"
                    placeholder="e.g., FiCode, FiPalette"
                    value={formData.icon}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#22223B] mb-2">Price</label>
                  <input
                    type="text"
                    name="price"
                    placeholder="e.g., Contact for pricing"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Features (comma-separated)</label>
                <textarea
                  name="features"
                  placeholder="Feature 1, Feature 2, Feature 3"
                  value={formData.features}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  rows="3"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#22223B] mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#22223B] mb-2">Display Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0057FF] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0057FF] border-t-transparent" />
          </div>
        ) : services.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#22223B]">{service.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{service.price}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    service.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {service.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>

                {service.features.length > 0 && (
                  <div className="mb-4">
                    <ul className="space-y-1">
                      {service.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#0057FF] rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-[#0057FF] hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <FiTool className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 font-semibold mb-4">No services yet</p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-6 py-2 bg-[#0057FF] text-white rounded-lg hover:shadow-lg transition-all"
            >
              Create Your First Service
            </button>
          </div>
        )}
      </div>
    </AdminDashboard>
  );
};

export default AdminServices;
