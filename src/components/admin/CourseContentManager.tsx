import { useState } from 'react';
import { useAdminCourses } from '@/hooks/useAdminData';
import { useCourseModules, useModuleLessons, useCreateModule, useUpdateModule, useDeleteModule, useCreateLesson, useUpdateLesson, useDeleteLesson, useBulkImportContent, Module, Lesson } from '@/hooks/useCourseContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Plus, Pencil, Trash2, Video, FileText, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function ModuleForm({ courseId, module, onClose }: { courseId: string; module?: Module; onClose: () => void }) {
  const [title, setTitle] = useState(module?.title || '');
  const [description, setDescription] = useState(module?.description || '');
  
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const { data: existingModules } = useCourseModules(courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (module) {
      await updateModule.mutateAsync({ id: module.id, title, description });
    } else {
      const orderIndex = existingModules?.length || 0;
      await createModule.mutateAsync({ course_id: courseId, title, description, order_index: orderIndex });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Module Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={createModule.isPending || updateModule.isPending}>
          {(createModule.isPending || updateModule.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {module ? 'Update' : 'Create'} Module
        </Button>
      </div>
    </form>
  );
}

function LessonForm({ moduleId, lesson, onClose }: { moduleId: string; lesson?: Lesson; onClose: () => void }) {
  const [title, setTitle] = useState(lesson?.title || '');
  const [content, setContent] = useState(lesson?.content || '');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '');
  const [duration, setDuration] = useState(lesson?.duration_minutes?.toString() || '');
  
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const { data: existingLessons } = useModuleLessons(moduleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const lessonData = {
      title,
      content: content || undefined,
      video_url: videoUrl || undefined,
      duration_minutes: duration ? parseInt(duration) : undefined,
    };

    if (lesson) {
      await updateLesson.mutateAsync({ id: lesson.id, ...lessonData });
    } else {
      const orderIndex = existingLessons?.length || 0;
      await createLesson.mutateAsync({ module_id: moduleId, ...lessonData, order_index: orderIndex });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="lessonTitle">Lesson Title</Label>
        <Input id="lessonTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="videoUrl">Video URL (YouTube, Vimeo, etc.)</Label>
        <Input id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="content">Content / Notes</Label>
        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={createLesson.isPending || updateLesson.isPending}>
          {(createLesson.isPending || updateLesson.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {lesson ? 'Update' : 'Create'} Lesson
        </Button>
      </div>
    </form>
  );
}

function LessonItem({ lesson, moduleId }: { lesson: Lesson; moduleId: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const deleteLesson = useDeleteLesson();

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
      <div className="flex items-center gap-3">
        {lesson.video_url ? (
          <Video className="h-4 w-4 text-primary" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" />
        )}
        <div>
          <p className="font-medium text-sm">{lesson.title}</p>
          {lesson.duration_minutes && (
            <p className="text-xs text-muted-foreground">{lesson.duration_minutes} min</p>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Lesson</DialogTitle>
            </DialogHeader>
            <LessonForm moduleId={moduleId} lesson={lesson} onClose={() => setEditOpen(false)} />
          </DialogContent>
        </Dialog>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive"
          onClick={() => deleteLesson.mutate({ id: lesson.id, moduleId })}
          disabled={deleteLesson.isPending}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function ModuleItem({ module, courseId }: { module: Module; courseId: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const { data: lessons, isLoading } = useModuleLessons(module.id);
  const deleteModule = useDeleteModule();

  return (
    <AccordionItem value={module.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="text-left">
            <span className="font-medium">{module.title}</span>
            <span className="text-muted-foreground text-sm ml-2">
              ({lessons?.length || 0} lessons)
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="pl-4 space-y-3">
          {module.description && (
            <p className="text-sm text-muted-foreground">{module.description}</p>
          )}
          
          <div className="flex gap-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-1 h-3 w-3" /> Edit Module
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Module</DialogTitle>
                </DialogHeader>
                <ModuleForm courseId={courseId} module={module} onClose={() => setEditOpen(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={addLessonOpen} onOpenChange={setAddLessonOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-1 h-3 w-3" /> Add Lesson
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Lesson</DialogTitle>
                </DialogHeader>
                <LessonForm moduleId={module.id} onClose={() => setAddLessonOpen(false)} />
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive"
              onClick={() => deleteModule.mutate({ id: module.id, courseId })}
              disabled={deleteModule.isPending}
            >
              <Trash2 className="mr-1 h-3 w-3" /> Delete
            </Button>
          </div>

          <div className="space-y-2 mt-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : lessons && lessons.length > 0 ? (
              lessons.map((lesson) => (
                <LessonItem key={lesson.id} lesson={lesson} moduleId={module.id} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No lessons yet</p>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function BulkImportDialog({ courseId, onClose }: { courseId: string; onClose: () => void }) {
  const [jsonInput, setJsonInput] = useState('');
  const bulkImport = useBulkImportContent();

  const handleImport = async () => {
    try {
      const modules = JSON.parse(jsonInput);
      if (!Array.isArray(modules)) {
        throw new Error('Input must be an array of modules');
      }
      await bulkImport.mutateAsync({ courseId, modules });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Import Error',
        description: error.message || 'Invalid JSON format',
        variant: 'destructive',
      });
    }
  };

  const exampleJson = `[
  {
    "title": "Module 1: Introduction",
    "description": "Getting started",
    "lessons": [
      {
        "title": "Welcome to the Course",
        "video_url": "https://youtube.com/watch?v=...",
        "duration_minutes": 10
      },
      {
        "title": "Course Overview",
        "content": "In this lesson...",
        "duration_minutes": 15
      }
    ]
  }
]`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Paste JSON data with modules and lessons. Each module should have a title and an array of lessons.
      </p>
      <div>
        <Label>JSON Data</Label>
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={12}
          placeholder={exampleJson}
          className="font-mono text-xs"
        />
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          View example format
        </summary>
        <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">{exampleJson}</pre>
      </details>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleImport} disabled={bulkImport.isPending || !jsonInput.trim()}>
          {bulkImport.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Import Content
        </Button>
      </div>
    </div>
  );
}

export function CourseContentManager() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  
  const { data: courses, isLoading: coursesLoading } = useAdminCourses();
  const { data: modules, isLoading: modulesLoading } = useCourseModules(selectedCourseId || undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Content Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Select Course</Label>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger>
              <SelectValue placeholder={coursesLoading ? "Loading..." : "Select a course to manage"} />
            </SelectTrigger>
            <SelectContent>
              {courses?.map((course: any) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCourseId && (
          <>
            <div className="flex gap-2">
              <Dialog open={addModuleOpen} onOpenChange={setAddModuleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Module
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Module</DialogTitle>
                  </DialogHeader>
                  <ModuleForm courseId={selectedCourseId} onClose={() => setAddModuleOpen(false)} />
                </DialogContent>
              </Dialog>

              <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Bulk Import
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Bulk Import Content</DialogTitle>
                  </DialogHeader>
                  <BulkImportDialog courseId={selectedCourseId} onClose={() => setBulkImportOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            {modulesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : modules && modules.length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {modules.map((module) => (
                  <ModuleItem key={module.id} module={module} courseId={selectedCourseId} />
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No modules yet for this course.</p>
                <p className="text-sm">Add modules to create course content.</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
