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
      className="bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow animate-slide-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Top row: Category and badge */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
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

        {/* Title - allows wrapping on mobile */}
        <h3 className="text-base sm:text-lg font-display font-semibold text-foreground mb-2 line-clamp-2 sm:line-clamp-1">
          {course.title}
        </h3>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
          {course.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.module_count > 0 && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span>{course.module_count} Modules</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span>CPD Accredited</span>
          </div>
        </div>

        {/* Bottom row: Price and CTA - stacked on mobile, row on larger screens */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-lg font-bold text-primary">{formatPrice(course.price)}</div>
          <Link to={`/courses/${course.slug}`} className="w-full sm:w-auto">
            <Button size="sm" className="gap-1 whitespace-nowrap w-full sm:w-auto">
              View Course
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
