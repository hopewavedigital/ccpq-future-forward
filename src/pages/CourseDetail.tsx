import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCourse } from '@/hooks/useCourses';
import { useEnrollment, useEnroll } from '@/hooks/useEnrollments';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Tag, Check, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, isLoading } = useCourse(slug || '');
  const { user } = useAuth();
  const { data: enrollment } = useEnrollment(course?.id || '');
  const enrollMutation = useEnroll();

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please sign in to enroll');
      return;
    }
    if (!course) return;

    try {
      await enrollMutation.mutateAsync(course.id);
      toast.success('Successfully enrolled!');
    } catch {
      toast.error('Failed to enroll');
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
              {course.course_type === 'diploma' ? 'Diploma' : 'Short Course'}
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
              <h2 className="text-2xl font-display font-bold mb-4">About This Course</h2>
              <p className="text-muted-foreground mb-8">{course.description}</p>
              
              <h3 className="text-xl font-display font-bold mb-4">What You'll Learn</h3>
              <ul className="space-y-3 mb-8">
                {['Industry-relevant skills', 'Practical knowledge', 'Professional development', 'Career advancement'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-accent" /><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="bg-card p-6 rounded-xl shadow-card sticky top-24">
                <div className="text-3xl font-display font-bold text-foreground mb-4">{formatPrice(course.price)}</div>
                
                {enrollment ? (
                  <Link to={`/learn/${course.slug}`}>
                    <Button className="w-full bg-accent hover:bg-accent/90 gap-2">
                      Continue Learning <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : user ? (
                  <Button onClick={handleEnroll} disabled={enrollMutation.isPending} className="w-full bg-accent hover:bg-accent/90">
                    {enrollMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enroll Now'}
                  </Button>
                ) : (
                  <Link to="/auth?mode=signup">
                    <Button className="w-full bg-accent hover:bg-accent/90">Register to Enroll</Button>
                  </Link>
                )}

                {course.payment_link && (
                  <a href={course.payment_link} target="_blank" rel="noopener noreferrer" className="block mt-3">
                    <Button variant="outline" className="w-full">Make Payment</Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CourseDetail;