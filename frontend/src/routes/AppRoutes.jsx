import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Services from '../pages/Services';
import Portfolio from '../pages/Portfolio';
import ProjectDetail from '../pages/ProjectDetail';
import Contact from '../pages/Contact';
import About from '../pages/About';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';
import AdminLogin from '../pages/AdminLogin';
import AdminProjects from '../pages/AdminProjects';
import AdminProfile from '../pages/AdminProfile';
import AdminServices from '../pages/AdminServices';

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/portfolio/:projectId" element={<ProjectDetail />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/about" element={<About />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />

    {/* Admin Routes */}
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/admin/projects" element={<AdminProjects />} />
    <Route path="/admin/profile" element={<AdminProfile />} />
    <Route path="/admin/services" element={<AdminServices />} />
  </Routes>
);

export default AppRoutes;
