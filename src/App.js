import styles from "./App.module.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import CityPage from "./pages/City/CityPage";
import Footer from "./components/Footer/Footer";
import MicroLocationPage from "./pages/Microlocation/MicroLocationPage";
// import PropertyDetails from "./pages/property/PropertyDetails";
// import PropertyDetails from "./pages/home/PropertyDetails";
// import Location from "./pages/home/Location";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/coliving/:citySlug" element={<CityPage />} />
        <Route path="/coliving/:citySlug/:locationSlug" element={<MicroLocationPage />} />
        {/* <Route path="/property/:propertyId" element={<PropertyDetails />} /> */}
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}
