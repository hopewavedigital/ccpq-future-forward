import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import StudentsBannerCarousel from '@/components/home/StudentsBannerCarousel';
import { WhyChooseSection } from '@/components/home/WhyChooseSection';
import { FeaturedCoursesSection } from '@/components/home/FeaturedCoursesSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <StudentsBannerCarousel />
      <WhyChooseSection />
      <FeaturedCoursesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;