import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CourseCard } from '@/components/courses/CourseCard';
import { CategoryFilter } from '@/components/courses/CategoryFilter';
import { useCourses } from '@/hooks/useCourses';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const INITIAL_VISIBLE = 12;
const STEP = 12;

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');

  const [visibleDiplomas, setVisibleDiplomas] = useState(INITIAL_VISIBLE);
  const [visibleShortCourses, setVisibleShortCourses] = useState(INITIAL_VISIBLE);

  const { data: courses, isLoading } = useCourses(activeCategory || undefined);

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    setVisibleDiplomas(INITIAL_VISIBLE);
    setVisibleShortCourses(INITIAL_VISIBLE);
  }, [activeCategory, searchQuery]);

  // Filter courses by search query
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.short_description?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  const diplomas = filteredCourses.filter((c) => c.course_type === 'diploma');
  const shortCourses = filteredCourses.filter((c) => c.course_type === 'short_course');

  const diplomasToShow = diplomas.slice(0, visibleDiplomas);
  const shortCoursesToShow = shortCourses.slice(0, visibleShortCourses);

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Our Courses</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Explore our industry-aligned diploma programmes and short courses.
          </p>
          {!isLoading && courses && (
            <p className="mt-4 text-lg font-semibold bg-white/10 inline-block px-6 py-2 rounded-full">
              {courses.length} Courses Available
            </p>
          )}

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white text-foreground border-0 shadow-lg rounded-full"
              />
            </div>
            {searchQuery && (
              <p className="mt-3 text-sm text-primary-foreground/70">
                Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </p>
            )}
          </div>
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
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
                    <h2 className="text-2xl font-display font-bold">
                      Diploma Programmes <span className="text-accent">R4,999</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Showing {diplomasToShow.length} of {diplomas.length}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {diplomasToShow.map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index} />
                    ))}
                  </div>

                  {diplomasToShow.length < diplomas.length && (
                    <div className="mt-8 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setVisibleDiplomas((v) => Math.min(v + STEP, diplomas.length))
                        }
                      >
                        Load more diplomas
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Short Courses */}
              {shortCourses.length > 0 && (
                <div>
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
                    <h2 className="text-2xl font-display font-bold">
                      Short Courses <span className="text-accent">R2,999</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Showing {shortCoursesToShow.length} of {shortCourses.length}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shortCoursesToShow.map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index} />
                    ))}
                  </div>

                  {shortCoursesToShow.length < shortCourses.length && (
                    <div className="mt-8 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setVisibleShortCourses((v) => Math.min(v + STEP, shortCourses.length))
                        }
                      >
                        Load more short courses
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {!isLoading && filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No courses found.</p>
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
