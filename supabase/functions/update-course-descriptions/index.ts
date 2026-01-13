import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type IncomingCourse = {
  name?: string;
  title?: string;
  link?: string;
  content?: string;
  curriculum?: string;
  duration?: string;
  image?: string;
};

type ParsedSheetCourse = Required<Pick<IncomingCourse, "name" | "link" | "content" | "curriculum" | "duration" | "image">>;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

// Extract slug from URL like https://course-hosting.com/course/xyz/
function extractSlugFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const match = url.match(/\/course\/([^/]+)\/?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function stripAngleBrackets(value: string): string {
  const v = value.trim();
  if (v.startsWith("<") && v.endsWith(">")) return v.slice(1, -1);
  return v;
}

function extractFirstUrl(value: string): string | null {
  if (!value) return null;
  const match = value.match(/https?:\/\/[^\s)\]]+/i);
  return match ? match[0] : null;
}

function extractImageUrl(cell: string): string | null {
  const url = extractFirstUrl(cell);
  if (!url) return null;
  // Avoid the generic folder link if present
  if (url.includes("drive.google.com/drive") && url.includes("/folders/")) return null;
  return url;
}

// Clean HTML tags and convert <br> to newlines
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

// Parse curriculum - clean module list
function parseCurriculum(curriculum: string): string {
  if (!curriculum) return "";
  const cleaned = cleanHtml(curriculum);
  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.match(/^\d+\s+STUDENTS?\s+ENROLLED$/i));
  return lines.join("\n");
}

// Extract main description (overview section) from content
function extractDescription(content: string): string {
  if (!content) return "";
  const cleaned = cleanHtml(content);

  let desc = cleaned;

  const cutoffPatterns = [
    /Who [Ss]hould [Tt]ake/i,
    /Accredited by CPD/i,
    /Key Features/i,
    /Main Course Features/i,
    /Certification\s*\n/i,
    /Learning Outcomes\s*\n/i,
    /Assessment\s*\n/i,
    /Who is this course for/i,
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

  if (desc.length > 3000) {
    desc = desc.substring(0, 3000) + "...";
  }

  return desc;
}

function extractLearningOutcomes(content: string): string | null {
  if (!content) return null;
  const cleaned = cleanHtml(content);

  const match = cleaned.match(
    /Learning Outcomes[:\s]*(?:By the end of the course, learners will be able to:)?\s*([\s\S]*?)(?=Assessment|Certification|Accreditation|Who (?:Should|is)|$)/i,
  );

  if (match && match[1]) {
    const outcomes = match[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("By the end"));

    if (outcomes.length > 0) {
      return outcomes.join("\n");
    }
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
    /Who Should Take the course[:\s]*([\s\S]*?)(?=Certification|Learning Outcomes|Assessment|Accreditation|$)/i,
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

      if (lines.length > 0) {
        return lines.join("\n");
      }
    }
  }

  return null;
}

type CourseRow = { id: string; slug: string; title: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveCourseId(supabase: any, slug: string | null, name: string | undefined) {
  if (slug) {
    const { data } = await supabase
      .from("courses")
      .select("id, slug, title")
      .eq("slug", slug)
      .limit(1) as { data: CourseRow[] | null };

    if (data && data.length === 1) {
      return { id: data[0].id, matchedBy: "slug" as const };
    }
  }

  if (name) {
    const title = normalizeWhitespace(name);

    // Exact title match (case-sensitive) first
    const result = await supabase
      .from("courses")
      .select("id, slug, title")
      .eq("title", title)
      .limit(2) as { data: CourseRow[] | null };

    let data = result.data;

    if (!data || data.length === 0) {
      // Case-insensitive exact-ish match
      const res = await supabase
        .from("courses")
        .select("id, slug, title")
        .ilike("title", title)
        .limit(2) as { data: CourseRow[] | null };
      data = res.data;
    }

    if (data && data.length === 1) {
      return { id: data[0].id, matchedBy: "title" as const };
    }
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
    };

    const courses = body.courses;

    if (!courses || !Array.isArray(courses)) {
      return new Response(
        JSON.stringify({
          error: "Provide { courses: [...] } with course data",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(`Payload sync: processing ${courses.length} courses...`);

    const results = {
      updated: 0,
      skipped: 0,
      notFound: 0,
      failed: 0,
      matchedBySlug: 0,
      matchedByTitle: 0,
      totalCourses: courses.length,
      errors: [] as string[],
    };

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

      const updateData: Record<string, string | null> = {};

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

      const resolved = await resolveCourseId(supabase, slug, name);

      if (!resolved) {
        results.notFound++;
        continue;
      }

      if (resolved.matchedBy === "slug") results.matchedBySlug++;
      else results.matchedByTitle++;

      const { data, error } = await supabase
        .from("courses")
        .update(updateData)
        .eq("id", resolved.id)
        .select("id")
        .limit(1);

      if (error) {
        results.failed++;
        if (results.errors.length < 30) {
          results.errors.push(`${name ?? slug ?? "unknown"}: ${error.message}`);
        }
        continue;
      }

      if (!data || data.length === 0) {
        results.failed++;
        if (results.errors.length < 30) {
          results.errors.push(`${name ?? slug ?? "unknown"}: update returned no rows`);
        }
        continue;
      }

      results.updated++;
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
