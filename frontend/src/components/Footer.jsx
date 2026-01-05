import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
// import { AiFillTikTok } from "react-icons/ai";
import { FaTiktok } from "react-icons/fa";
import { 
  FiGithub, 
  FiLinkedin, 
  FiMail, 
  FiTwitter,
  FiInstagram,
  FiArrowUp
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/contact', label: 'Contact' },
];

const Footer = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  const [socialLinks, setSocialLinks] = useState([
    {
      icon: <FiMail className="text-xl" />,
      url: "mailto:smarthubzstudio@gmail.com",
      label: "Email",
      color: "bg-rose-100 text-rose-600"
    },
    {
      icon: <FiGithub className="text-xl" />,
      url: "https://github.com/SmarTrixx",
      label: "GitHub",
      color: "bg-gray-100 text-gray-800"
    },
    {
      icon: <FiLinkedin className="text-xl" />,
      url: "https://www.linkedin.com/in/tunde-yusuf-40408a194",
      label: "LinkedIn",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <FiTwitter className="text-xl" />,
      url: "https://twitter.com/smarthubz_studio",
      label: "Twitter",
      color: "bg-sky-100 text-sky-600"
    },
    {
      icon: <FiInstagram className="text-xl" />,
      url: "https://instagram.com/smarthubz.studio",
      label: "Instagram",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: <FaTiktok className="text-xl" />,
      url: "https://www.tiktok.com/@smarthubzstudio",
      label: "TikTok",
      color: "bg-black text-white"
    } 
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch social links from API
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${apiUrl}/profile`);
        if (response.data) {
          const links = response.data.socialLinks || {};
          const updatedSocials = [];
          
          // Email - always show
          updatedSocials.push({
            icon: <FiMail className="text-xl" />,
            url: `mailto:${response.data.email || 'smarthubzstudio@gmail.com'}`,
            label: "Email",
            color: "bg-rose-100 text-rose-600"
          });
          
          // GitHub - use DB value or fallback
          updatedSocials.push({
            icon: <FiGithub className="text-xl" />,
            url: links.github || "https://github.com/SmarTrixx",
            label: "GitHub",
            color: "bg-gray-100 text-gray-800"
          });
          
          // LinkedIn - use DB value or fallback
          updatedSocials.push({
            icon: <FiLinkedin className="text-xl" />,
            url: links.linkedin || "https://www.linkedin.com/in/tunde-yusuf-40408a194",
            label: "LinkedIn",
            color: "bg-blue-100 text-blue-600"
          });
          
          // Twitter - use DB value or fallback
          updatedSocials.push({
            icon: <FiTwitter className="text-xl" />,
            url: links.twitter || "https://twitter.com/smarthub",
            label: "Twitter",
            color: "bg-sky-100 text-sky-600"
          });
          
          // Instagram - use DB value or fallback
          updatedSocials.push({
            icon: <FiInstagram className="text-xl" />,
            url: links.instagram || "https://instagram.com/smarthub",
            label: "Instagram",
            color: "bg-pink-100 text-pink-600"
          });

          // TikTok - use DB value or fallback
          updatedSocials.push({
            icon: <FaTiktok className="text-xl" />,
            url: links.tiktok || "https://www.tiktok.com/@smarthubzstudio",
            label: "TikTok",
            color: "bg-black text-white"
          });
          
          setSocialLinks(updatedSocials);
        }
      } catch (error) {
        console.error('Error fetching social links:', error);
        // Keep default values on error
      }
    };

    fetchSocialLinks();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const footerLinks = [
    { name: "Privacy Policy", url: "/privacy" },
    { name: "Terms of Service", url: "/terms" },
    { name: "Contact Us", url: "/contact" },
    { name: "Careers", url: "/careers" }
  ];

  return (
    <footer className="relative bg-gradient-to-r from-[#0057FF]/5 to-white-500 border-t border-gray-200 pt-0 pb-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto pt-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-full flex items-center justify-center">
                <img 
                  src="/images/smartlogo2.png" 
                  alt="Smarthubz Studio Logo" 
                  className="w-13 h-8 "
                />
              </div>
              <span className="font-bold text-lg text-[#0057FF]">Smarthubz Studio</span>
            </div>
            <p className="text-gray-800 text-md">
              Building innovative solutions for the digital world.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} rounded-lg p-2 hover:shadow-md transition-all`}
                  aria-label={social.label}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <a 
                    href={link.to} 
                    className="text-gray-800 hover:text-[#0057FF] transition-colors text-md"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.url} 
                    className="text-gray-800 hover:text-[#0057FF] transition-colors text-md"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Newsletter</h3>
            <p className="text-gray-800 text-md mb-3">
              Subscribe to our newsletter for the latest updates.
            </p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your Email" 
                className="flex-1 px-3 py-2 text-md border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0057FF] focus:border-transparent"
                required
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-[#0057FF] text-white text-md font-medium rounded-lg hover:bg-[#0047D4] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-800 text-md">
            © {currentYear} <span className="font-bold text-[#0057FF]">Smarthubz Studio</span>. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            {footerLinks.slice(0, 2).map((link, index) => (
              <a 
                key={index}
                href={link.url} 
                className="text-gray-800 hover:text-[#0057FF] transition-colors text-md"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 bg-[#0057FF] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#0047D4] transition-colors z-40"
            aria-label="Scroll to top"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowUp className="text-xl" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;