import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/courses/CourseCard';
import { useCourses } from '@/hooks/useCourses';
import { ArrowRight, Loader2 } from 'lucide-react';

export function FeaturedCoursesSection() {
  const { data: courses, isLoading } = useCourses();

  // Only show courses that have images, limited to 6
  const featuredCourses = courses?.filter(course => course.image_url).slice(0, 6) || [];

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Featured Courses
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore our most popular diploma programmes and short courses.
            </p>
          </div>
          <Link to="/courses">
            <Button variant="outline" className="gap-2">
              View All Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : featuredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}