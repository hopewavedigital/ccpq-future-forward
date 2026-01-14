import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type IncomingCourse = {
  name?: string;
  title?: string;
  link?: string;
  url?: string;
  content?: string;
  curriculum?: string;
  duration?: string;
  image?: string;
};

function parseMarkdownTable(markdown: string): IncomingCourse[] {
  const lines = markdown.split("\n").filter((line) => line.startsWith("|"));
  if (lines.length < 2) return [];
  
  // Skip header row and separator row
  const dataLines = lines.slice(2);
  const courses: IncomingCourse[] = [];
  
  for (const line of dataLines) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 5) continue;
    
    const [name, link, content, curriculum, duration, image] = cells;
    
    // Extract URL from markdown link format like <https://...>
    const urlMatch = link?.match(/<?(https?:\/\/[^>\s]+)>?/);
    const url = urlMatch ? urlMatch[1] : link;
    
    courses.push({
      name: name || undefined,
      link: url || undefined,
      content: content || undefined,
      curriculum: curriculum || undefined,
      duration: duration || undefined,
      image: image || undefined,
    });
  }
  
  return courses;
}

type CourseRow = { id: string; slug: string | null; title: string };

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractSlugFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const match = url.match(/\/course\/([^/]+)\/?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function extractFirstUrl(value: string): string | null {
  if (!value) return null;
  const match = value.match(/https?:\/\/[^\s)\]]+/i);
  return match ? match[0] : null;
}

function extractImageUrl(cell: string): string | null {
  const url = extractFirstUrl(cell);
  if (!url) return null;
  if (url.includes("drive.google.com/drive") && url.includes("/folders/")) return null;
  return url;
}

function cleanHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseCurriculum(curriculum: string): string {
  if (!curriculum) return "";
  const cleaned = cleanHtml(curriculum);
  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.match(/^\d+\s+STUDENTS?\s+ENROLLED$/i));
  return lines.join("\n");
}

function extractDescription(content: string): string {
  if (!content) return "";
  const cleaned = cleanHtml(content);

  let desc = cleaned;

  const cutoffPatterns = [
    /Who [Ss]hould [Tt]ake/i,
    /Who is this course for/i,
    /Who Should Take This Course/i,
    /Accredited by CPD/i,
    /Key Features/i,
    /Main Course Features/i,
    /Certification\s*\n/i,
    /Learning Outcomes\s*\n/i,
    /Assessment\s*\n/i,
    /Endorsement\s*\n/i,
    /Accreditation\s*\n/i,
  ];

  for (const pattern of cutoffPatterns) {
    const match = desc.search(pattern);
    if (match > 100) {
      desc = desc.substring(0, match);
      break;
    }
  }

  desc = desc.replace(/^Overview:?\s*/i, "").trim();

  if (desc.length > 6000) {
    desc = desc.substring(0, 6000) + "...";
  }

  return desc;
}

function extractLearningOutcomes(content: string): string | null {
  if (!content) return null;
  const cleaned = cleanHtml(content);

  const match = cleaned.match(
    /Learning Outcomes[:\s]*([\s\S]*?)(?=Assessment|Certification|Accreditation|Who (?:Should|is)|$)/i,
  );

  if (match && match[1]) {
    const outcomes = match[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("By the end"));

    if (outcomes.length > 0) return outcomes.join("\n");
  }

  return null;
}

function extractWhoShouldTake(content: string): string | null {
  if (!content) return null;
  const cleaned = cleanHtml(content);

  const patterns = [
    /Who [Ss]hould [Tt]ake[^:]*[:\s]*([\s\S]*?)(?=Certification|Learning Outcomes|Assessment|Accreditation|Key Features|$)/i,
    /Who is this course for\??[:\s]*([\s\S]*?)(?=Certification|Learning Outcomes|Assessment|Accreditation|$)/i,
    /Who Should Take This Course[:\s]*([\s\S]*?)(?=Certification|Learning Outcomes|Assessment|Accreditation|$)/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      const lines = match[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => {
          if (line.length === 0) return false;
          if (line.match(/^Anyone with a knack for learning/i)) return false;
          if (line.match(/^While this comprehensive training/i)) return false;
          return true;
        });

      if (lines.length > 0) return lines.join("\n");
    }
  }

  return null;
}

