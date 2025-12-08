import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import AdminDashboard from '../components/AdminDashboard';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamAvatarFiles, setTeamAvatarFiles] = useState({});
  const [teamAvatarPreviews, setTeamAvatarPreviews] = useState({});
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    avatar: '',
    bio: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    mission: '',
    workAvailability: 'Available',
    availableTime: '',
    socialLinks: {
      twitter: '',
      github: '',
      linkedin: '',
      instagram: '',
      facebook: ''
    },
    stats: {
      projectsCompleted: 0,
      yearsExperience: 0,
      clientsSatisfied: 0
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile`);
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        title: response.data.title || '',
        bio: response.data.bio || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        location: response.data.location || '',
        website: response.data.website || '',
        mission: response.data.mission || '',
        workAvailability: response.data.workAvailability || 'Available',
        availableTime: response.data.availableTime || '',
        socialLinks: response.data.socialLinks || {},
        stats: response.data.stats || {}
      });
      setTeamMembers(response.data.team || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleStatsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [name]: parseInt(value) || 0
      }
    }));
  };

  const handleTeamMemberChange = (e) => {
    const { name, value } = e.target;
    setNewTeamMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTeamMember = () => {
    if (newTeamMember.name && newTeamMember.role) {
      const newIndex = teamMembers.length;
      setTeamMembers([...teamMembers, newTeamMember]);
      
      // Move file from 'temp' key to actual index if one was selected
      if (teamAvatarFiles['temp']) {
        setTeamAvatarFiles(prev => {
          const newFiles = { ...prev };
          newFiles[newIndex] = newFiles['temp'];
          delete newFiles['temp'];
          return newFiles;
        });
        setTeamAvatarPreviews(prev => {
          const newPreviews = { ...prev };
          newPreviews[newIndex] = newPreviews['temp'];
          delete newPreviews['temp'];
          return newPreviews;
        });
      } else {
        // Clear temp keys if no file was selected
        setTeamAvatarFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles['temp'];
          return newFiles;
        });
        setTeamAvatarPreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews['temp'];
          return newPreviews;
        });
      }
      
      setNewTeamMember({ name: '', role: '', avatar: '', bio: '' });
    }
  };

  const removeTeamMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const formDataObj = new FormData();

      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key === 'socialLinks' || key === 'stats') {
          formDataObj.append(key, JSON.stringify(formData[key]));
        } else {
          formDataObj.append(key, formData[key]);
        }
      });

      // Append team
      const teamWithAvatarIndices = teamMembers.map((member, idx) => ({
        ...member,
        _fileIndex: teamAvatarFiles[idx] ? idx : null
      }));
      formDataObj.append('team', JSON.stringify(teamWithAvatarIndices));

      // Append all team avatar files
      Object.entries(teamAvatarFiles).forEach(([index, file]) => {
        if (file && index !== 'temp') {
          formDataObj.append(`teamAvatar_${index}`, file);
        }
      });

      // Append avatar if provided
      if (avatar) {
        formDataObj.append('avatar', avatar);
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/profile`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setAvatar(null);
      fetchProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    }
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
          <h1 className="text-3xl font-bold text-[#22223B]">Profile Settings</h1>
          <p className="text-gray-600">Manage your profile information</p>
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

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-8 space-y-8"
        >
          {/* Avatar Section */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-bold text-[#22223B] mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              {profile?.avatar && !avatar && (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#0057FF]"
                />
              )}
              {avatar && (
                <img
                  src={URL.createObjectURL(avatar)}
                  alt="New Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#0057FF]"
                />
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar"
                />
                <label
                  htmlFor="avatar"
                  className="px-6 py-2 bg-[#0057FF] text-white rounded-lg hover:shadow-lg transition-all cursor-pointer inline-block"
                >
                  Change Avatar
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-bold text-[#22223B] mb-4">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Title/Role</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  placeholder="Full Stack Developer & Designer"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2 mt-4">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                rows="4"
              />
            </div>
          </div>

          {/* Mission & Stats */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-bold text-[#22223B] mb-4">Mission & Stats</h2>
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Mission</label>
              <textarea
                name="mission"
                value={formData.mission}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                rows="3"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Projects Completed</label>
                <input
                  type="number"
                  name="projectsCompleted"
                  value={formData.stats.projectsCompleted}
                  onChange={handleStatsChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Years Experience</label>
                <input
                  type="number"
                  name="yearsExperience"
                  value={formData.stats.yearsExperience}
                  onChange={handleStatsChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Clients Satisfied</label>
                <input
                  type="number"
                  name="clientsSatisfied"
                  value={formData.stats.clientsSatisfied}
                  onChange={handleStatsChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Availability & Work Time */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-bold text-[#22223B] mb-4">Work Availability</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Availability Status</label>
                <select
                  name="workAvailability"
                  value={formData.workAvailability}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                >
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Limited Time">Limited Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Available Time</label>
                <input
                  type="text"
                  name="availableTime"
                  value={formData.availableTime}
                  onChange={handleChange}
                  placeholder="e.g., Mon-Fri, 9 AM - 6 PM"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-bold text-[#22223B] mb-4">Social Links</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {['twitter', 'github', 'linkedin', 'instagram', 'facebook'].map((social) => (
                <div key={social}>
                  <label className="block text-sm font-semibold text-[#22223B] mb-2 capitalize">{social}</label>
                  <input
                    type="url"
                    name={social}
                    value={formData.socialLinks[social]}
                    onChange={handleSocialChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                    placeholder={`https://${social}.com/yourprofile`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Team Management */}
          <div>
            <h2 className="text-xl font-bold text-[#22223B] mb-4">Team Members</h2>
            
            {/* Add Team Member Form */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-[#22223B] mb-4">Add Team Member</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="name"
                  value={newTeamMember.name}
                  onChange={handleTeamMemberChange}
                  placeholder="Name"
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
                <input
                  type="text"
                  name="role"
                  value={newTeamMember.role}
                  onChange={handleTeamMemberChange}
                  placeholder="Role/Position"
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Avatar Image (or use URL below)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        // Store file with temp index (will be reassigned when member is added)
                        setTeamAvatarFiles(prev => ({
                          ...prev,
                          'temp': file
                        }));
                        // Create preview URL
                        const previewUrl = URL.createObjectURL(file);
                        setTeamAvatarPreviews(prev => ({
                          ...prev,
                          'temp': previewUrl
                        }));
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Or enter Avatar URL below if not uploading image</p>
                </div>
                {teamAvatarPreviews['temp'] && (
                  <div className="md:col-span-2">
                    <img src={teamAvatarPreviews['temp']} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                  </div>
                )}
                <input
                  type="url"
                  name="avatar"
                  value={teamAvatarFiles['temp'] ? '' : newTeamMember.avatar}
                  onChange={handleTeamMemberChange}
                  placeholder="Avatar URL (alternative to image upload)"
                  disabled={teamAvatarFiles['temp'] ? true : false}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF] disabled:bg-gray-100"
                />
                <textarea
                  name="bio"
                  value={newTeamMember.bio}
                  onChange={handleTeamMemberChange}
                  placeholder="Bio"
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  rows="2"
                />
              </div>
              <button
                type="button"
                onClick={addTeamMember}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                Add Member
              </button>
            </div>

            {/* Team Members List */}
            {teamMembers.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-[#22223B]">Current Team ({teamMembers.length})</h3>
                {teamMembers.map((member, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#22223B]">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-sm text-gray-600 mt-1">{member.bio}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(idx)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-all text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t">
            <button
              type="submit"
              className="px-8 py-3 bg-[#0057FF] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Save Changes
            </button>
          </div>
        </motion.form>
      </div>
    </AdminDashboard>
  );
};

export default AdminProfile;
