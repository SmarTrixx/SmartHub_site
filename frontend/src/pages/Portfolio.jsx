import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import portfolioItems from "../data/portfolio";
import { FiArrowRight, FiSearch, FiX, FiGithub, FiLinkedin, FiMail, FiZoomIn } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Portfolio = () => {
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState(portfolioItems);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const navigate = useNavigate();

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${apiUrl}/projects?limit=100`);
        
        if (response.data.projects && response.data.projects.length > 0) {
          setAllItems(response.data.projects);
        } else {
          setAllItems(portfolioItems);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Fallback to static data
        setAllItems(portfolioItems);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch profile for About Me section
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${apiUrl}/profile`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // Extract all unique tags for filtering
  const allTags = ['All', ...new Set(allItems.flatMap(item => item.tags || []))];

  // Filter items based on active filter and search term
  useEffect(() => {
    let filtered = [...allItems];

    if (activeFilter !== 'All') {
      filtered = filtered.filter(item => (item.tags || []).includes(activeFilter));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        (item.title || '').toLowerCase().includes(term) ||
        (item.desc || '').toLowerCase().includes(term) ||
        (item.tags || []).some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredItems(filtered);
  }, [activeFilter, searchTerm, allItems]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="relative min-h-screen">
      {/* Background and main content */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: "url('/images/bg1.jpg')", // <-- Replace with your image path
        }}
        aria-hidden="true"
      >
        {/* Optional: gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0057FF]/60 via-white/30 to-cyan-200/60" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-[2.5rem] bg-white/40 backdrop-blur-xl shadow-2xl border border-white/30 p-4 md:p-12">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center text-[#22223B]">
              Our{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0057FF] to-cyan-600">
                Portfolio
              </span>
            </h1>
            <p className="mb-10 text-center text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our recent projects and see how we help brands grow with creative
              design and smart technology.
            </p>
          </motion.div>

          {/* Filter and Search Controls */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0057FF] focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
              </div>

              {/* Filter Tags */}
              <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveFilter(tag)}
                    className={`px-4 py-2 rounded-full text-md font-medium transition-all ${activeFilter === tag
                        ? 'bg-[#0057FF] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio Grid */}
          {isLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="animate-pulse">
                    <div className="bg-gray-200 h-56 w-full"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <motion.div
              layout
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredItems.map((item, i) => (
                <motion.div
                  key={item.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                className="group bg-white rounded-[3rem] shadow-md hover:shadow-xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden">
                    {(() => {
                      let imageUrl = item.image || '/android-chrome-512x512.png';
                      if (item.images && Array.isArray(item.images) && item.images.length > 0) {
                        imageUrl = item.images[0];
                      }
                      // Ensure full URL for API images
                      if (imageUrl.startsWith('/uploads/')) {
                        // Extract base URL without /api suffix
                        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
                        imageUrl = `${baseUrl}${imageUrl}`;
                      }
                      return (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/android-chrome-512x512.png';
                          }}
                        />
                      );
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0088ff]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {/* <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-[#0057FF]/60 text-[#FFFFFF] text-xs font-semibold px-3 py-1 rounded-full shadow-xl border-2 border-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div> */}
                    <button
                      onClick={() => handleItemClick(item)}
                      className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                    >
                      <span className="bg-white text-[#0057FF] px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow">
                        Quick View
                      </span>
                    </button>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="font-bold text-xl mb-2 text-[#0057FF]">
                      {item.title}
                    </h2>
                    <p className="text-gray-700 mb-4 flex-1 line-clamp-3">{item.desc}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <Link
                        to={item.link}
                        className="inline-flex items-center text-[#0057FF] font-semibold hover:underline group/link"
                      >
                        View Project
                        <FiArrowRight className="ml-2 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                      {item.date && (
                        <span className="text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Bottom stripe accent */}
                  <div className="h-4 w-full bg-gradient-to-r from-[#0057FF] to-cyan-400" />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No projects found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setActiveFilter('All');
                  setSearchTerm('');
                }}
                className="mt-4 px-6 py-2 bg-[#0057FF] text-white rounded-full hover:bg-[#0047D4] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* About Me Section */}
          <section className="mt-24">
            <div className="max-w-5xl mx-auto px-6 py-12 bg-gradient-to-br from-[#ffffFF]/30 to-cyan-100 rounded-[3rem] shadow-2xl border border-[#0057FF]/10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {(() => {
                  let avatarUrl = profile?.avatar || "/android-chrome-512x512.png";
                  // Add API URL prefix for uploaded images
                  if (avatarUrl.startsWith('/uploads/')) {
                    const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
                    avatarUrl = `${baseUrl}${avatarUrl}`;
                  }
                  return (
                    <img
                      src={avatarUrl}
                      alt={profile?.name || "Smarthubz Studio"}
                      className="w-40 h-40 rounded-full border-4 border-[#0057FF] shadow-lg object-cover"
                      onError={(e) => {
                        e.target.src = '/android-chrome-512x512.png';
                      }}
                    />
                  );
                })()}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-extrabold text-[#0057FF] mb-2">{profile?.name || 'Smarthubz Studio'}</h3>
                  <p className="text-lg font-semibold text-gray-700 mb-1">{profile?.title || 'Full Stack Developer & Designer'}</p>
                  <p className="text-gray-600 mb-4">
                    {profile?.bio || "We are passionate about building creative solutions for real-world problems."}<br />
                    Let's connect and collaborate!
                  </p>
                  <div className="flex justify-center md:justify-start gap-4 mt-2">
                    <a href={profile?.email ? `mailto:${profile.email}` : "mailto:smarthubzstudio@gmail.com"} target="_blank" rel="noopener noreferrer"
                      className="bg-white rounded-full p-3 shadow hover:bg-[#0057FF]/10 transition-colors">
                      <FiMail className="text-[#0057FF] text-2xl" />
                    </a>
                    <a href={profile?.socialLinks?.github || "https://github.com/smartrixx"} target="_blank" rel="noopener noreferrer"
                      className="bg-white rounded-full p-3 shadow hover:bg-[#0057FF]/10 transition-colors">
                      <FiGithub className="text-[#0057FF] text-2xl" />
                    </a>
                    <a href={profile?.socialLinks?.linkedin || "https://linkedin.com/in/tunde-yusuf"} target="_blank" rel="noopener noreferrer"
                      className="bg-white rounded-full p-3 shadow hover:bg-[#0057FF]/10 transition-colors">
                      <FiLinkedin className="text-[#0057FF] text-2xl" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Project Modal - move here! */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative bg-white rounded-[3rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <FiX className="text-gray-700" />
              </button>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="rounded-xl overflow-hidden relative group cursor-pointer" onClick={() => {
                    navigate(selectedItem.link || `/portfolio/${selectedItem.id}`);
                    closeModal();
                  }}>
                    <img
                      src={(() => {
                        let imageUrl = selectedItem.image || '/android-chrome-512x512.png';
                        if (imageUrl.startsWith('/uploads/')) {
                          const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
                          imageUrl = `${baseUrl}${imageUrl}`;
                        }
                        return imageUrl;
                      })()}
                      alt={selectedItem.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/android-chrome-512x512.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <FiZoomIn className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#0057FF] mb-4">
                      {selectedItem.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedItem.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-[#0057FF]/10 text-[#0057FF] text-xs font-semibold px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6">{selectedItem.desc}</p>

                    {selectedItem.details && (
                      <div className="space-y-4 mb-6">
                        {Object.entries(selectedItem.details).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="font-medium text-gray-900 w-32">{key}:</span>
                            <span className="text-gray-700">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('[Portfolio Button] Clicked - item:', selectedItem.id);
                        const targetPath = selectedItem.link || `/portfolio/${selectedItem.id}`;
                        console.log('[Portfolio Button] Target:', targetPath);
                        
                        // Navigate first, then close modal
                        navigate(targetPath);
                        // Add a small delay before closing to ensure navigation starts
                        setTimeout(() => {
                          closeModal();
                        }, 50);
                      }}
                      className="inline-flex items-center px-6 py-3 bg-[#0057FF] text-white rounded-full font-medium hover:bg-[#0047D4] transition-colors cursor-pointer"
                    >
                      View Full Project
                      <FiArrowRight className="ml-2" />
                    </button>
                  </div>
                </div>

                {selectedItem.testimonial && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <blockquote className="italic text-gray-700 mb-4">
                      "{selectedItem.testimonial}"
                    </blockquote>
                    <div className="flex items-center">
                      <img
                        src={selectedItem.clientAvatar}
                        alt={selectedItem.clientName}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium">{selectedItem.clientName}</p>
                        <p className="text-sm text-gray-500">{selectedItem.clientRole}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
            onClick={() => setFullscreenImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setFullscreenImage(null)}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/20 hover:bg-white/40 transition-colors z-10"
              >
                <FiX className="text-white text-3xl" />
              </button>

              <img
                src={fullscreenImage}
                alt="Fullscreen view"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = '/android-chrome-512x512.png';
                }}
              />

              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm">
                Click anywhere to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Portfolio;