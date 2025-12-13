import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative hero-gradient text-primary-foreground overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative py-20 md:py-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium">Now Enrolling for 2026</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
              Empowering Your Future Through{' '}
              <span className="text-gradient">Accessible Online Learning</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl">
              Flexible, affordable, industry-aligned online diploma programmes and short courses designed for South African professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/courses">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 w-full sm:w-auto">
                  Browse Courses
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2 w-full sm:w-auto">
                  <Play className="h-5 w-5" />
                  Register Now
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <div className="text-3xl font-display font-bold">500+</div>
                <div className="text-sm text-primary-foreground/70">Students Enrolled</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold">20+</div>
                <div className="text-sm text-primary-foreground/70">Courses Available</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold">95%</div>
                <div className="text-sm text-primary-foreground/70">Completion Rate</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block animate-slide-in-right">
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Diverse South African students learning online"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-card text-card-foreground p-4 rounded-xl shadow-elegant">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-accent font-bold text-lg">✓</span>
                </div>
                <div>
                  <div className="font-semibold">100% Online</div>
                  <div className="text-sm text-muted-foreground">Study at your own pace</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}