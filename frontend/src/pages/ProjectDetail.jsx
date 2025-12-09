import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import portfolioItems from '../data/portfolio';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiTwitter, FiFacebook, FiLinkedin } from 'react-icons/fi';
import axios from 'axios';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure scroll is enabled when component mounts
    document.body.style.overflow = 'auto';

    let isMounted = true;

    const loadProject = async () => {
      console.log(`[ProjectDetail] Loading project: ${projectId}`);
      
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const url = `${apiUrl}/projects/${projectId}`;
        console.log(`[ProjectDetail] API URL: ${url}`);
        
        const response = await axios.get(url);
        if (!isMounted) return;
        
        console.log(`[ProjectDetail] ✓ Success:`, response.data.id);
        setProject(response.data);
        
        // Fetch related projects
        try {
          const allRes = await axios.get(`${apiUrl}/projects?limit=100`);
          const all = allRes.data.projects || [];
          const related = all.filter(item => 
            item.id !== response.data.id && 
            item.tags && response.data.tags &&
            item.tags.some(tag => response.data.tags.includes(tag))
          ).slice(0, 3);
          if (isMounted) setRelatedProjects(related);
        } catch (e) {
          console.error('Related projects error:', e);
          if (isMounted) setRelatedProjects([]);
        }
        
        if (isMounted) setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        
        console.log(`[ProjectDetail] ✗ API Error:`, err.response?.status, err.message);
        
        // Try static data
        const staticProject = portfolioItems.find(p => p.id === projectId);
        if (staticProject) {
          console.log(`[ProjectDetail] ✓ Found in static data`);
          setProject(staticProject);
          const related = portfolioItems.filter(p => 
            p.id !== staticProject.id && 
            p.tags.some(tag => staticProject.tags.includes(tag))
          ).slice(0, 3);
          setRelatedProjects(related);
          setIsLoading(false);
        } else {
          console.log(`[ProjectDetail] ✗ Not found - redirecting to portfolio`);
          setIsLoading(false);
          // Use navigate from router - it's stable enough for error cases
          navigate('/portfolio', { replace: true });
        }
      }
    };

    loadProject();

    return () => {
      isMounted = false;
      document.body.style.overflow = 'auto';
    };
  }, [projectId, navigate]);

  const handlePrevImage = () => {
    if (project && project.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? project.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (project && project.images) {
      setCurrentImageIndex((prev) => 
        prev === project.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#0057FF] border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: "url('/images/bg1.jpg')",
        }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0057FF]/60 via-white/30 to-cyan-200/60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 mb-8 text-[#0057FF] hover:text-cyan-600 font-semibold transition-colors"
          >
            <FiArrowLeft size={20} />
            Back to Portfolio
          </Link>
        </motion.div>

        {/* Main Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[2.5rem] bg-white/40 backdrop-blur-xl shadow-2xl border border-white/30 p-6 md:p-12 overflow-hidden"
        >
          {/* Project Title and Meta */}
          <div className="mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold mb-4 text-[#22223B]"
            >
              {project.title}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-[#0057FF] to-cyan-600 text-white rounded-full text-sm font-semibold"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-col md:flex-row gap-4 md:gap-12 text-gray-700"
            >
              <div>
                <span className="font-semibold text-[#22223B]">Client:</span> {project.client}
              </div>
              <div>
                <span className="font-semibold text-[#22223B]">Year:</span> {project.year}
              </div>
            </motion.div>
          </div>

          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-4 bg-gray-100">
              <img
                src={(() => {
                  let imageUrl = project.images[currentImageIndex];
                  if (imageUrl.startsWith('/uploads/')) {
                    const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
                    imageUrl = `${baseUrl}${imageUrl}`;
                  }
                  return imageUrl;
                })()}
                alt={project.title}
                className="w-full h-auto object-contain"
              />
              
              {project.images.length > 1 && (
                <>
                  {/* Navigation Buttons */}
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#0057FF] p-3 rounded-full transition-all shadow-lg z-20"
                    aria-label="Previous image"
                  >
                    <FiArrowLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#0057FF] p-3 rounded-full transition-all shadow-lg z-20"
                    aria-label="Next image"
                  >
                    <FiArrowRight size={24} />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {currentImageIndex + 1} / {project.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Image Indicators */}
            {project.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {project.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-[#0057FF] w-8'
                        : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Content Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid md:grid-cols-2 gap-12 mb-12"
          >
            {/* Left Column - Overview */}
            <div>
              <h2 className="text-2xl font-bold text-[#22223B] mb-4">Project Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-8">
                {project.fullDescription}
              </p>
            </div>

            {/* Right Column - Challenge & Solution */}
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#22223B] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#0057FF] rounded-full"></span>
                  Challenge
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.challenge}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#22223B] mb-3 flex items-center gap-2">
                  <FiCheckCircle className="text-cyan-600" size={20} />
                  Solution
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {project.solution}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tools & Technologies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-12 pb-12 border-b border-white/30"
          >
            <h2 className="text-2xl font-bold text-[#22223B] mb-6">Tools & Technologies</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {project.tools.map((tool, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#0057FF]/10 to-cyan-600/10 border border-[#0057FF]/30 rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
                >
                  <p className="font-semibold text-[#22223B]">{tool}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-gray-700 text-lg mb-6">
              Interested in a similar project? Let's bring your ideas to life!
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0057FF] to-cyan-600 text-white font-bold rounded-full hover:shadow-lg transition-all hover:scale-105"
            >
              Start Your Project
              <FiArrowRight size={20} />
            </Link>
          </motion.div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="border-t border-white/30 pt-12"
            >
              <h2 className="text-2xl font-bold text-[#22223B] mb-8">Related Projects</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedProjects.map((relatedProject, index) => (
                  <motion.div
                    key={relatedProject.id}
                    whileHover={{ scale: 1.05 }}
                    className="group cursor-pointer"
                  >
                    <Link to={`/portfolio/${relatedProject.id}`}>
                      <div className="relative rounded-2xl overflow-hidden mb-4 h-64 shadow-lg">
                        <img
                          src={(() => {
                            let imageUrl = relatedProject.image;
                            if (imageUrl.startsWith('/uploads/')) {
                              const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
                              imageUrl = `${baseUrl}${imageUrl}`;
                            }
                            return imageUrl;
                          })()}
                          alt={relatedProject.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-white font-bold flex items-center gap-2">
                            View Project <FiArrowRight size={18} />
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-[#22223B] group-hover:text-[#0057FF] transition-colors mb-2">
                        {relatedProject.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {relatedProject.desc}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {relatedProject.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="text-xs bg-[#0057FF]/20 text-[#0057FF] px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-gray-700 font-semibold mb-4">Share this project</p>
          <div className="flex justify-center gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20amazing%20project:%20${project.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/40 hover:bg-white/60 text-[#0057FF] rounded-full transition-all shadow-lg hover:shadow-xl"
              aria-label="Share on Twitter"
            >
              <FiTwitter size={20} />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/40 hover:bg-white/60 text-[#0057FF] rounded-full transition-all shadow-lg hover:shadow-xl"
              aria-label="Share on Facebook"
            >
              <FiFacebook size={20} />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/40 hover:bg-white/60 text-[#0057FF] rounded-full transition-all shadow-lg hover:shadow-xl"
              aria-label="Share on LinkedIn"
            >
              <FiLinkedin size={20} />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetail;
