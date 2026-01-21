import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/enrollments', label: 'Enrollments', icon: GraduationCap },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/progress', label: 'Progress', icon: BarChart3 },
];

export function AdminSidebar() {
  const { signOut, profile } = useAuth();
  const location = useLocation();

  const isActive = (href: string, end?: boolean) => {
    if (end) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-primary text-primary-foreground min-h-screen flex flex-col">
      <div className="p-6 border-b border-primary-foreground/10">
        <h1 className="text-xl font-display font-bold">CCPQ Admin</h1>
        <p className="text-sm text-primary-foreground/60 mt-1">
          {profile?.full_name || 'Admin'}
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end={item.end}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive(item.href, item.end)
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-foreground/10">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span>Back to Site</span>
        </NavLink>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
