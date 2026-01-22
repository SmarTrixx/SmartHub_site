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
  const [showDesignGuide, setShowDesignGuide] = useState(false);
  
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
      
      // Check if email was actually sent
      const emailSent = response.data.emailSent === true;
      const successMsg = emailSent 
        ? 'Request submitted successfully! Confirmation email sent.' 
        : 'Request submitted successfully. Email delivery may be delayed.';
      
      setStep('success');
      setMessage({ type: 'success', text: successMsg, emailSent });
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
        data.targetAudience = formData.targetAudience;
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
          <div className="space-y-8">
            {/* What do you need? */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#22223B] mb-3">What do you need designed? *</label>
                <p className="text-sm text-gray-600 mb-3">It's okay if you're not sure about the details — we'll guide you.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'Logo Design', label: '🎯 Logo' },
                  { value: 'Flyer', label: '📄 Flyer' },
                  { value: 'Business Cards', label: '💳 Business Cards' },
                  { value: 'Social Media', label: '📱 Social Media' },
                  { value: 'Poster', label: '📌 Poster' },
                  { value: 'Other', label: '✨ Other' }
                ].map(option => (
                  <label key={option.value} className="relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all" style={{
                    borderColor: formData.projectType === option.value ? '#0057FF' : '#e5e7eb',
                    backgroundColor: formData.projectType === option.value ? '#0057FF15' : 'white'
                  }}>
                    <input
                      type="radio"
                      name="projectType"
                      value={option.value}
                      checked={formData.projectType === option.value}
                      onChange={handleChange}
                      required
                      className="sr-only"
                    />
                    <span className="text-center flex-1 font-medium text-[#22223B]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* About your project */}
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Tell us about your project *</label>
              <p className="text-sm text-gray-600 mb-3">Who are you? What's your business about? What's the main message?</p>
              <textarea
                name="brandDescription"
                value={formData.brandDescription}
                onChange={handleChange}
                placeholder="E.g., I'm a fitness coach helping busy professionals get fit. I want a logo that says 'strong and approachable'."
                required
                rows="4"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            {/* Who will see this? */}
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Who will see this? (Optional)</label>
              <p className="text-sm text-gray-600 mb-3">E.g., young professionals, parents, students</p>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                placeholder="Not sure? We can help figure this out."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            {/* What's the vibe? */}
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-3">What's the overall feel? (Optional)</label>
              <p className="text-sm text-gray-600 mb-3">Choose what resonates with you, or we can decide together.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { value: 'Clean & Simple', emoji: '✨' },
                  { value: 'Bold & Eye-catching', emoji: '⚡' },
                  { value: 'Elegant & Professional', emoji: '🎩' },
                  { value: 'Playful & Fun', emoji: '🎨' },
                  { value: 'Minimal & Modern', emoji: '◻️' },
                  { value: 'Classic & Timeless', emoji: '📚' },
                  { value: 'Not sure yet', emoji: '🤔' }
                ].map(option => (
                  <label key={option.value} className="relative flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all" style={{
                    borderColor: formData.preferredStyles === option.value ? '#0057FF' : '#e5e7eb',
                    backgroundColor: formData.preferredStyles === option.value ? '#0057FF15' : 'white'
                  }}>
                    <input
                      type="radio"
                      name="preferredStyles"
                      value={option.value}
                      checked={formData.preferredStyles === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-1">{option.emoji}</span>
                    <span className="text-xs text-center font-medium text-[#22223B]">{option.value}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Colors and fonts - simplified */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Color preference? (Optional)</label>
                <p className="text-sm text-gray-600 mb-3">Pick your favorite color, or we'll choose for you.</p>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="colorPreference"
                    value={formData.colorPreference}
                    onChange={handleColorChange}
                    className="w-16 h-16 rounded cursor-pointer border-2 border-gray-300"
                  />
                  <span className="text-sm text-gray-600">{formData.colorPreference}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">Font style? (Optional)</label>
                <p className="text-sm text-gray-600 mb-3">Easy to read? Bold? Elegant?</p>
                <input
                  type="text"
                  name="typographyPrefs"
                  value={formData.typographyPrefs}
                  onChange={handleChange}
                  placeholder="E.g., Easy to read, Bold & strong"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
            </div>

            {/* Size and timeline */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">What size? (Optional)</label>
                <p className="text-sm text-gray-600 mb-3">E.g., A4 page, square for social media, any size</p>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="Not sure? We'll figure it out."
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#22223B] mb-2">When do you need it? *</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Budget? (Optional)</label>
              <p className="text-sm text-gray-600 mb-3">Helps us understand your expectations. Leave blank if you'd like us to suggest.</p>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="E.g., ₦5,000 - ₦15,000"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            {/* Collapsible Sample Section - Only show if project type is selected */}
            {formData.projectType && (
              <div className="border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowDesignGuide(!showDesignGuide)}
                  className="flex items-center gap-2 text-[#0057FF] font-semibold hover:underline mb-4"
                >
                  {showDesignGuide ? '▼' : '▶'} View example design breakdown
                </button>

                {showDesignGuide && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">
                      This is just a visual guide to help you — you don't need to know the terms.
                    </p>
                    
                    {/* Sample images based on project type */}
                    <div className="bg-white p-4 rounded border border-gray-300">
                      {formData.projectType === 'Logo Design' && (
                        <div className="space-y-3 text-center">
                          <img src="/images/sample-logo-breakdown.svg" alt="Logo design example" className="w-full h-auto max-w-xs mx-auto" onError={(e) => {
                            e.target.style.display = 'none';
                          }} />
                          <div className="text-xs text-gray-600">
                            <p>← Brand name, Main symbol, Hidden message →</p>
                          </div>
                        </div>
                      )}
                      {formData.projectType === 'Flyer' && (
                        <div className="space-y-3 text-center">
                          <img src="/images/sample-flyer-breakdown.svg" alt="Flyer design example" className="w-full h-auto max-w-xs mx-auto" onError={(e) => {
                            e.target.style.display = 'none';
                          }} />
                          <div className="text-xs text-gray-600">
                            <p>← Headline, Main image, Details, Call to action →</p>
                          </div>
                        </div>
                      )}
                      {formData.projectType === 'Social Media' && (
                        <div className="space-y-3 text-center">
                          <img src="/images/sample-social-breakdown.svg" alt="Social media design example" className="w-full h-auto max-w-xs mx-auto" onError={(e) => {
                            e.target.style.display = 'none';
                          }} />
                          <div className="text-xs text-gray-600">
                            <p>← Main message, Eye-catching image, Your contact →</p>
                          </div>
                        </div>
                      )}
                      {formData.projectType === 'Business Cards' && (
                        <div className="space-y-3 text-center">
                          <img src="/images/sample-card-breakdown.svg" alt="Business card design example" className="w-full h-auto max-w-xs mx-auto" onError={(e) => {
                            e.target.style.display = 'none';
                          }} />
                          <div className="text-xs text-gray-600">
                            <p>← Logo, Name, Title, Contact details →</p>
                          </div>
                        </div>
                      )}
                      {formData.projectType === 'Poster' && (
                        <div className="space-y-3 text-center">
                          <img src="/images/sample-poster-breakdown.svg" alt="Poster design example" className="w-full h-auto max-w-xs mx-auto" onError={(e) => {
                            e.target.style.display = 'none';
                          }} />
                          <div className="text-xs text-gray-600">
                            <p>← Main headline, Image/graphics, Details, Event info →</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case 'Software Development':
        return (
          <div className="space-y-8">
            {/* What do you want to build? */}
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-3">What do you want to build? *</label>
              <p className="text-sm text-gray-600 mb-4">Don't worry about technical details. Tell us your idea in simple words. We'll work out the rest together.</p>
              <textarea
                name="projectScope"
                value={formData.projectScope}
                onChange={handleChange}
                placeholder="E.g., I want a website where customers can order food online and pay with their card. OR I need an app where teachers can track student attendance."
                required
                rows="5"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            {/* Who will use it? */}
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">Who will use this? (Optional)</label>
              <p className="text-sm text-gray-600 mb-3">Customers? Employees? The general public?</p>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                placeholder="E.g., Restaurant customers, School staff, Small business owners"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">When do you need it ready? (Optional)</label>
              <p className="text-sm text-gray-600 mb-3">A rough timeframe helps us plan better.</p>
              <input
                type="text"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                placeholder="E.g., 1-2 months, ASAP, 3 months"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            {/* Do you have preferences? */}
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-3">Do you have tech preferences? (Optional)</label>
              <p className="text-sm text-gray-600 mb-3">If you have experience with specific tools, let us know. Otherwise, we'll recommend the best options for your project.</p>
              <input
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleChange}
                placeholder="E.g., WordPress, React, Python... or 'I'm not sure, surprise me!'"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-[#22223B] mb-2">What's your budget? (Optional)</label>
              <p className="text-sm text-gray-600 mb-3">Helps us suggest the right solution. Leave blank if unsure.</p>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="E.g., ₦100,000 - ₦500,000 or $5,000-$15,000"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Tip:</strong> The more details you share, the better we can help. But it's totally okay if your idea is rough or you're not sure about something — that's what we're here for!
              </p>
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
                className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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

              <div className="bg-white rounded-[2.5rem] shadow-lg p-8 mb-8">
                <h2 className="text-3xl font-bold text-[#22223B] mb-8">
                  {services.find(s => s.id === selectedService)?.icon} {selectedService} Request
                </h2>

                {message && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 rounded-[2.5rem] mb-6 flex items-center gap-3 ${
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
                          className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                          className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                          className="w-full px-4 py-2 border rounded-[2.5rem] focus:outline-none focus:ring-2 focus:ring-[#0057FF]"
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
                      <p className="text-sm text-gray-500 mt-2">Upload closely related sample images only.</p>
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
                                className="w-full h-24 object-cover rounded-[2.5rem]"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-[2.5rem] transition-opacity text-white"
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
                        I agree to the <a href="/terms" className="text-[#0057FF] hover:underline">terms and conditions</a> and understand that Smarthubz will use this information to assess my project and provide an estimate.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => navigate('/services')}

                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-[2.5rem] hover:border-gray-400 transition-all font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-[#0057FF] text-white rounded-[2.5rem] hover:shadow-lg transition-all font-semibold disabled:opacity-50"
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
                {message.emailSent 
                  ? (<><span className="font-semibold">{formData.clientEmail}</span> has received a confirmation email from us!</>)
                  : (<>Please check <span className="font-semibold">{formData.clientEmail}</span> for a confirmation email (it may be delayed).</>)
                }
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
                className="px-8 py-3 bg-[#0057FF] text-white rounded-[2.5rem] hover:shadow-lg transition-all font-semibold"
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
