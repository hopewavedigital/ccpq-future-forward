import { Link } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Course, CourseCategory } from '@/types/database';

interface CourseListItemProps {
  course: Course & { category?: CourseCategory };
  index?: number;
}

export function CourseListItem({ course, index = 0 }: CourseListItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className="bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow animate-slide-up flex flex-col sm:flex-row"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left: Title and meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {course.category && (
              <span className="text-xs font-medium text-accent uppercase tracking-wider">
                {course.category.name}
              </span>
            )}
            <Badge
              variant={course.course_type === 'diploma' ? 'default' : 'secondary'}
              className={`text-xs ${course.course_type === 'diploma' ? 'bg-accent' : ''}`}
            >
              {course.course_type === 'diploma' ? 'Diploma' : 'Certificate'}
            </Badge>
          </div>

          <h3 className="text-base font-display font-semibold text-foreground truncate">
            {course.title}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{course.duration}</span>
              </div>
            )}
            {course.module_count > 0 && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>{course.module_count} Modules</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span>CPD Accredited</span>
            </div>
          </div>
        </div>

        {/* Right: Price and CTA */}
        <div className="flex items-center gap-4 sm:flex-shrink-0">
          <div className="text-lg font-bold text-primary">{formatPrice(course.price)}</div>
          <Link to={`/courses/${course.slug}`}>
            <Button size="sm" className="gap-1 whitespace-nowrap">
              View Course
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
