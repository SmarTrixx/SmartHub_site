import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import portfolioItems from "../data/portfolio";

const heroImages = [
  "/images/bgw4.jpg",
  "/images/bgw.png",
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80",
];

const services = [
  {
    icon: "💻",
    title: "Software Development",
    desc: "Custom web apps, landing pages, dashboards, and solutions tailored to your needs.",
  },
  {
    icon: "🎨",
    title: "Graphics & Branding",
    desc: "Logos, flyers, mockups, and full brand kits that speak volumes.",
  },
  {
    icon: "📱",
    title: "Tech Support & Automation",
    desc: "Simplify your workflow with automation tools and smart integrations.",
  },
];

const brandVariants = ["Smm@rtHub", "Smm@rtDesign", "Smm@rTrix", "Smm@rtDev"];

const Home = () => {
  const [heroIdx, setHeroIdx] = useState(0);
  const [portfolioIdx, setPortfolioIdx] = useState(0);
  const [typedBrand, setTypedBrand] = useState("");
  const [brandIdx, setBrandIdx] = useState(0);

  useEffect(() => {
    let i = 0;
    let timeout;
    let interval;

    const type = () => {
      setTypedBrand("");
      interval = setInterval(() => {
        const currentWord = brandVariants[brandIdx];
        if (i < currentWord.length) {
          setTypedBrand((prev) => prev + currentWord.charAt(i));
          i++;
        } else {
          clearInterval(interval);
          timeout = setTimeout(() => erase(), 1200);
        }
      }, 120);
    };

    const erase = () => {
      interval = setInterval(() => {
        setTypedBrand((prev) => prev.slice(0, -1));
        i--;
        if (i <= 0) {
          clearInterval(interval);
          setBrandIdx((prev) => (prev + 1) % brandVariants.length);
        }
      }, 60);
    };

    type();

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line
  }, [brandIdx]);

  const nextHero = () => setHeroIdx((i) => (i + 1) % heroImages.length);
  const prevHero = () => setHeroIdx((i) => (i - 1 + heroImages.length) % heroImages.length);

  // Portfolio carousel logic
  const getPortfolioIndices = () => {
    const indices = [];
    for (let i = -1; i <= 1; i++) {
      indices.push((portfolioIdx + i + portfolioItems.length) % portfolioItems.length);
    }
    return indices;
  };
  const nextPortfolio = () => setPortfolioIdx((i) => (i + 1) % portfolioItems.length);
  const prevPortfolio = () => setPortfolioIdx((i) => (i - 1 + portfolioItems.length) % portfolioItems.length);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Full background image with gradient overlay */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/bgw2jpg')", // Use your preferred image
        }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF]/40 via-white/70 to-white-100/60" />
      </div>

      {/* Main content with glassmorphism sections */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[90vh] px-4 pt-5 pb-0 bg-transparent relative">
          {/* Background image with overlay */}
          <div className="absolute inset-0 w-full h-full transition-all duration-500">
            <img
              src={heroImages[heroIdx]}
              alt="Hero"
              className="w-full h-full object-cover object-center transition-all duration-500"
              style={{ borderBottom: "none" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/20 backdro-blur-sm pointer-events-none" style={{ borderBottom: "none" }} />
          </div>
          {/* Navigation dots */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-3">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIdx(idx)}
                className={`w-3 h-3 rounded-full transition-all ${idx === heroIdx ? ' border-2 border-[#0057FF] bg-white' : 'bg-white/80'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          {/* Arrows */}
          <button
            aria-label="Previous"
            onClick={prevHero}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white text-[#0057FF] rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all hover:scale-110 border-none"
            style={{ border: "none" }}
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L10 14L18 22" /></svg>
          </button>
          <button
            aria-label="Next"
            onClick={nextHero}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white text-[#0057FF] rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all hover:scale-110 border-none"
            style={{ border: "none" }}
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 6L18 14L10 22" /></svg>
          </button>
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-6xl px-4">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2 mb-8 animate-fade-in">
              <span className="text-5xl md:text-4xl font-bold text-[#2A2F3B] bg-clip-text text-transparent bg-gradient-to-r from-[#0057FF] to-cyan-600">
                {typedBrand}
                <span className="animate-pulse inline-block w-2 h-8 align-middle bg-[#0057FF] ml-1" style={{ verticalAlign: "middle", borderRadius: 2, opacity: typedBrand.length < brandVariants[brandIdx].length ? 1 : 0 }}></span>
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#23263B] text-center mb-8 leading-tight">
              Digital <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0073FF] to-cyan-600">Solutions</span> for Modern Brands
            </h1>
            <p className="max-w-2xl text-center text-[#4B5563] mb-10 text-xl md:text-2xl font-medium leading-relaxed">
              We deliver stunning <span className="font-semibold text-[#0057FF]">graphics design</span> and powerful <span className="font-semibold text-[#0057FF]">custom software</span> to elevate your brand and streamline your operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/services"
                className="relative overflow-hidden inline-block border-2 text-[#FFFFFF] bg-[#0099FF] hover:bg-[#0057FF]/10 transition-all rounded-full px-8 py-3 font-bold text-lg md:text-xl"
              >
                <span className="relative z-10">Explore Our Services</span>
              </Link>
              <a
                href="https://wa.me/2349039223824"
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden inline-block border-2 border-[#25D366] text-[#128C7E] bg-[white] hover:bg-[#25D366]/10 transition-all rounded-full px-8 py-3 font-bold text-lg md:text-xl flex items-center justify-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg width="24" height="24" fill="currentColor"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.18-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.67-.5-5.23-1.45l-.37-.22-3.67.97.98-3.58-.24-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-.99 2.43.01 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" /></svg>
                  WhatsApp
                </span>
              </a>
            </div>
          </div>
          {/* Decorative curve at bottom */}
          <svg
            className="absolute bottom-0 left-0 w-full"
            viewBox="0 0 1440 110"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              d="M0,0 C480,150 960,150 1440,0 L1440,150 L0,150 Z"
            />
          </svg>
        </section>

        {/* Our Core Services */}
        <section className="py-20 px-6 bg-white-200/30 backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100/10 rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-30" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-[#0057FF]/70 text-[#FFFFFF] rounded-full text-md font-extrabold mb-4">
                WHAT WE OFFER
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#22223B]">
                Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0057FF] to-cyan-600">Core Services</span>
              </h2>
              <p className="max-w-2xl mx-auto font-bold text-xl text-gray-800">
                Comprehensive solutions designed to meet your digital needs
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="group relative bg-white/60 backdrop-blur-lg border border-white/30 p-8 pt-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden text-center flex flex-col items-center justify-center"
                >
                  <div className="absolute top-0 left-0 w-full h-3 rounded-t-[2.5rem] bg-[#0057FF]" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2.5rem]" />
                  <div className="relative z-10">
                    <div className="text-6xl mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:text-[#0057FF]">
                      {s.icon}
                    </div>
                    <h3 className="font-bold text-2xl mb-3 text-[#22223B] group-hover:text-[#0057FF] transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-gray-600">{s.desc}</p>
                    <div className="mt-6">
                      <Link
                        to="/services"
                        className="inline-flex items-center text-[#0057FF] font-medium group-hover:underline"
                      >
                        Learn more
                        <svg className="ml-1 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Carousel */}
        <section className="py-20 px-6 bg-white/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100/60 rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/60 rounded-full blur-3xl opacity-30" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto">
            <h2
              className="text-4xl font-extrabold text-center mb-12 text-[#22223B]"
              style={{ fontFamily: "'Montserrat', 'Poppins', sans-serif" }}
            >
              Some of Our Work
            </h2>
            <div className="flex items-center justify-center gap-4">
              <button
                aria-label="Previous"
                onClick={prevPortfolio}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-white/70 border-2 border-[#0057FF] text-[#0057FF] hover:bg-[#0057FF]/10 transition shadow"
              >
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 8L12 16L20 24" /></svg>
              </button>
              <div className="flex items-center gap-4 w-full justify-center">
                {getPortfolioIndices().map((idx, pos) => {
                  const item = portfolioItems[idx];
                  const isCenter = pos === 1;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.1 }}
                      className={`
                        flex-shrink-0 bg-white/40 backdrop-blur-lg border border-white/30 shadow-xl transition-all duration-300 hover:shadow-2xl
                        ${isCenter
                          ? "w-72 h-[22rem] md:w-96 shadow-3xl  md:h-[26rem] scale-105 z-10"
                          : "w-40 h-60 md:w-56 md:h-72 scale-90 opacity-60 z-0"
                        }
                        rounded-[3rem] flex flex-col items-center overflow-hidden
                      `}
                      style={{
                        boxShadow: isCenter ? "0 8px 32px 0 #ff0000" : undefined,
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className={`object-cover w-full h-2/3 transition-all`}
                      />
                      <div className={`p-4 md:p-6 flex-1 flex flex-col justify-center items-center ${isCenter ? "" : "hidden md:flex"}`}>
                        <h4 className="font-bold text-lg md:text-xl mb-2 text-[#0057FF] text-center" style={{ fontFamily: "'Montserrat', 'Poppins', sans-serif" }}>
                          {item.title}
                        </h4>
                        <p className="text-base text-gray-700 text-center">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <button
                aria-label="Next"
                onClick={nextPortfolio}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-white/70 border-2 border-[#0057FF] text-[#0057FF] hover:bg-[#0057FF]/10 transition shadow"
              >
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8L20 16L12 24" /></svg>
              </button>
            </div>
            <div className="text-center mt-12">
              <Link
                to="/portfolio"
                className="inline-block bg-[#0057FF] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 text-lg shadow"
              >
                View Full Portfolio
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-5 px-6 bg-cyan-200/20 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50+", label: "Projects" },
              { value: "30+", label: "Clients" },
              { value: "5+", label: "Years" },
              { value: "100%", label: "Satisfaction" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full border-2 border-[#0057FF] bg-white/60 mb-2 shadow-lg">
                  <span className="text-3xl md:text-4xl font-bold text-[#0057FF]">{stat.value}</span>
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative py-24 px-6 bg-gradient-to-br from-[#0057FF] to-cyan-600 text-white text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="relative z-10 max-w-l mx-auto">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
              Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">transform</span> your ideas?
            </h2>
            <p className="mb-12 text-xl md:text-xl font-medium leading-relaxed">
              Let's build something amazing together — your brand, your app, your future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="relative overflow-hidden inline-block border-2 text-[#FFFFFF] font-bold px-10 py-4 rounded-full hover:bg-gray-100 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                Get in Touch
              </Link>
              <a
                href="https://wa.me/2349039223824"
                target="_blank"
                rel="noopener noreferrer"
                className="relative overflow-hidden inline-block bg-[#25D366] text-white hover:bg-[#128C7E] transition-all rounded-full px-10 py-4 font-bold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:-translate-y-1"
              >
                <svg width="24" height="24" fill="currentColor"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.18-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.67-.5-5.23-1.45l-.37-.22-3.67.97.98-3.58-.24-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-.99 2.43.01 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" /></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;