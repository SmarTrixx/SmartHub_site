import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => (
  <>
    <Header />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

export default MainLayout;
