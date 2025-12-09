import { Link } from 'react-router-dom';
import { Clock, Tag, ArrowRight } from 'lucide-react';
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

  return (
    <div
      className="bg-card rounded-xl overflow-hidden shadow-card card-hover animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={courseImage}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <Badge 
            variant={course.course_type === 'diploma' ? 'default' : 'secondary'}
            className={course.course_type === 'diploma' ? 'bg-accent' : ''}
          >
            {course.course_type === 'diploma' ? 'Diploma' : 'Short Course'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {course.category && (
          <span className="text-xs font-medium text-accent uppercase tracking-wider">
            {course.category.name}
          </span>
        )}
        
        <h3 className="text-lg font-display font-semibold text-foreground mt-2 mb-3 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {course.short_description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {course.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>{formatPrice(course.price)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={`/courses/${course.slug}`} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              Learn More
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