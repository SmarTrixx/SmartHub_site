import React from "react";
import { Link } from "react-router-dom";

const lastUpdated = "October 23, 2025";

const Privacy = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image + overlay (matches site) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg2.png')" }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0057FF]/10 via-white/80 to-cyan-200/10 backdrop-blur-md" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto py-24 px-6">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#22223B] mb-4">
            Privacy & Policy
          </h1>
          <p className="max-w-2xl mx-auto text-gray-700 text-lg">
            This Privacy Policy explains how Sm@rtHub collects, uses, discloses,
            and protects your information when you visit our website.
          </p>
        </header>

        {/* Content card with glassmorphism */}
        <section className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-3xl shadow-xl p-8 md:p-12 mb-12">
          <div className="prose prose-neutral max-w-none text-gray-700">
            <p className="font-medium">
              Last updated: <time>{lastUpdated}</time>
            </p>

            <h2 id="overview">Overview</h2>
            <p>
              Sm@rtHub ("we", "us", "our") respects your privacy. We collect
              information to provide and improve our services, communicate with
              you, and to keep the site secure. We aim to be transparent about
              the information we collect and how it is used.
            </p>

            <h2 id="data-collected">Information We Collect</h2>
            <ul>
              <li>
                <strong>Contact information:</strong> name, email, phone number
                you provide via forms or support.
              </li>
              <li>
                <strong>Usage data:</strong> pages visited, timestamps, IP
                address, device and browser metadata collected automatically.
              </li>
              <li>
                <strong>Cookies & tracking:</strong> small files used to improve
                experience and analytics (see Cookies section).
              </li>
            </ul>

            <h2 id="how-we-use">How We Use Your Information</h2>
            <ul>
              <li>To respond to inquiries and provide services you request.</li>
              <li>To improve and personalize the website and offerings.</li>
              <li>For security, fraud prevention, and analytics.</li>
              <li>To send occasional marketing or product updates (you can opt out).</li>
            </ul>

            <h2 id="cookies">Cookies & Tracking</h2>
            <p>
              We use cookies and similar technologies to operate the site and
              understand how you interact with it. You can control cookie
              settings through your browser; blocking cookies may affect site
              functionality.
            </p>

            <h2 id="third-parties">Third-Party Services</h2>
            <p>
              We may share data with trusted third-party providers who help
              operate the site (analytics, hosting, email delivery). These
              providers are contractually required to protect your data.
            </p>

            <h2 id="security">Security</h2>
            <p>
              We implement reasonable technical and organizational measures to
              protect your information. No system is 100% secure; if a breach
              occurs we will follow legal requirements and notify affected users
              where required.
            </p>

            <h2 id="data-retention">Data Retention</h2>
            <p>
              We retain personal data only as long as necessary for the
              purposes described, or as required by law. When no longer needed,
              data is deleted or anonymized.
            </p>

            <h2 id="your-rights">Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have rights to access,
              correct, delete, or restrict processing of your personal data.
              To exercise these rights or request a copy of your data, contact
              us using the details below.
            </p>

            <h2 id="children">Children</h2>
            <p>
              Our website is not directed to children under 13. We do not
              knowingly collect personal data from children under 13. If you
              believe we have such data, contact us to have it removed.
            </p>

            <h2 id="changes">Changes to this Policy</h2>
            <p>
              We may update this policy periodically. We will post the updated
              policy here with an updated "Last updated" date. Significant
              changes will be communicated where appropriate.
            </p>

            <h2 id="contact">Contact</h2>
            <p>
              For privacy-related requests, contact us at{" "}
              <a className="text-[#0057FF] font-medium" href="mailto:privacy@smarthub.com">
                privacy@smarthub.com
              </a>
              . You can also use our contact page:{" "}
              <Link className="text-[#0057FF] font-medium" to="/contact">
                Contact
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Quick links / small footer-ish card */}
        <footer className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-700">
            © {new Date().getFullYear()} <span className="font-bold text-[#0057FF]">Sm@rtHub</span>. All rights reserved.
          </div>
          <nav className="flex gap-4">
            <Link to="/terms" className="text-gray-700 hover:text-[#0057FF]">Terms</Link>
            <Link to="/about" className="text-gray-700 hover:text-[#0057FF]">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-[#0057FF]">Contact</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
};

export default Privacy;