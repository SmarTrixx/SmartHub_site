import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/contact', label: 'Contact' },
  { to: '/about', label: 'About' },
];

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 shadow-md ${isScrolled
        ? 'bg-[#ffffff]/70 backdrop-blur-md shadow-lg'
        : 'bg-[#ffffff]/90 backdrop-blur-md'
      }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4 md:px-6 lg:px-8">
        {/* Logo/Brand */}
        <Link
          to="/"
          className="flex items-center gap-3 font-extrabold text-2xl text-[#F5F5F7] hover:opacity-90 transition-opacity"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center overflow-hidden"
          >
            <img
              src="/images/smartlogo2.png"
              alt="SmartHub Logo"
              className="w-full h-full object-contain"
            />
          </motion.div>

          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:inline text-transparent bg-clip-text bg-gradient-to-r from-black to-blue-300"
          >
            Sm@rtHub
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={link.to}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all ${location.pathname === link.to
                    ? 'text-white bg-[#5C85F2]/90'
                    : 'text-black/90 hover:text-black hover:bg-black/10'
                  }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <motion.span
                    layoutId="navUnderline"
                    className="absolute left-0 bottom-0 w-full h-0.5 bg-white"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="hidden md:block"
        >
          <Link
            to="/contact"
            className="px-6 py-3 border-2 border-#5C85F2 bg-[#5C81F7]/100 text-[#ffffff] font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg"
          >
            Get Started
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-4 pb-6 pt-2 space-y-2 bg-[#0069ff]/95 backdrop-blur-md">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 rounded-lg font-medium transition ${location.pathname === link.to
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/contact"
                className="block mt-4 px-6 py-3 text-center bg-white text-[#0069ff] font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-md"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;