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

  const courseImage = course.image_url || getSeededCourseCover(course.title, course.slug);

  // Extract first paragraph as short description if not set
  const shortDesc =
    course.short_description ||
    (course.description
      ? course.description.split('\n')[0].substring(0, 150) + '...'
      : 'Professional certification course');

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
          loading="lazy"
          decoding="async"
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
          <div className="text-lg font-bold text-primary">{formatPrice(course.price)}</div>
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

function getSeededCourseCover(title: string, slug: string): string {
  const seed = hashString(slug || title);

  const hueA = seed % 360;
  const hueB = (hueA + 55 + (seed % 90)) % 360;

  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => (w[0] ? w[0].toUpperCase() : ''))
    .join('');

  const safeTitle = escapeXml(title.length > 44 ? `${title.slice(0, 44)}…` : title);
  const safeInitials = escapeXml(initials || 'CC');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">\n  <defs>\n    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">\n      <stop offset="0%" stop-color="hsl(${hueA} 72% 46%)"/>\n      <stop offset="100%" stop-color="hsl(${hueB} 72% 34%)"/>\n    </linearGradient>\n  </defs>\n  <rect width="1200" height="600" fill="url(#g)"/>\n  <rect width="1200" height="600" fill="hsl(0 0% 0% / 0.18)"/>\n\n  <text x="60" y="520" font-family="Space Grotesk, system-ui, -apple-system, Segoe UI, Roboto" font-size="46" font-weight="700" fill="hsl(0 0% 100% / 0.92)">\n    ${safeTitle}\n  </text>\n\n  <text x="60" y="210" font-family="Space Grotesk, system-ui, -apple-system, Segoe UI, Roboto" font-size="140" font-weight="700" fill="hsl(0 0% 100% / 0.35)">\n    ${safeInitials}\n  </text>\n</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function hashString(input: string): number {
  // Fast, deterministic hash
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
