import { UserPlus, BookOpen, Award } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Register & Enroll',
    description: 'Create your account and choose a course that fits your career goals.',
  },
  {
    icon: BookOpen,
    step: '02',
    title: 'Learn Online',
    description: 'Access video lessons, materials, and quizzes at your own pace.',
  },
  {
    icon: Award,
    step: '03',
    title: 'Get Certified',
    description: 'Complete assessments and receive your professional certification.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            How Online Learning Works
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Getting started with CCPQ is simple. Follow these three easy steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-primary-foreground/20" />
              )}

              <div className="relative bg-primary-foreground/5 p-8 rounded-xl text-center border border-primary-foreground/10">
                <div className="w-24 h-24 mx-auto mb-6 bg-accent rounded-full flex items-center justify-center">
                  <item.icon className="h-10 w-10 text-accent-foreground" />
                </div>
                <span className="text-sm font-medium text-accent mb-2 block">Step {item.step}</span>
                <h3 className="text-xl font-display font-semibold mb-3">{item.title}</h3>
                <p className="text-primary-foreground/80">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}