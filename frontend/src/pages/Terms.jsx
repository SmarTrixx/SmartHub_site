import React from "react";
import { Link } from "react-router-dom";

const lastUpdated = "October 23, 2025";

const Terms = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image + overlay (site style) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg2.png')" }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0057FF]/10 via-white/80 to-cyan-200/10 backdrop-blur-md" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto py-24 px-6">
        <header className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-[#0057FF]/70 text-white rounded-full font-extrabold mb-4">
            TERMS
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#22223B] mb-4">
            Terms of Service
          </h1>
          <p className="max-w-2xl mx-auto text-gray-700 text-lg">
            These Terms of Service govern your use of Smarthubz's website and
            services. Please read them carefully before using the site.
          </p>
        </header>

        <section className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-3xl shadow-xl p-8 md:p-12 mb-8 prose prose-neutral max-w-none text-gray-700">
          <p className="font-medium">Last updated: <time>{lastUpdated}</time></p>

          <h2 id="acceptance">1. Acceptance</h2>
          <p>
            By accessing or using our website and services you agree to these
            Terms. If you do not agree, do not use the site or services.
          </p>

          <h2 id="services">2. Services</h2>
          <p>
            Smarthubz provides digital services (design, development, automation,
            support) as described on the site. Specific projects are governed by
            separate project agreements or proposals where applicable.
          </p>

          <h2 id="user-responsibilities">3. User Responsibilities</h2>
          <ul>
            <li>Provide accurate information when contacting or contracting us.</li>
            <li>Use the site lawfully and do not attempt to disrupt or abuse services.</li>
            <li>Respect intellectual property rights of Smarthubz and third parties.</li>
          </ul>

          <h2 id="intellectual-property">4. Intellectual Property</h2>
          <p>
            All site content, branding, designs and code remain the property of
            Smarthubz or its licensors, except where rights are transferred in a
            separate agreement. You may not reproduce or use our copyrighted
            material without permission.
          </p>

          <h2 id="pricing-payments">5. Pricing & Payment</h2>
          <p>
            Project fees, payment schedules and cancellation terms are described
            in proposals or contracts. Late payments may incur interest or
            project suspension until payment is received.
          </p>

          <h2 id="third-parties">6. Third-party Links & Services</h2>
          <p>
            The site may link to third-party services. Smarthubz is not
            responsible for third-party policies or practices. Use them at your
            own risk.
          </p>

          <h2 id="disclaimer">7. Disclaimer & Limitation of Liability</h2>
          <p>
            THE SITE AND SERVICES ARE PROVIDED "AS IS." TO THE MAXIMUM EXTENT
            PERMITTED BY LAW, SMART HUB DISCLAIMS ALL WARRANTIES. SMART HUB'S
            LIABILITY IS LIMITED TO THE AMOUNT PAID FOR THE APPLICABLE SERVICE.
          </p>

          <h2 id="termination">8. Termination</h2>
          <p>
            We may suspend or terminate access for violations of these Terms or
            for other reasons with notice where required. Termination does not
            relieve you of outstanding obligations.
          </p>

          <h2 id="privacy">9. Privacy</h2>
          <p>
            Use of personal information is described in our{" "}
            <Link className="text-[#0057FF] font-medium" to="/privacy">Privacy Policy</Link>.
          </p>

          <h2 id="changes">10. Changes to Terms</h2>
          <p>
            We may update these Terms. Material changes will be communicated
            where appropriate; continued use of the site after changes implies
            acceptance.
          </p>

          <h2 id="governing-law">11. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the jurisdiction where
            Smarthubz is incorporated, without regard to conflict of law rules.
          </p>

          <h2 id="contact">12. Contact</h2>
          <p>
            For questions about these Terms contact us at{" "}
            <a className="text-[#0057FF] font-medium" href="mailto:legal@smarthub.com">legal@smarthub.com</a>{" "}
            or via our <Link className="text-[#0057FF] font-medium" to="/contact">Contact</Link> page.
          </p>
        </section>

        <footer className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-700">
            © {new Date().getFullYear()} <span className="font-bold text-[#0057FF]">Smarthubz</span>. All rights reserved.
          </div>
          <nav className="flex gap-4">
            <Link to="/privacy" className="text-gray-700 hover:text-[#0057FF]">Privacy</Link>
            <Link to="/about" className="text-gray-700 hover:text-[#0057FF]">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-[#0057FF]">Contact</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
};

export default Terms;