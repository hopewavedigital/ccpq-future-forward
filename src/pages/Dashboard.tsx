import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useEnrollments } from '@/hooks/useEnrollments';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: enrollments, isLoading } = useEnrollments();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="hero-gradient text-primary-foreground py-12">
        <div className="container-custom">
          <h1 className="text-3xl font-display font-bold">My Learning Dashboard</h1>
          <p className="text-primary-foreground/80">Track your progress and continue learning</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          {enrollments && enrollments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-card rounded-xl shadow-card overflow-hidden">
                  <div className="h-32 bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary/50" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-semibold mb-2">{enrollment.course?.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{enrollment.course?.category?.name}</p>
                    <Progress value={0} className="mb-4" />
                    <p className="text-xs text-muted-foreground mb-4">0% Complete</p>
                    <Link to={`/learn/${enrollment.course?.slug}`}>
                      <Button className="w-full gap-2">Continue <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Courses Yet</h2>
              <p className="text-muted-foreground mb-6">Start your learning journey by enrolling in a course.</p>
              <Link to="/courses"><Button className="bg-accent hover:bg-accent/90">Browse Courses</Button></Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;