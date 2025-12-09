import { useCategories } from '@/hooks/useCourses';
import { cn } from '@/lib/utils';
import { Briefcase, Users, Monitor, Heart } from 'lucide-react';

interface CategoryFilterProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'business-management': Briefcase,
  'hr-administration': Users,
  'it-technology': Monitor,
  'healthcare-support': Heart,
};

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onCategoryChange(null)}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        )}
      >
        All Courses
      </button>
      {categories?.map((category) => {
        const Icon = categoryIcons[category.slug] || Briefcase;
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
              activeCategory === category.slug
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <Icon className="h-4 w-4" />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}