import BestSeller from '../Components/BestSeller';
import Hero from '../Components/Hero';
import Banner from '../Components/Banner';
import ProductCarousel from '../Components/CarrouselProd';
import LatestCollection from '../Components/LatestCollection';
import NewsLetterBox from '../Components/NewsLetterBox';
import OurPolicies from '../Components/OurPolicies';

const Home = () => {
  return (
    <div>
      <Hero />
      <ProductCarousel />
      <LatestCollection />
      <Banner />
      <BestSeller />
      <OurPolicies />
      <NewsLetterBox />
    </div>
  );
};

export default Home;
