import { Briefcase, Globe, Wallet, Headphones, Target } from 'lucide-react';

const features = [
  {
    icon: Briefcase,
    title: 'Industry-Aligned Content',
    description: 'Curriculum designed with input from industry experts to ensure job-ready skills.',
  },
  {
    icon: Globe,
    title: '100% Online Learning',
    description: 'Study from anywhere, anytime. All you need is an internet connection.',
  },
  {
    icon: Wallet,
    title: 'Affordable Pricing',
    description: 'Quality education at competitive prices with flexible payment options.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    description: 'Our student support team is always ready to assist you on your journey.',
  },
  {
    icon: Target,
    title: 'Career-Focused',
    description: 'Programmes designed to enhance your employability and career prospects.',
  },
];

export function WhyChooseSection() {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Why Choose CCPQ?
          </h2>
          <p className="text-lg text-muted-foreground">
            We're committed to making quality education accessible to all South Africans.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card p-6 rounded-xl shadow-card card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}