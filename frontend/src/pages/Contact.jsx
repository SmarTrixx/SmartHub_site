import { useState, useEffect } from 'react';
import { FiSend, FiMapPin, FiPhone, FiMail, FiCheckCircle, FiAlertCircle, FiTwitter, FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactInfo, setContactInfo] = useState({
    email: 'contact.smarthubz@gmail.com',
    phone: '+234 903 922 3824',
    location: 'Nigeria',
    workAvailability: 'Available',
    availableTime: 'Sat-Sun, 24hrs',
    socialLinks: {
      twitter: 'https://twitter.com/smarthubz_studio',
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com/smarthubz.studio',
      linkedin: 'https://linkedin.com',
      tiktok: 'https://www.tiktok.com/@smarthubzstudio'
    }
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch contact info from API
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${apiUrl}/profile`);
        if (response.data) {
          const links = response.data.socialLinks || {};
          setContactInfo(prev => ({
            email: response.data.email || prev.email,
            phone: response.data.phone || prev.phone,
            location: response.data.location || prev.location,
            workAvailability: response.data.workAvailability || prev.workAvailability,
            availableTime: response.data.availableTime || prev.availableTime,
            socialLinks: {
              twitter: links.twitter || "https://twitter.com",
              facebook: links.facebook || "https://facebook.com",
              instagram: links.instagram || "https://instagram.com",
              linkedin: links.linkedin || "https://linkedin.com",
              tiktok: links.tiktok || "https://www.tiktok.com/@smarthubzstudio"
            }
          }));
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
      }
    };

    fetchContactInfo();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      // Clear any previous submission errors
      setErrors({});
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const response = await axios.post(`${apiUrl}/contact`, {
          name: formData.name,
          email: formData.email,
          message: formData.message
        });

        if (response.data.success) {
          setIsSuccess(true);
          setFormData({ name: '', email: '', message: '' });
          // Hide success message after 5 seconds
          setTimeout(() => setIsSuccess(false), 5000);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        setErrors({
          submit: error.response?.data?.message || 'Failed to send message. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Full background image with gradient overlay */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/bg1.jpg')", // Change to your preferred image
        }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0057FF]/50 via-white/90 to-cyan-200/60 backdrop-blur-md" />
      </div>

      {/* Main glassmorphism container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center text-[#22223B]">
            Get in <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0057FF] to-cyan-600">Touch</span>
          </h1>
          <p className="mb-10 text-center text-xl font-bold text-gray-800 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have a question, feedback, or just want to say hello, feel free to reach out.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="rounded-[3rem] bg-white/60 backdrop-blur-xl shadow-2xl border border-white/30 p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-[#0057FF]">Send us a message</h2>
            
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 text-green-700 rounded-[3rem] flex items-start"
              >
                <FiCheckCircle className="text-green-500 text-xl mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Thank you for your message!</p>
                  <p className="text-sm">We'll get back to you as soon as possible.</p>
                </div>
              </motion.div>
            )}

            {errors.submit && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 text-red-700 rounded-[3rem] flex items-start"
              >
                <FiAlertCircle className="text-red-500 text-xl mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Failed to send message</p>
                  <p className="text-sm">{errors.submit}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="name">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-[3rem] border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0057FF] focus:border-transparent transition-all bg-white/70 backdrop-blur`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-[3rem] border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0057FF] focus:border-transparent transition-all bg-white/70 backdrop-blur`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="message">
                  Your Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className={`w-full px-4 py-3 rounded-[1rem] border ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#0057FF] focus:border-transparent transition-all bg-white/70 backdrop-blur`}
                  placeholder="How can we help you?"
                ></textarea>
                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-full font-medium text-white ${isSubmitting ? 'bg-[#0057FF]/80' : 'bg-[#0057FF] hover:bg-[#0047D4]'} transition-colors duration-300`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Information & Socials */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="rounded-[3rem] bg-white/60 backdrop-blur-xl shadow-2xl border border-white/30 p-8">
              <h2 className="text-2xl font-bold mb-6 text-[#0057FF]">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-[#0057FF]/10 p-3 rounded-full mr-4">
                    <FiMail className="text-[#0057FF] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">{contactInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#0057FF]/10 p-3 rounded-full mr-4">
                    <FiPhone className="text-[#0057FF] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600">{contactInfo.phone}</p>
                    <p className="text-gray-600">{contactInfo.availableTime}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-[#0057FF]/10 p-3 rounded-full mr-4">
                    <FiMapPin className="text-[#0057FF] text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Office</h3>
                    <p className="text-gray-600">{contactInfo.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="rounded-[3rem] bg-white/60 backdrop-blur-xl shadow-2xl border border-white/30 p-8">
              <h2 className="text-2xl font-bold mb-6 text-[#0057FF] flex items-center gap-2">
                <FiSend className="text-[#0057FF]" /> Follow Us
              </h2>
              <div className="flex space-x-4">
                <a href={contactInfo.socialLinks?.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#0057FF] hover:text-white hover:scale-105 transition-all duration-300" aria-label="Twitter">
                  <FiTwitter className="text-2xl" />
                </a>
                <a href={contactInfo.socialLinks?.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#0057FF] hover:text-white hover:scale-105 transition-all duration-300" aria-label="Facebook">
                  <FiFacebook className="text-2xl" />
                </a>
                <a href={contactInfo.socialLinks?.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#0057FF] hover:text-white hover:scale-105 transition-all duration-300" aria-label="Instagram">
                  <FiInstagram className="text-2xl" />
                </a>
                <a href={contactInfo.socialLinks?.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#0057FF] hover:text-white hover:scale-105 transition-all duration-300" aria-label="LinkedIn">
                  <FiLinkedin className="text-2xl" />
                </a>
                <a href={contactInfo.socialLinks?.tiktok} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-[#0057FF] hover:text-white hover:scale-105 transition-all duration-300" aria-label="TikTok">
                  <FaTiktok className="text-2xl" />
                </a>
              </div>
            </div>            {/* Map Placeholder */}
            <div className="rounded-[3rem] bg-white/60 backdrop-blur-xl shadow-2xl border border-white/30 overflow-hidden">
              <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400 relative">
                <FiMapPin className="text-3xl mr-2 absolute left-4 top-4 z-10" />
                <img src="/images/map.png" alt="Map Placeholder" className="w-full h-full object-cover rounded-2xl opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-cyan-100/30 pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;