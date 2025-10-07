import styles from "./App.module.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import CityPage from "./pages/City/CityPage";
import Footer from "./components/Footer/Footer";
import MicroLocationPage from "./pages/Microlocation/MicroLocationPage";
import PropertyPage from "./pages/PropertyPage/PropertyPage";
import AdminPanel from '../src/Admin/Admin Panel/AdminPanel'
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import { HelmetProvider } from '@dr.pogodin/react-helmet';


function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={styles.container}>
      <ScrollToTop />
      <div className={styles.layout}>
        {!isAdminRoute && <Navbar />}
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* City pages - using /coliving/ prefix to avoid conflicts */}
        <Route path="/coliving/:citySlug" element={<CityPage />} />
        {/* Micro-location pages - using /coliving/ prefix */}
        <Route path="/coliving/:citySlug/:locationSlug" element={<MicroLocationPage />} />
        {/* Property pages - using your preferred structure */}
        <Route path="/:citySlug/:propertySlug" element={<PropertyPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
