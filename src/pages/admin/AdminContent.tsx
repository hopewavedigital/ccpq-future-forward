import { AdminLayout } from '@/components/admin/AdminLayout';
import { CourseContentManager } from '@/components/admin/CourseContentManager';

export default function AdminContent() {
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Course Content</h1>
          <p className="text-muted-foreground">Manage modules, lessons, and video content for your courses</p>
        </div>

        <CourseContentManager />
      </div>
    </AdminLayout>
  );
}
