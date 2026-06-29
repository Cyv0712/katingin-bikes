import HeroSection from '../components/HeroSection';
import BrandMarquee from '../components/BrandMarquee';
import FeaturedBikes from '../components/FeaturedBikes';
import AboutUs from '../components/AboutUs';
import { Helmet } from 'react-helmet-async';

import { useReveal } from '../hooks/useReveal';

const Home = () => {
  useReveal();
  
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "MotorcycleDealer",
    "name": "Katingin Bikes",
    "image": "https://katinginbikes.com/static_data/Katingin_logo.png",
    "url": "https://katinginbikes.com",
    "telephone": "09435509357",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Metro Manila",
      "addressCountry": "PH"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    }
  };

  return (
    <>
      <Helmet>
        <title>Katingin Bikes | Premium Second Hand Bigbikes Philippines</title>
        <meta name="description" content="Looking for the best second hand bigbikes in the Philippines? Katingin Bikes is Metro Manila's trusted dealer for premium pre-owned motorcycles with complete papers and transparent deals." />
        <meta property="og:title" content="Katingin Bikes | Premium Second Hand Bigbikes Philippines" />
        <meta property="og:description" content="Trusted dealer of premium, pre-owned bigbikes and motorcycles in the Philippines. Complete papers, transparent deals, and superb aftersales." />
        <meta property="og:image" content="https://katinginbikes.com/static_data/Katingin_logo.png" />
        <meta property="og:url" content="https://katinginbikes.com/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      <HeroSection />
      <BrandMarquee />
      <FeaturedBikes />
      <AboutUs />
    </>
  );
};

export default Home;
