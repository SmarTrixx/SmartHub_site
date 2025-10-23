import { Link } from "react-router-dom";

const aboutStats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "30+", label: "Happy Clients" },
  { value: "5+", label: "Years Experience" },
  { value: "100%", label: "Satisfaction" },
];

const team = [
  {
    name: "Jane Doe",
    role: "Founder & Lead Developer",
    avatar: "/images/portfolio4.png",
    bio: "Passionate about building digital solutions that make a difference.",
  },
  {
    name: "John Smith",
    role: "Creative Director",
    avatar: "/images/portfolio4.png",
    bio: "Designing brands that stand out and connect with audiences.",
  },
];

const About = () => (
  <div className="relative min-h-screen overflow-hidden">
    {/* Decorative glassmorphism blobs */}
    <div className="pointer-events-none">
      <div className="absolute top-10 left-10 w-72 h-72 bg-white/40 rounded-full blur-3xl opacity-40 z-0" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-200/40 rounded-full blur-3xl opacity-40 z-0" />
    </div>
    {/* Background image and overlay */}
    <div
      className="fixed inset-0 z-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/bg2.png')",
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0057FF]/10 via-white/80 to-cyan-200/10 backdrop-blur-md" />
    </div>

    <div className="relative z-10 py-24 px-4 min-h-screen flex flex-col items-center">
      <div className="max-w-3xl mx-auto text-center mb-16 backdrop-blur-sm bg-white/70 border border-white/60 rounded-[5rem] shadow-xl p-8 md:p-10">
        <span className="inline-block px-6 py-3 bg-[#0057FF]/70 text-[#FFFFFF] rounded-full text-sm font-extrabold mb-4">
          ABOUT US
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#22223B]">
          Who{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0057FF] to-cyan-600">
            We Are
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg font-bold text-gray-700 text-center">
          Sm@rtHub Digital is a creative agency focused on delivering innovative
          digital solutions for modern brands. We blend technology, design, and
          strategy to help businesses grow, automate, and stand out in a crowded
          digital world.
        </p>
      </div>

      {/* Mission & Values with Horizontal Shining Divider */}
      <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-lg border border-white/50 rounded-[3rem] shadow-xl p-8 md:p-14 mb-16 flex flex-col items-center text-center">
        <div>
          <div className="flex flex-col items-center mb-6">
            <span className="text-3xl mb-2">🎯</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0057FF] mb-2">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 text-center">
              Empowering businesses and entrepreneurs with world-class digital
              products, branding, and automation. We strive to deliver solutions
              that drive real results, spark innovation, and create lasting impact
              for every client.
            </p>
          </div>
          {/* Shining horizontal divider */}
          <div className="w-full flex justify-center my-10">
            <div className="h-1 w-3/4 bg-gradient-to-r from-[#00e0ff]/10 via-white to-[#00e0ff]/10 rounded-full shadow" />
          </div>
          <div className="flex flex-col items-center mt-10">
            <span className="text-3xl mb-2">🌟</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0057FF] mb-2">
              Our Values
            </h2>
            <ul className="text-lg text-gray-700 flex flex-col gap-2 items-center text-center">
              <li>
                <span className="font-bold text-[#0057FF]">
                  🚀 Innovation & Excellence:
                </span>{" "}
                We push boundaries and deliver our best.
              </li>
              <li>
                <span className="font-bold text-[#0057FF]">
                  🤝 Collaboration & Trust:
                </span>{" "}
                We build strong partnerships with our clients.
              </li>
              <li>
                <span className="font-bold text-[#0057FF]">
                  🎨 Creativity & Clarity:
                </span>{" "}
                We value original ideas and clear communication.
              </li>
              <li>
                <span className="font-bold text-[#0057FF]">
                  💡 Simplicity & Impact:
                </span>{" "}
                We make things simple and effective.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#0057FF] text-center">
          Meet Our Team
        </h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="bg-white/60 backdrop-blur-lg rounded-[3rem] shadow-lg p-6 flex flex-col items-center w-72 border border-white/30"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-[#0057FF]/20 shadow"
              />
              <h3 className="font-bold text-xl text-[#22223B] mb-1">
                {member.name}
              </h3>
              <div className="text-[#0057FF] font-medium mb-2">
                {member.role}
              </div>
              <p className="text-gray-600 text-center">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-16">
        {aboutStats.map((stat, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full border-2 border-[#0057FF] bg-white/60 mb-2 shadow-lg">
              <span className="text-3xl md:text-4xl font-bold text-[#0057FF]">
                {stat.value}
              </span>
            </div>
            <div className="text-gray-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CTA Button Only */}
      <div className="flex justify-center">
        <Link
          to="/contact"
          className="inline-block bg-[#0057FF] text-white px-10 py-4 rounded-full font-bold hover:bg-blue-700 text-lg shadow transition-all hover:-translate-y-1"
        >
          Let's Work Together
        </Link>
      </div>
    </div>
  </div>
);

export default About;