async function loadCourseIndex(
  // deno-lint-ignore no-explicit-any
  supabase: any,
): Promise<{
  bySlug: Map<string, string>;
  byTitle: Map<string, string>;
  byTitleLower: Map<string, string>;
}> {
  const bySlug = new Map<string, string>();
  const titleCounts = new Map<string, { id: string; count: number }>();
  const titleLowerCounts = new Map<string, { id: string; count: number }>();

  const PAGE = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("courses")
      .select("id, slug, title")
      .range(from, from + PAGE - 1);

    if (error) throw error;

    const page = (data ?? []) as CourseRow[];
    for (const row of page) {
      if (row.slug) bySlug.set(row.slug, row.id);

      const t = normalizeWhitespace(row.title || "");
      if (t) {
        const existing = titleCounts.get(t);
        if (!existing) titleCounts.set(t, { id: row.id, count: 1 });
        else titleCounts.set(t, { id: existing.id, count: existing.count + 1 });

        const tl = t.toLowerCase();
        const existingL = titleLowerCounts.get(tl);
        if (!existingL) titleLowerCounts.set(tl, { id: row.id, count: 1 });
        else titleLowerCounts.set(tl, { id: existingL.id, count: existingL.count + 1 });
      }
    }

    if (page.length < PAGE) break;
    from += PAGE;
  }

  const byTitle = new Map<string, string>();
  for (const [k, v] of titleCounts.entries()) {
    if (v.count === 1) byTitle.set(k, v.id);
  }

  const byTitleLower = new Map<string, string>();
  for (const [k, v] of titleLowerCounts.entries()) {
    if (v.count === 1) byTitleLower.set(k, v.id);
  }

  return { bySlug, byTitle, byTitleLower };
}

function resolveCourseIdFromIndex(
  index: { bySlug: Map<string, string>; byTitle: Map<string, string>; byTitleLower: Map<string, string> },
  slug: string | null,
  name: string | undefined,
): { id: string; matchedBy: "slug" | "title" | "title_ilike" } | null {
  if (slug) {
    const id = index.bySlug.get(slug);
    if (id) return { id, matchedBy: "slug" };
  }

  if (name) {
    const title = normalizeWhitespace(name);
    const exact = index.byTitle.get(title);
    if (exact) return { id: exact, matchedBy: "title" };

    const ilike = index.byTitleLower.get(title.toLowerCase());
    if (ilike) return { id: ilike, matchedBy: "title_ilike" };
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = (await req.json().catch(() => ({}))) as {
      courses?: IncomingCourse[];
      markdown?: string;
    };

    // Support both JSON array and markdown table input
    let courses = body.courses;
    if (body.markdown && typeof body.markdown === "string") {
      courses = parseMarkdownTable(body.markdown);
    }

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Provide { courses: [...] } or { markdown: '...' } with course data",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Processing ${courses.length} courses...`);

    const results = {
      updated: 0,
      skipped: 0,
      notFound: 0,
      failed: 0,
      matchedBySlug: 0,
      matchedByTitle: 0,
      matchedByTitleIlike: 0,
      processed: courses.length,
      errors: [] as string[],
    };

    const courseIndex = await loadCourseIndex(supabase);

    type CoursePatch = {
      id: string;
      description?: string;
      curriculum?: string;
      learning_outcomes?: string;
      who_should_take?: string;
      duration?: string;
      image_url?: string;
    };

    const patches: CoursePatch[] = [];

    for (const course of courses) {
      const name = course.name ?? course.title;
      const link = course.link ?? "";
      const slug = extractSlugFromUrl(link);

      const description = extractDescription(course.content ?? "");
      const curriculum = parseCurriculum(course.curriculum ?? "");
      const learningOutcomes = extractLearningOutcomes(course.content ?? "");
      const whoShouldTake = extractWhoShouldTake(course.content ?? "");
      const imageUrl = extractImageUrl(course.image ?? "");
      const duration = course.duration ? cleanHtml(course.duration) : "";

      const updateData: Omit<CoursePatch, "id"> = {};

      if (description) updateData.description = description;
      if (curriculum) updateData.curriculum = curriculum;
      if (learningOutcomes) updateData.learning_outcomes = learningOutcomes;
      if (whoShouldTake) updateData.who_should_take = whoShouldTake;
      if (duration) updateData.duration = duration;
      if (imageUrl) updateData.image_url = imageUrl;

      if (Object.keys(updateData).length === 0) {
        results.skipped++;
        continue;
      }

      const resolved = resolveCourseIdFromIndex(courseIndex, slug, name);
      if (!resolved) {
        results.notFound++;
        continue;
      }

      if (resolved.matchedBy === "slug") results.matchedBySlug++;
      else if (resolved.matchedBy === "title") results.matchedByTitle++;
      else results.matchedByTitleIlike++;

      patches.push({ id: resolved.id, ...updateData });
    }

    if (patches.length === 0) {
      console.log(
        `Completed: updated=0 skipped=${results.skipped} notFound=${results.notFound} failed=0 (no patches)`
      );
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update each course individually (not upsert) to avoid NOT NULL violations
    for (const patch of patches) {
      const { id, ...updateData } = patch;
      const { error } = await supabase.from("courses").update(updateData).eq("id", id);
      if (error) {
        results.failed++;
        if (results.errors.length < 30) {
          results.errors.push(`${id}: ${error.message}`);
        }
      } else {
        results.updated++;
      }
    }

    console.log(
      `Completed: updated=${results.updated} skipped=${results.skipped} notFound=${results.notFound} failed=${results.failed}`,
    );

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
