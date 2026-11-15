import { useMemo } from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedBikes from '../components/FeaturedBikes';
import AboutUs from '../components/AboutUs';
import FinancingContactPanel from '../components/FinancingContactPanel';
import Seo from '../seo/Seo';
import { homeMeta } from '../seo/meta';
import useBikes from '../hooks/useBikes';
import { pickHomeBikes } from '../utils/homeBikes';

const Home = () => {
  const { bikes, loading } = useBikes();

  const { heroBikes, featuredBikes } = useMemo(() => pickHomeBikes(bikes), [bikes]);

  return (
    <>
      <Seo meta={homeMeta()} />
      <HeroSection bikes={heroBikes} loading={loading} />

      <FeaturedBikes bikes={featuredBikes} loading={loading} />
      <AboutUs />
      <FinancingContactPanel />
    </>
  );
};

export default Home;
