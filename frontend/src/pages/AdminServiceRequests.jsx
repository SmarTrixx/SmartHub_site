import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiChevronDown } from 'react-icons/fi';
import axios from 'axios';
import AdminDashboard from '../components/AdminDashboard';

const AdminServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/service-requests`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRequests(response.data.requests || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMessage({ type: 'error', text: 'Failed to load service requests' });
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/service-requests/${requestId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMessage({ type: 'success', text: 'Status updated successfully' });
      fetchRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      'Graphics Design': '🎨',
      'Software Development': '💻',
      'Tech Support': '🛠️',
      'Branding & Identity': '🌈',
      'Automation': '🤖'
    };
    return icons[serviceType] || '📋';
  };

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  if (loading) {
    return (
      <AdminDashboard>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0057FF] border-t-transparent" />
        </div>
      </AdminDashboard>
    );
  }

  return (
    <AdminDashboard>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-[#22223B]">Service Requests</h1>
          <p className="text-gray-600">Manage and track client service requests</p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-100/50 text-green-700 border border-green-300'
                : 'bg-red-100/50 text-red-700 border border-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <FiCheckCircle size={20} />
            ) : (
              <FiAlertCircle size={20} />
            )}
            {message.text}
          </motion.div>
        )}

        {/* Filter by Status */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'reviewing', 'approved', 'in-progress', 'completed', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-[#0057FF] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && ` (${requests.filter(r => r.status === status).length})`}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Total Requests', count: requests.length },
            { label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
            { label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
            { label: 'Completed', count: requests.filter(r => r.status === 'completed').length }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-[#0057FF]">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(expandedId === request._id ? null : request._id)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex items-center gap-4">
                      <span className="text-2xl">{getServiceIcon(request.serviceType)}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-[#22223B]">{request.clientName}</h3>
                        <p className="text-sm text-gray-600">{request.clientEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#22223B]">{request.serviceType}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <FiChevronDown
                        size={20}
                        className={`transition-transform ${
                          expandedId === request._id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === request._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t bg-gray-50 p-6 space-y-6"
                  >
                    {/* Contact Info */}
                    <div>
                      <h4 className="font-bold text-[#22223B] mb-3">Contact Information</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Name</p>
                          <p className="font-semibold">{request.clientName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Email</p>
                          <p className="font-semibold">{request.clientEmail}</p>
                        </div>
                        {request.clientPhone && (
                          <div>
                            <p className="text-gray-600">Phone</p>
                            <p className="font-semibold">{request.clientPhone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project Details */}
                    <div>
                      <h4 className="font-bold text-[#22223B] mb-3">Project Details</h4>
                      <div className="bg-white p-4 rounded border border-gray-200 whitespace-pre-wrap text-sm text-gray-700">
                        {request.projectDetails}
                      </div>
                    </div>

                    {/* Service-Specific Data */}
                    {Object.keys(request.additionalData).length > 0 && (
                      <div>
                        <h4 className="font-bold text-[#22223B] mb-3">Additional Information</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          {Object.entries(request.additionalData).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-gray-600 capitalize">{key}</p>
                              <p className="font-semibold break-words">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {request.attachments && request.attachments.length > 0 && (
                      <div>
                        <h4 className="font-bold text-[#22223B] mb-3">Attachments</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {request.attachments.map((attachment, idx) => (
                            <div key={idx} className="space-y-2">
                              {attachment.dataUrl && attachment.dataUrl.startsWith('data:image') ? (
                                <img
                                  src={attachment.dataUrl}
                                  alt={attachment.originalName}
                                  className="w-full h-24 object-cover rounded border border-gray-300"
                                />
                              ) : (
                                <div className="w-full h-24 bg-gray-300 rounded flex items-center justify-center">
                                  📎
                                </div>
                              )}
                              <p className="text-xs text-gray-600 truncate">{attachment.originalName}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Update */}
                    <div>
                      <h4 className="font-bold text-[#22223B] mb-3">Update Status</h4>
                      <div className="flex gap-2 flex-wrap">
                        {['pending', 'reviewing', 'approved', 'in-progress', 'completed', 'rejected'].map(status => (
                          <button
                            key={status}
                            onClick={() => updateRequestStatus(request._id, status)}
                            className={`px-4 py-2 rounded font-semibold transition-all ${
                              request.status === status
                                ? 'bg-[#0057FF] text-white'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-gray-500 border-t pt-4">
                      <p>Request ID: {request._id}</p>
                      <p>Submitted: {new Date(request.createdAt).toLocaleString()}</p>
                      {request.ipAddress && <p>IP: {request.ipAddress}</p>}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AdminDashboard>
  );
};

export default AdminServiceRequests;
