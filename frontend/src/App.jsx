import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import BikeDetails from './pages/BikeDetails';
import ShowcaseDetails from './pages/ShowcaseDetails';
import About from './pages/About';
import Buyers from './pages/Buyers';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/bike/:id" element={<BikeDetails />} />
        <Route path="/showcase/:slug" element={<ShowcaseDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/buyers" element={<Buyers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
