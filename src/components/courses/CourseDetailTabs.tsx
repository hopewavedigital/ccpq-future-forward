import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  description?: string | null;
  curriculum?: string | null;
  learningOutcomes?: string | null;
  whoShouldTake?: string | null;
};

function toLines(value?: string | null): string[] {
  return (value ?? "")
    .split(/\r?\n+/g)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function CourseDetailTabs({
  description,
  curriculum,
  learningOutcomes,
  whoShouldTake,
}: Props) {
  const curriculumLines = toLines(curriculum);
  const outcomesLines = toLines(learningOutcomes);
  const whoLines = toLines(whoShouldTake);

  return (
    <section aria-label="Course details">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
          <TabsTrigger value="content" className="text-xs sm:text-sm whitespace-nowrap">Course Content</TabsTrigger>
          <TabsTrigger value="outcomes" className="text-xs sm:text-sm whitespace-nowrap">Outcomes</TabsTrigger>
          <TabsTrigger value="who" className="text-xs sm:text-sm whitespace-nowrap">Who It's For</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 md:mt-6">
          <h2 className="text-xl md:text-2xl font-display font-bold mb-3 md:mb-4">About this course</h2>
          <div className="text-sm md:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
            {description || "Course overview coming soon."}
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-4 md:mt-6">
          <h2 className="text-xl md:text-2xl font-display font-bold mb-3 md:mb-4">Course curriculum</h2>
          {curriculumLines.length > 0 ? (
            <ul className="space-y-2 text-sm md:text-base text-muted-foreground">
              {curriculumLines.map((line, idx) => (
                <li key={idx} className="leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm md:text-base text-muted-foreground">Curriculum coming soon.</p>
          )}
        </TabsContent>

        <TabsContent value="outcomes" className="mt-4 md:mt-6">
          <h2 className="text-xl md:text-2xl font-display font-bold mb-3 md:mb-4">Learning outcomes</h2>
          {outcomesLines.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground">
              {outcomesLines.map((line, idx) => (
                <li key={idx} className="leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm md:text-base text-muted-foreground">Learning outcomes coming soon.</p>
          )}
        </TabsContent>

        <TabsContent value="who" className="mt-4 md:mt-6">
          <h2 className="text-xl md:text-2xl font-display font-bold mb-3 md:mb-4">Who should take this course?</h2>
          {whoLines.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base text-muted-foreground">
              {whoLines.map((line, idx) => (
                <li key={idx} className="leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm md:text-base text-muted-foreground">Recommended audience coming soon.</p>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
