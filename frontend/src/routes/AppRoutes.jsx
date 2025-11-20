import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Services from '../pages/Services';
import Portfolio from '../pages/Portfolio';
import ProjectDetail from '../pages/ProjectDetail';
import Contact from '../pages/Contact';
import About from '../pages/About';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/portfolio/:projectId" element={<ProjectDetail />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/about" element={<About />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />
    {/* Add more routes as needed */}
  </Routes>
);

export default AppRoutes;
