import HeroSection from '../components/HeroSection';
import BrandMarquee from '../components/BrandMarquee';
import FeaturedBikes from '../components/FeaturedBikes';
import HappyBuyers from '../components/HappyBuyers';
import AboutUs from '../components/AboutUs';

import { useReveal } from '../hooks/useReveal';

const Home = () => {
  useReveal();
  
  return (
    <>
      <HeroSection />
      <BrandMarquee />
      <FeaturedBikes />
      <HappyBuyers />
      <AboutUs />
    </>
  );
};

export default Home;
