import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useCourse } from '@/hooks/useCourses';
import { useModules } from '@/hooks/useModules';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle, FileText, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

const CourseLearn = () => {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const { data: course, isLoading: courseLoading } = useCourse(courseSlug || '');
  const { data: modules, isLoading: modulesLoading } = useModules(course?.id || '');

  if (courseLoading || modulesLoading) {
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
          <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-6">
        <div className="container-custom flex items-center gap-4">
          <Link to="/dashboard"><Button variant="ghost" size="icon" className="text-primary-foreground"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-xl font-display font-bold">{course.title}</h1>
            <p className="text-sm text-primary-foreground/70">{course.category?.name}</p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          {modules && modules.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {modules.map((module, index) => (
                <AccordionItem key={module.id} value={module.id} className="bg-card rounded-xl border px-6">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-sm font-semibold text-accent">{index + 1}</span>
                      <span className="font-display font-semibold">{module.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    {module.lessons && module.lessons.length > 0 ? (
                      <ul className="space-y-3">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                            {lesson.video_url ? <PlayCircle className="h-5 w-5 text-accent" /> : <FileText className="h-5 w-5 text-muted-foreground" />}
                            <span className="flex-1">{lesson.title}</span>
                            {lesson.duration_minutes && <span className="text-sm text-muted-foreground">{lesson.duration_minutes} min</span>}
                            <CheckCircle className="h-5 w-5 text-muted-foreground/30" />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground py-4">Lessons coming soon...</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-16 bg-card rounded-xl">
              <h2 className="text-xl font-semibold mb-2">Course Content Coming Soon</h2>
              <p className="text-muted-foreground">Modules and lessons are being prepared for this course.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CourseLearn;