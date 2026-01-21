import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseDetailTabs } from '@/components/courses/CourseDetailTabs';
import { useCourse } from '@/hooks/useCourses';
import { useEnrollment } from '@/hooks/useEnrollments';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Tag, Check, ArrowRight, Loader2, CreditCard, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading } = useCourse(slug || '');
  const { user } = useAuth();
  const { data: enrollment } = useEnrollment(course?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPalCheckout = async () => {
    if (!course) return;

    setIsProcessing(true);
    try {
      const returnUrl = `${window.location.origin}/payment-success?course=${course.slug}`;
      const cancelUrl = `${window.location.origin}/courses/${course.slug}`;

      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          courseId: course.id,
          courseTitle: course.title,
          amount: course.price,
          returnUrl,
          cancelUrl,
        },
      });

      if (error) throw error;

      if (data?.approvalUrl) {
        // Store order info for later
        sessionStorage.setItem('pendingOrder', JSON.stringify({
          orderId: data.orderId,
          courseId: course.id,
          courseSlug: course.slug,
        }));
        
        // Redirect to PayPal
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No approval URL received');
      }
    } catch (error) {
      console.error('PayPal checkout error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="container-custom py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Link to="/courses"><Button>View All Courses</Button></Link>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price);

  const heroSummary =
    course.short_description?.trim() ||
    course.description
      ?.split(/\r?\n/)
      .map((l) => l.trim())
      .find(Boolean) ||
    'Course overview coming soon.';

  return (
    <Layout>
      {/* Hero - Mobile optimized */}
      <section className="hero-gradient text-primary-foreground py-10 md:py-16">
        <div className="container-custom px-4 md:px-6">
          <div className="max-w-3xl">
            <Badge className={`${course.course_type === 'diploma' ? 'bg-accent' : ''} mb-3 md:mb-4`}>
              {course.course_type === 'diploma' ? 'Diploma' : 'Certificate Course'}
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 md:mb-4 leading-tight">{course.title}</h1>
            <p className="text-base md:text-lg text-primary-foreground/80 mb-4 md:mb-6">{heroSummary}</p>
            <div className="flex flex-wrap gap-3 md:gap-4 text-sm">
              {course.duration && (
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{course.duration}</div>
              )}
              <div className="flex items-center gap-2"><Tag className="h-4 w-4" />{formatPrice(course.price)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:section-padding">
        <div className="container-custom px-4 md:px-6">
          {/* Mobile: Sidebar first, then content. Desktop: Content first */}
          <div className="grid lg:grid-cols-3 gap-6 md:gap-12">
            {/* Sidebar - Shows first on mobile */}
            <div className="order-1 lg:order-2">
              <div className="bg-card p-5 md:p-6 rounded-xl shadow-card lg:sticky lg:top-24">
                <div className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">{formatPrice(course.price)}</div>
                <p className="text-sm text-muted-foreground mb-4">Secure payment via PayPal</p>

                {enrollment ? (
                  <Link to={`/learn/${course.slug}`}>
                    <Button className="w-full bg-accent hover:bg-accent/90 gap-2">
                      Continue Learning <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button
                      onClick={handlePayPalCheckout}
                      disabled={isProcessing}
                      className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white gap-2"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Purchase Course
                        </>
                      )}
                    </Button>

                    {/* WhatsApp bulk discount message */}
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-xs md:text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                        <MessageCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>Click the WhatsApp button below to discuss discounts for bulk bookings</span>
                      </p>
                    </div>

                    {!user && (
                      <p className="text-xs text-muted-foreground mt-3 text-center">
                        You'll be asked to create an account after payment
                      </p>
                    )}
                  </>
                )}

                <div className="mt-5 md:mt-6 pt-5 md:pt-6 border-t border-border">
                  <h4 className="font-semibold mb-3 text-sm md:text-base">This course includes:</h4>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      Full online access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      Certificate on completion
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      Study at your own pace
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      Student support
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Main content - Shows second on mobile */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {/* Course Image */}
              <div className="mb-6 md:mb-8 rounded-xl overflow-hidden">
                <img
                  src={course.image_url || getSeededCourseCover(course.title, course.slug)}
                  alt={course.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-48 sm:h-64 md:h-80 object-cover"
                />
              </div>

              <CourseDetailTabs
                description={course.description}
                curriculum={course.curriculum}
                learningOutcomes={course.learning_outcomes}
                whoShouldTake={course.who_should_take}
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

function getSeededCourseCover(title: string, slug: string): string {
  const seed = hashString(slug || title);

  const hueA = seed % 360;
  const hueB = (hueA + 55 + (seed % 90)) % 360;

  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => (w[0] ? w[0].toUpperCase() : ''))
    .join('');

  const safeTitle = escapeXml(title.length > 44 ? `${title.slice(0, 44)}…` : title);
  const safeInitials = escapeXml(initials || 'CC');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">\n  <defs>\n    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">\n      <stop offset="0%" stop-color="hsl(${hueA} 72% 46%)"/>\n      <stop offset="100%" stop-color="hsl(${hueB} 72% 34%)"/>\n    </linearGradient>\n  </defs>\n  <rect width="1200" height="600" fill="url(#g)"/>\n  <rect width="1200" height="600" fill="hsl(0 0% 0% / 0.18)"/>\n\n  <text x="60" y="520" font-family="Space Grotesk, system-ui, -apple-system, Segoe UI, Roboto" font-size="46" font-weight="700" fill="hsl(0 0% 100% / 0.92)">\n    ${safeTitle}\n  </text>\n\n  <text x="60" y="210" font-family="Space Grotesk, system-ui, -apple-system, Segoe UI, Roboto" font-size="140" font-weight="700" fill="hsl(0 0% 100% / 0.35)">\n    ${safeInitials}\n  </text>\n</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default CourseDetail;