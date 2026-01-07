import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="relative bg-primary rounded-3xl overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold rounded-full blur-3xl" />
          </div>

          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-6">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">Limited Time Offer</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6 max-w-3xl mx-auto">
              Start Studying Today and Transform Your Career
            </h2>

            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join hundreds of South African professionals who have advanced their careers with CCPQ's industry-aligned online courses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                  Browse Courses
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-primary-foreground bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
                  Speak to an Advisor
                </Button>
              </Link>
            </div>

            {/* Pricing Highlight */}
            <div className="mt-10 flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-primary-foreground">R4,999</div>
                <div className="text-sm text-primary-foreground/70">Certificate Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-primary-foreground">R9,999</div>
                <div className="text-sm text-primary-foreground/70">Diploma Programmes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}