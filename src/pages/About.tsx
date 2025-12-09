import { Layout } from '@/components/layout/Layout';
import { Target, Eye, Heart, Users, Award, Globe } from 'lucide-react';

const values = [
  { icon: Target, title: 'Excellence', description: 'We strive for the highest standards in education.' },
  { icon: Heart, title: 'Accessibility', description: 'Quality education should be available to everyone.' },
  { icon: Users, title: 'Community', description: 'We build supportive learning communities.' },
  { icon: Award, title: 'Integrity', description: 'We maintain ethical standards in all we do.' },
  { icon: Globe, title: 'Innovation', description: 'We embrace new technologies and methods.' },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">About CCPQ</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Empowering South African professionals through accessible, flexible, and industry-aligned online education.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-card p-8 rounded-xl shadow-card">
              <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-accent" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To make high-quality professional education accessible, affordable, and flexible for all South Africans, empowering them to advance their careers and achieve their goals.
              </p>
            </div>
            <div className="bg-card p-8 rounded-xl shadow-card">
              <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-accent" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground">
                To be the leading online learning institution in South Africa, known for excellence, innovation, and transforming lives through education.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-secondary">
        <div className="container-custom">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-card p-6 rounded-xl text-center shadow-card">
                <value.icon className="h-8 w-8 text-accent mx-auto mb-4" />
                <h3 className="font-display font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Diverse South African professionals"
              className="rounded-xl shadow-elegant"
            />
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">Industry-Aligned Learning</h2>
              <p className="text-muted-foreground mb-4">
                Our courses are developed in consultation with industry experts to ensure our graduates have the skills employers are looking for.
              </p>
              <p className="text-muted-foreground">
                Whether you're starting your career or looking to upskill, CCPQ provides the flexible, affordable education you need to succeed in today's competitive job market.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;