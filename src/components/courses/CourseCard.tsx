import { Link } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Course, CourseCategory } from '@/types/database';

interface CourseCardProps {
  course: Course & { category?: CourseCategory };
  index?: number;
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const courseImage = course.image_url || getCategoryImage(course.category?.slug);

  // Extract first paragraph as short description if not set
  const shortDesc = course.short_description || 
    (course.description ? course.description.split('\n')[0].substring(0, 150) + '...' : 'Professional certification course');

  return (
    <div
      className="bg-card rounded-xl overflow-hidden shadow-card card-hover animate-slide-up group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={courseImage}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge 
            variant={course.course_type === 'diploma' ? 'default' : 'secondary'}
            className={course.course_type === 'diploma' ? 'bg-accent' : ''}
          >
            {course.course_type === 'diploma' ? 'Diploma' : 'Certificate'}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-background/90 text-foreground">
            <Award className="h-3 w-3 mr-1" />
            CPD Accredited
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {course.category && (
          <span className="text-xs font-medium text-accent uppercase tracking-wider">
            {course.category.name}
          </span>
        )}
        
        <h3 className="text-base font-display font-semibold text-foreground mt-2 mb-2 line-clamp-2 min-h-[2.5rem]">
          {course.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {shortDesc}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-3">
            {course.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-primary" />
                <span>{course.duration}</span>
              </div>
            )}
            {course.module_count > 0 && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>{course.module_count} Modules</span>
              </div>
            )}
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-lg font-bold text-primary">
            {formatPrice(course.price)}
          </div>
          <Link to={`/courses/${course.slug}`}>
            <Button size="sm" className="gap-1">
              View Course
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function getCategoryImage(slug?: string): string {
  const images: Record<string, string> = {
    'business-management': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'hr-administration': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'it-technology': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'healthcare-support': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  };
  return images[slug || ''] || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
}
