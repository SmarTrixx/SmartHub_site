import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiAlertCircle, FiImage } from 'react-icons/fi';
import axios from 'axios';
import AdminDashboard from '../components/AdminDashboard';

// WebP compression utility with lossless option
const compressImageToWebP = (file, quality = 0.85, lossless = true) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Resize if too large (max 1600px for portfolio quality)
        let width = img.width;
        let height = img.height;
        const maxSize = 1600;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            const ratio = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
            const compressionType = lossless ? 'lossless' : `lossy (${(quality * 100).toFixed(0)}%)`;
            console.log(`🎨 Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB (${ratio}% reduction, ${compressionType})`);
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [message, setMessage] = useState('');
  const [compressionSettings, setCompressionSettings] = useState({
    enabled: true,
    lossless: true,
    quality: 0.85
  });
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    desc: '',
    fullDescription: '',
    challenge: '',
    solution: '',
    client: '',
    year: new Date().getFullYear(),
    tags: '',
    tools: '',
    images: []
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data.projects || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
      setMessage({ type: 'error', text: 'Failed to load projects' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (compressionSettings.enabled) {
      try {
        const compressedFiles = await Promise.all(
          files.map(file => 
            compressImageToWebP(file, compressionSettings.quality, compressionSettings.lossless)
          )
        );
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...compressedFiles]
        }));
      } catch (error) {
        console.error('Error compressing images:', error);
        // Fall back to original files if compression fails
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...files]
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const formDataObj = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          formDataObj.append(key, formData[key]);
        }
      });

      // Append images
      formData.images.forEach(file => {
        if (file instanceof File) {
          formDataObj.append('images', file);
        }
      });

      if (editingProject) {
        // Update project
        await axios.put(
          `${process.env.REACT_APP_API_URL}/projects/${editingProject.id}`,
          formDataObj,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setMessage({ type: 'success', text: 'Project updated successfully!' });
      } else {
        // Create new project
        await axios.post(
          `${process.env.REACT_APP_API_URL}/projects`,
          formDataObj,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setMessage({ type: 'success', text: 'Project created successfully!' });
      }

      setShowForm(false);
      setEditingProject(null);
      resetForm();
      fetchProjects();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save project' });
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      id: project.id,
      title: project.title,
      desc: project.desc,
      fullDescription: project.fullDescription,
      challenge: project.challenge,
      solution: project.solution,
      client: project.client,
      year: project.year,
      tags: project.tags.join(', '),
      tools: project.tools.join(', '),
      images: []
    });
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Project deleted successfully!' });
      fetchProjects();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete project' });
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      desc: '',
      fullDescription: '',
      challenge: '',
      solution: '',
      client: '',
      year: new Date().getFullYear(),
      tags: '',
      tools: '',
      images: []
    });
    setEditingProject(null);
  };

  return (
    <AdminDashboard>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#22223B]">Projects</h1>
            <p className="text-gray-600">Manage your portfolio projects</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#0057FF] text-white rounded-lg hover:shadow-lg transition-all"
          >
            <FiPlus size={20} />
            Add Project
          </button>
        </motion.div>

        {/* Message */}
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

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-[#22223B]">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="id"
                  placeholder="Project ID (e.g., tech-startup)"
                  value={formData.id}
                  onChange={handleChange}
                  disabled={!!editingProject}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  required
                />
                <input
                  type="text"
                  name="title"
                  placeholder="Project Title"
                  value={formData.title}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  required
                />
                <input
                  type="text"
                  name="client"
                  placeholder="Client Name"
                  value={formData.client}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  required
                />
                <input
                  type="number"
                  name="year"
                  placeholder="Year"
                  value={formData.year}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  required
                />
              </div>

              <textarea
                name="desc"
                placeholder="Short Description"
                value={formData.desc}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                rows="3"
                required
              />

              <textarea
                name="fullDescription"
                placeholder="Full Description"
                value={formData.fullDescription}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                rows="4"
                required
              />

              <div className="grid md:grid-cols-2 gap-6">
                <textarea
                  name="challenge"
                  placeholder="Challenge"
                  value={formData.challenge}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  rows="4"
                  required
                />
                <textarea
                  name="solution"
                  placeholder="Solution"
                  value={formData.solution}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                  rows="4"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="tags"
                  placeholder="Tags (comma-separated)"
                  value={formData.tags}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
                <input
                  type="text"
                  name="tools"
                  placeholder="Tools (comma-separated)"
                  value={formData.tools}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>

              {/* Image Compression Settings */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="compressionEnabled"
                    checked={compressionSettings.enabled}
                    onChange={(e) => setCompressionSettings(prev => ({
                      ...prev,
                      enabled: e.target.checked
                    }))}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="compressionEnabled" className="cursor-pointer font-semibold text-[#22223B]">
                    🎨 Compress images to WebP (lossless)
                  </label>
                </div>
                
                {compressionSettings.enabled && (
                  <div className="ml-7 space-y-3 text-sm text-gray-700">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="losslessMode"
                        checked={compressionSettings.lossless}
                        onChange={(e) => setCompressionSettings(prev => ({
                          ...prev,
                          lossless: e.target.checked,
                          quality: e.target.checked ? 1 : 0.85
                        }))}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="losslessMode" className="cursor-pointer">
                        Lossless (best quality, ~30% smaller)
                      </label>
                    </div>
                    
                    {!compressionSettings.lossless && (
                      <div className="ml-7">
                        <label className="block mb-1">Quality: {(compressionSettings.quality * 100).toFixed(0)}%</label>
                        <input
                          type="range"
                          min="50"
                          max="95"
                          step="5"
                          value={compressionSettings.quality * 100}
                          onChange={(e) => setCompressionSettings(prev => ({
                            ...prev,
                            quality: parseInt(e.target.value) / 100
                          }))}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Lower = smaller files, Higher = better quality</p>
                      </div>
                    )}
                    
                    <p className="text-xs text-blue-700 mt-2">💡 Compression happens when you select images. Maximum width/height will be 1600px to maintain quality.</p>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FiImage className="mx-auto mb-2 text-gray-400" size={32} />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="images"
                />
                <label htmlFor="images" className="cursor-pointer text-[#0057FF] font-semibold hover:underline">
                  Click to upload images or drag and drop
                </label>
                <p className="text-sm text-gray-500 mt-2">{compressionSettings.enabled ? 'WebP compressed' : 'Original files'} - up to 10MB each</p>

                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                        >
                          <FiTrash2 className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0057FF] border-t-transparent" />
          </div>
        ) : projects.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4"
          >
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  {project.image && (
                    <img
                      src={(() => {
                        let imageUrl = project.image;
                        if (imageUrl.startsWith('/uploads/')) {
                          imageUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}`;
                        }
                        return imageUrl;
                      })()}
                      alt={project.title}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-[#22223B]">{project.title}</h3>
                    <p className="text-sm text-gray-600">{project.client} • {project.year}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-xs bg-[#0057FF]/20 text-[#0057FF] px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 text-[#0057FF] hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
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
            <FiImage className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 font-semibold mb-4">No projects yet</p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-6 py-2 bg-[#0057FF] text-white rounded-lg hover:shadow-lg transition-all"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>
    </AdminDashboard>
  );
};

export default AdminProjects;
