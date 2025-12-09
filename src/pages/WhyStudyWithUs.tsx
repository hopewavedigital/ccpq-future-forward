import { Layout } from '@/components/layout/Layout';
import { BookOpen, Users, Clock, Award, Headphones, TrendingUp } from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Expert-Developed Content', description: 'Curriculum designed by industry professionals with real-world experience.' },
  { icon: Clock, title: 'Self-Paced Learning', description: 'Study at your own pace, on your own schedule, from anywhere.' },
  { icon: Users, title: 'Supportive Community', description: 'Join a community of like-minded learners and professionals.' },
  { icon: Headphones, title: 'Dedicated Support', description: 'Our student support team is available to help you succeed.' },
  { icon: Award, title: 'Recognised Certification', description: 'Receive a professional certificate upon course completion.' },
  { icon: TrendingUp, title: 'Career Advancement', description: 'Gain skills that employers value and advance your career.' },
];

const WhyStudyWithUs = () => {
  return (
    <Layout>
      <section className="hero-gradient text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Why Study With CCPQ?</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Discover why thousands of South African professionals choose CCPQ for their online education.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="bg-card p-8 rounded-xl shadow-card card-hover" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">Flexible Learning That Fits Your Life</h2>
              <p className="text-muted-foreground mb-4">
                We understand that you have responsibilities beyond your studies. That's why our courses are designed to be 100% online and self-paced.
              </p>
              <p className="text-muted-foreground">
                Whether you're a working professional, a stay-at-home parent, or simply looking to upskill, CCPQ makes quality education accessible to everyone.
              </p>
            </div>
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Online learning" className="rounded-xl shadow-elegant" />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default WhyStudyWithUs;