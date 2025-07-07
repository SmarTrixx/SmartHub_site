import { services } from "../data/services";
import { Link } from "react-router-dom";

const Services = () => (
  <div className="relative min-h-screen overflow-hidden">
    {/* Background image and overlay */}
    <div
      className="fixed inset-0 z-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/bg.jpg')",
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0057FF]/50 via-white/80 to-cyan-200/60" />
    </div>

    <div className="relative z-10 py-24 px-4 min-h-screen flex flex-col items-center">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <span className="inline-block px-4 py-2 bg-[#0057FF]/90 text-[#FFFFFF] rounded-full text-md font-extrabold mb-4">
          OUR SERVICES
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#22223B]">
          What We{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0057FF] to-cyan-600">
            Offer
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl font-bold text-gray-900">
          We provide a full suite of digital services to help your business grow
          and thrive online.
        </p>
      </div>
      <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 w-full max-w-6xl">
        {services.map((s, i) => (
          <div
            key={s.id}
            className="group relative bg-white/80 backdrop-blur-lg border border-white/30 p-8 pt-12 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden text-center flex flex-col items-center justify-center"
            style={{ minHeight: 320 }}
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
              <p className="text-gray-600">{s.description}</p>
              <div className="mt-6">
                <Link
                  to="/contact"
                  className="inline-flex items-center text-[#0057FF] font-medium group-hover:underline"
                >
                  Get Started
                  <svg
                    className="ml-1 w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Services;
