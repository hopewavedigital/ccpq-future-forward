import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CourseCard } from '@/components/courses/CourseCard';
import { CategoryFilter } from '@/components/courses/CategoryFilter';
import { useCourses } from '@/hooks/useCourses';
import { Loader2 } from 'lucide-react';

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryParam);
  
  const { data: courses, isLoading } = useCourses(activeCategory || undefined);

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const diplomas = courses?.filter(c => c.course_type === 'diploma') || [];
  const shortCourses = courses?.filter(c => c.course_type === 'short_course') || [];

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Our Courses</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Explore our industry-aligned diploma programmes and short courses.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="container-custom">
          <CategoryFilter activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
        </div>
      </section>

      {/* Course Listings */}
      <section className="section-padding">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <>
              {/* Diplomas */}
              {diplomas.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-2xl font-display font-bold mb-6">
                    Diploma Programmes <span className="text-accent">R4,999</span>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {diplomas.map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* Short Courses */}
              {shortCourses.length > 0 && (
                <div>
                  <h2 className="text-2xl font-display font-bold mb-6">
                    Short Courses <span className="text-accent">R2,999</span>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shortCourses.map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {courses?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No courses found in this category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Courses;