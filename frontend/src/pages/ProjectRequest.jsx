import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Image compression utility (shared with admin)
const compressImageToWebP = (file, quality = 0.85, lossless = true) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
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
            console.log(`🎨 Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);
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

const ProjectRequest = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceParam = searchParams.get('service');
  
  // Map URL param to service name
  const serviceMap = {
    'graphics': 'Graphics Design',
    'software': 'Software Development',
    'branding': 'Branding & Identity',
    'automation': 'Automation',
    'tech-support': 'Tech Support'
  };
  
  const preselectedService = serviceParam ? serviceMap[serviceParam] : '';
  
  const [step, setStep] = useState(preselectedService ? 'form' : 'service'); // Skip service selection if preloaded
  const [selectedService, setSelectedService] = useState(preselectedService);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    termsAccepted: false,
    // Graphics Design specific
    projectType: '',
    brandDescription: '',
    targetAudience: '',
    preferredStyles: '',
    colorPreference: '#0057FF',
    typographyPrefs: '',
    dimensions: '',
    deadline: '',
    budget: '',
    // Software Development specific
    projectScope: '',
    techStack: '',
    timeline: '',
    // Tech Support specific
    issueDescription: '',
    systemDetails: '',
    // Branding specific
    businessOverview: '',
    brandValues: '',
    targetMarket: '',
    // Automation specific
    processDescription: '',
    currentTools: '',
    desiredOutcome: ''
  });

  const services = [
    {
      id: 'Graphics Design',
      title: 'Graphics Design',
      icon: '🎨',
      description: 'Logo, flyer, brand kit, and visual design'
    },
    {
      id: 'Software Development',
      title: 'Software Development',
      icon: '💻',
      description: 'Custom websites, apps, and platforms'
    },
    {
      id: 'Branding & Identity',
      title: 'Branding & Identity',
      icon: '🌈',
      description: 'Brand kits, color palettes, identity systems'
    },
    {
      id: 'Automation',
      title: 'Automation',
      icon: '🤖',
      description: 'Workflow automation and smart tools'
    },
    {
      id: 'Tech Support',
      title: 'Tech Support',
      icon: '🛠️',
      description: 'Support and consulting for digital needs'
    }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleColorChange = (e) => {
    setFormData(prev => ({
      ...prev,
      colorPreference: e.target.value
    }));
  };

  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const compressedFiles = await Promise.all(
        files.map(file => compressImageToWebP(file, 0.85, true))
      );
      setAttachedFiles(prev => [...prev, ...compressedFiles]);
    } catch (error) {
      console.error('Error compressing files:', error);
      setMessage({ type: 'error', text: 'Error processing files' });
    }
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      setMessage({ type: 'error', text: 'You must accept the terms and conditions' });
      return;
    }

    setLoading(true);

    try {
      const formDataObj = new FormData();
      
      // Append basic fields
      formDataObj.append('serviceType', selectedService);
      formDataObj.append('clientName', formData.clientName);
      formDataObj.append('clientEmail', formData.clientEmail);
      formDataObj.append('clientPhone', formData.clientPhone);
      formDataObj.append('termsAccepted', formData.termsAccepted);
      
      // Append service-specific data as JSON
      const projectDetails = getProjectDetails();
      formDataObj.append('projectDetails', projectDetails);
      
      // Append service-specific fields
      const additionalData = getAdditionalData();
      Object.entries(additionalData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });
      
      // Append files
      attachedFiles.forEach((file, idx) => {
        formDataObj.append('attachments', file);
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/service-requests`,
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('✅ Service request submitted:', response.data);
      setStep('success');
      setMessage({ type: 'success', text: 'Request submitted successfully!' });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit request' });
      setLoading(false);
    }
  };

  const getProjectDetails = () => {
    switch (selectedService) {
      case 'Graphics Design':
        return `Project Type: ${formData.projectType}\nBrand Description: ${formData.brandDescription}\nTarget Audience: ${formData.targetAudience}\nPreferred Styles: ${formData.preferredStyles}\nDeadline: ${formData.deadline}`;
      case 'Software Development':
        return `Scope: ${formData.projectScope}\nTimeline: ${formData.timeline}`;
      case 'Branding & Identity':
        return `Business Overview: ${formData.businessOverview}\nBrand Values: ${formData.brandValues}\nTarget Market: ${formData.targetMarket}`;
      case 'Automation':
        return `Process: ${formData.processDescription}\nDesired Outcome: ${formData.desiredOutcome}`;
      case 'Tech Support':
        return `Issue: ${formData.issueDescription}\nSystem Details: ${formData.systemDetails}`;
      default:
        return '';
    }
  };

  const getAdditionalData = () => {
    const data = {};
    switch (selectedService) {
      case 'Graphics Design':
        data.projectType = formData.projectType;
        data.brandDescription = formData.brandDescription;
        data.targetAudience = formData.targetAudience;
        data.preferredStyles = formData.preferredStyles;
        data.colorPreference = formData.colorPreference;
        data.typographyPrefs = formData.typographyPrefs;
        data.dimensions = formData.dimensions;
        data.deadline = formData.deadline;
        data.budget = formData.budget;
        break;
      case 'Software Development':
        data.projectScope = formData.projectScope;
        data.techStack = formData.techStack;
        data.timeline = formData.timeline;
        data.budget = formData.budget;
        break;
      case 'Branding & Identity':
        data.businessOverview = formData.businessOverview;
        data.brandValues = formData.brandValues;
        data.targetMarket = formData.targetMarket;
        data.budget = formData.budget;
        break;
      case 'Automation':
        data.processDescription = formData.processDescription;
        data.currentTools = formData.currentTools;
        data.desiredOutcome = formData.desiredOutcome;
        data.budget = formData.budget;
        break;
      case 'Tech Support':
        data.issueDescription = formData.issueDescription;
        data.systemDetails = formData.systemDetails;
        break;
      default:
        break;
    }
    return data;
  };

  const renderForm = () => {
    switch (selectedService) {
      case 'Graphics Design':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Project Type *</label>
                <select
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                >
                  <option value="">Select project type</option>
                  <option value="Logo Design">Logo Design</option>
                  <option value="Flyer">Flyer</option>
                  <option value="Brand Kit">Brand Kit</option>
                  <option value="Business Cards">Business Cards</option>
                  <option value="Poster">Poster</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Deadline *</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Brand Description / Project Goals *</label>
              <textarea
                name="brandDescription"
                value={formData.brandDescription}
                onChange={handleChange}
                placeholder="Describe your brand, company, or project..."
                required
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Target Audience</label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  placeholder="e.g., Young professionals, Tech enthusiasts"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Preferred Styles</label>
                <input
                  type="text"
                  name="preferredStyles"
                  value={formData.preferredStyles}
                  onChange={handleChange}
                  placeholder="e.g., Modern, Minimalist, Retro"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Primary Color Preference</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="colorPreference"
                    value={formData.colorPreference}
                    onChange={handleColorChange}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{formData.colorPreference}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Typography Preferences</label>
                <input
                  type="text"
                  name="typographyPrefs"
                  value={formData.typographyPrefs}
                  onChange={handleChange}
                  placeholder="e.g., Sans-serif, Bold, Contemporary"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Dimensions / Format</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="e.g., 1200x800px, A4, Square"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Budget Range (Optional)</label>
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g., $500-$1000"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
            </div>
          </div>
        );
      
      case 'Software Development':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Project Scope *</label>
              <textarea
                name="projectScope"
                value={formData.projectScope}
                onChange={handleChange}
                placeholder="Describe what you want to build..."
                required
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Preferred Tech Stack</label>
                <input
                  type="text"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, MongoDB"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Timeline</label>
                <input
                  type="text"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  placeholder="e.g., 2-3 months"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Budget Range (Optional)</label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., $5000-$10000"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>
          </div>
        );
      
      case 'Branding & Identity':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Business Overview *</label>
              <textarea
                name="businessOverview"
                value={formData.businessOverview}
                onChange={handleChange}
                placeholder="Tell us about your business..."
                required
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Brand Values</label>
              <input
                type="text"
                name="brandValues"
                value={formData.brandValues}
                onChange={handleChange}
                placeholder="e.g., Innovation, Trust, Quality"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Target Market</label>
              <input
                type="text"
                name="targetMarket"
                value={formData.targetMarket}
                onChange={handleChange}
                placeholder="e.g., Startups, Enterprise, SMBs"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Budget Range (Optional)</label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., $2000-$5000"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>
          </div>
        );
      
      case 'Automation':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Process Description *</label>
              <textarea
                name="processDescription"
                value={formData.processDescription}
                onChange={handleChange}
                placeholder="Describe the process you want to automate..."
                required
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Current Tools/Systems</label>
              <input
                type="text"
                name="currentTools"
                value={formData.currentTools}
                onChange={handleChange}
                placeholder="e.g., Google Sheets, Zapier, Excel"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Desired Outcome</label>
              <textarea
                name="desiredOutcome"
                value={formData.desiredOutcome}
                onChange={handleChange}
                placeholder="What do you want to achieve?"
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Budget Range (Optional)</label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., $500-$2000"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>
          </div>
        );
      
      case 'Tech Support':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Issue Description *</label>
              <textarea
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleChange}
                placeholder="Describe the technical issue or support you need..."
                required
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">System/Software Details</label>
              <textarea
                name="systemDetails"
                value={formData.systemDetails}
                onChange={handleChange}
                placeholder="OS, software versions, environment details..."
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Step 1: Service Form (now main view when service param exists) */}
          {selectedService && step === 'form' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={() => navigate('/services')}
                className="mb-6 text-[#0057FF] font-semibold hover:underline flex items-center gap-2"
              >
                ← Back to Services
              </button>

              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-3xl font-bold text-[#22223B] mb-8">
                  {services.find(s => s.id === selectedService)?.icon} {selectedService} Request
                </h2>

                {message && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
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

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-xl font-bold text-[#22223B] mb-4">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#22223B] mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="clientName"
                          value={formData.clientName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#22223B] mb-2">Email *</label>
                        <input
                          type="email"
                          name="clientEmail"
                          value={formData.clientEmail}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#22223B] mb-2">Phone (Optional)</label>
                        <input
                          type="tel"
                          name="clientPhone"
                          value={formData.clientPhone}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service-Specific Form */}
                  <div>
                    <h3 className="text-xl font-bold text-[#22223B] mb-4">Project Details</h3>
                    {renderForm()}
                  </div>

                  {/* File Attachments */}
                  <div>
                    <h3 className="text-xl font-bold text-[#22223B] mb-4">Attachments (Optional)</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFilesChange}
                        className="hidden"
                        id="attachments"
                      />
                      <label htmlFor="attachments" className="cursor-pointer text-[#0057FF] font-semibold hover:underline">
                        Click to upload reference images
                      </label>
                      <p className="text-sm text-gray-500 mt-2">Compressed to WebP format</p>
                    </div>

                    {attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-[#22223B]">Attached Files:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {attachedFiles.map((file, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt="Preview"
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity text-white"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4"
                        required
                      />
                      <span className="text-sm text-gray-700">
                        I agree to the terms and conditions and understand that Smarthubz will use this information to assess my project and provide an estimate.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep('service')}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-all font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-[#0057FF] text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="mb-6 text-6xl">✅</div>
              <h2 className="text-3xl font-bold text-[#22223B] mb-4">Request Submitted!</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Thank you for reaching out. We've received your {selectedService} request and will review it shortly.
              </p>
              <p className="text-gray-600 mb-8">
                A confirmation email has been sent to <span className="font-semibold">{formData.clientEmail}</span>
              </p>
              <button
                onClick={() => {
                  navigate('/services');
                  setStep('form');
                  setSelectedService('');
                  setFormData({
                    clientName: '',
                    clientEmail: '',
                    clientPhone: '',
                    termsAccepted: false,
                  });
                  setAttachedFiles([]);
                  setMessage('');
                }}
                className="px-8 py-3 bg-[#0057FF] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Submit Another Request
              </button>
            </motion.div>
          )}
      </div>
    </div>
  );
};

export default ProjectRequest;
