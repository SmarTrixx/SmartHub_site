import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import axios from 'axios';
import AdminDashboard from '../components/AdminDashboard';

const AdminServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [statusMessages, setStatusMessages] = useState({});
  const [rejectingId, setRejectingId] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

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

  const updateRequestStatus = async (requestId, newStatus, statusMessage = '') => {
    // For rejected status, show custom message field instead of immediate update
    if (newStatus === 'rejected' && rejectingId !== requestId) {
      setRejectingId(requestId);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const adminMessage = statusMessages[requestId] || '';
      
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/service-requests/${requestId}/status`,
        { 
          status: newStatus, 
          message: statusMessage,
          adminMessage: adminMessage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Show real email status from backend
      if (response.data.emailSent) {
        setMessage({ type: 'success', text: `Status updated to ${newStatus}. Email sent to client.` });
      } else {
        setMessage({ type: 'warning', text: `Status updated to ${newStatus}. Email delivery status: check Vercel logs.` });
      }
      
      setStatusMessages(prev => ({ ...prev, [requestId]: '' }));
      setRejectingId(null);
      fetchRequests();
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update status' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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

  // Filter requests by status, search term, and date range
  const filteredRequests = requests.filter(r => {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    const searchMatch = searchTerm === '' || 
      r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const createdDate = new Date(r.createdAt);
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;
    
    let dateMatch = true;
    if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
      dateMatch = createdDate >= fromDate;
    }
    if (toDate && dateMatch) {
      toDate.setHours(23, 59, 59, 999);
      dateMatch = createdDate <= toDate;
    }

    return statusMatch && searchMatch && dateMatch;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setDateRange({ from: '', to: '' });
  };

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
                : message.type === 'warning'
                ? 'bg-yellow-100/50 text-yellow-700 border border-yellow-300'
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

        {/* Image Viewer Modal */}
        {selectedAttachment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedAttachment(null)}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-screen relative"
            >
              {selectedAttachment.dataUrl?.startsWith('data:image') ? (
                <img
                  src={selectedAttachment.dataUrl}
                  alt={selectedAttachment.originalName}
                  className="max-w-full max-h-screen object-contain rounded-lg"
                />
              ) : (
                <div className="bg-white p-8 rounded-lg">
                  <p className="text-gray-700 text-lg">File: {selectedAttachment.originalName}</p>
                  <p className="text-gray-500 mt-4">Non-image files cannot be previewed in browser</p>
                </div>
              )}
              <button
                onClick={() => setSelectedAttachment(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200"
              >
                <FiX size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">From Date</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">To Date</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            {(searchTerm || dateRange.from || dateRange.to) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all flex items-center gap-2"
              >
                <FiX size={18} />
                Clear Filters
              </button>
            )}
          </div>
        </div>

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
            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-gray-600 text-lg font-semibold">No requests found</p>
              <p className="text-gray-500 mt-2">
                {searchTerm || dateRange.from || dateRange.to 
                  ? 'Try adjusting your filters'
                  : 'Service requests will appear here'}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-[#0057FF]"
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
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(request.status)}`}>
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
                        <h4 className="font-bold text-[#22223B] mb-3">Attachments (Click to view in full resolution)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {request.attachments.map((attachment, idx) => (
                            <div
                              key={idx}
                              className="space-y-2 cursor-pointer group"
                              onClick={() => setSelectedAttachment(attachment)}
                            >
                              {attachment.dataUrl && attachment.dataUrl.startsWith('data:image') ? (
                                <div className="relative overflow-hidden rounded border border-gray-300 h-24">
                                  <img
                                    src={attachment.dataUrl}
                                    alt={attachment.originalName}
                                    className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">Click to view</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-24 bg-gray-300 rounded flex items-center justify-center group-hover:bg-gray-400 transition-colors">
                                  <div className="text-center">
                                    <p className="text-2xl">📎</p>
                                    <p className="text-xs text-gray-700 mt-1">Click to view</p>
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-gray-600 truncate" title={attachment.originalName}>{attachment.originalName}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Internal Notes */}
                    {request.internalNotes && (
                      <div>
                        <h4 className="font-bold text-[#22223B] mb-3">Internal Notes (Admin Only)</h4>
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-gray-700">
                          {request.internalNotes}
                        </div>
                      </div>
                    )}

                    {/* Status Update */}
                    <div>
                      <h4 className="font-bold text-[#22223B] mb-3">Update Status</h4>
                      <div className="space-y-4">
                        <div className="flex gap-2 flex-wrap">
                          {['pending', 'reviewing', 'approved', 'in-progress', 'completed', 'rejected'].map(status => (
                            <button
                              key={status}
                              onClick={() => updateRequestStatus(request._id, status)}
                              disabled={rejectingId === request._id && status !== 'rejected'}
                              className={`px-4 py-2 rounded font-semibold transition-all ${
                                request.status === status
                                  ? 'bg-[#0057FF] text-white'
                                  : rejectingId === request._id && status !== 'rejected'
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                        
                        {/* Custom Message Field - Only visible for reject */}
                        {rejectingId === request._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-2 border-red-300 bg-red-50 p-4 rounded-lg"
                          >
                            <label className="block text-sm font-semibold text-red-700 mb-2">
                              Custom Rejection Message (REQUIRED)
                            </label>
                            <textarea
                              value={statusMessages[request._id] || ''}
                              onChange={(e) => setStatusMessages(prev => ({
                                ...prev,
                                [request._id]: e.target.value
                              }))}
                              placeholder="e.g., 'We're at capacity. Please resubmit in 3 weeks.' or 'This service is outside our expertise.'"
                              rows="3"
                              className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                              autoFocus
                            />
                            <p className="text-xs text-red-600 mt-2">This message will be sent to the client explaining why their request was rejected.</p>
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => updateRequestStatus(request._id, 'rejected')}
                                disabled={!statusMessages[request._id]?.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                              >
                                Confirm Rejection & Send Email
                              </button>
                              <button
                                onClick={() => setRejectingId(null)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-400 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}
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
