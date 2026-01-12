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
import { Clock, Tag, Check, ArrowRight, Loader2, CreditCard } from 'lucide-react';
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

  const formatPrice = (price: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(price);

  return (
    <Layout>
      <section className="hero-gradient text-primary-foreground py-16">
        <div className="container-custom">
          <div className="max-w-3xl">
            <Badge className={course.course_type === 'diploma' ? 'bg-accent mb-4' : 'mb-4'}>
              {course.course_type === 'diploma' ? 'Diploma' : 'Certificate Course'}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-primary-foreground/80 mb-6">{course.short_description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {course.duration && (
                <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{course.duration}</div>
              )}
              <div className="flex items-center gap-2"><Tag className="h-4 w-4" />{formatPrice(course.price)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {/* Course Image */}
              {(course.image_url || getCourseImage(course.category?.slug)) && (
                <div className="mb-8 rounded-xl overflow-hidden">
                  <img 
                    src={course.image_url || getCourseImage(course.category?.slug)} 
                    alt={course.title}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                </div>
              )}
              <CourseDetailTabs
                description={course.description}
                curriculum={course.curriculum}
                learningOutcomes={course.learning_outcomes}
                whoShouldTake={course.who_should_take}
              />
            </div>

            <div>
              <div className="bg-card p-6 rounded-xl shadow-card sticky top-24">
                <div className="text-3xl font-display font-bold text-foreground mb-2">{formatPrice(course.price)}</div>
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
                          Pay with PayPal
                        </>
                      )}
                    </Button>
                    
                    {!user && (
                      <p className="text-xs text-muted-foreground mt-3 text-center">
                        You'll be asked to create an account after payment
                      </p>
                    )}
                  </>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-semibold mb-3">This course includes:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Full online access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Certificate on completion
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Study at your own pace
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      Student support
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

function getCourseImage(slug?: string): string {
  const images: Record<string, string> = {
    'business-management': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'hr-administration': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'it-technology': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'healthcare-support': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'marketing-sales': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'education-training': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'hospitality-tourism': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'beauty-wellness': 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'safety-security': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'legal-compliance': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'finance-accounting': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  };
  return images[slug || ''] || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
}

export default CourseDetail;