import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to extract slug from URL
function extractSlugFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/course\/([^/]+)\/?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Helper to parse curriculum into structured format
function parseCurriculum(curriculum: string): string {
  if (!curriculum) return '';
  
  // Split by <br/> and clean up module lines
  const lines = curriculum
    .split(/<br\/?>/gi)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^\d+\s+STUDENTS?\s+ENROLLED$/i));
  
  return lines.join('\n');
}

// Helper to extract learning outcomes from description
function extractLearningOutcomes(description: string): string | null {
  if (!description) return null;
  
  // Look for "Learning Outcomes" section
  const match = description.match(/Learning Outcomes[\s\S]*?(?=Assessment|Certification|$)/i);
  if (match) {
    const outcomes = match[0]
      .replace(/Learning Outcomes/i, '')
      .split(/<br\/?>/gi)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('By the end'));
    
    if (outcomes.length > 0) {
      return outcomes.join('\n');
    }
  }
  return null;
}

// Helper to extract who should take from description
function extractWhoShouldTake(description: string): string | null {
  if (!description) return null;
  
  // Look for "Who should take" or "Who Should Take" section
  const match = description.match(/Who [Ss]hould [Tt]ake[\s\S]*?(?=Certification|Learning Outcomes|Assessment|$)/i);
  if (match) {
    const whoShould = match[0]
      .replace(/Who [Ss]hould [Tt]ake[^<]*/i, '')
      .split(/<br\/?>/gi)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (whoShould.length > 0) {
      return whoShould.join('\n');
    }
  }
  return null;
}

// Clean HTML from description
function cleanDescription(description: string): string {
  if (!description) return '';
  
  return description
    .replace(/<br\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { courses } = await req.json();

    if (!courses || !Array.isArray(courses)) {
      return new Response(JSON.stringify({ error: "courses array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = {
      updated: 0,
      failed: 0,
      notFound: 0,
      errors: [] as string[],
    };

    for (const course of courses) {
      const slug = extractSlugFromUrl(course.link);
      if (!slug) {
        results.failed++;
        results.errors.push(`Invalid URL: ${course.link}`);
        continue;
      }

      const cleanedDescription = cleanDescription(course.content);
      const curriculum = parseCurriculum(course.curriculum);
      const learningOutcomes = extractLearningOutcomes(course.content);
      const whoShouldTake = extractWhoShouldTake(course.content);

      const updateData: Record<string, string | null> = {
        description: cleanedDescription,
        curriculum: curriculum || null,
      };

      if (learningOutcomes) {
        updateData.learning_outcomes = learningOutcomes;
      }
      if (whoShouldTake) {
        updateData.who_should_take = whoShouldTake;
      }
      if (course.duration) {
        updateData.duration = course.duration;
      }

      const { data, error } = await supabase
        .from("courses")
        .update(updateData)
        .eq("slug", slug)
        .select("id");

      if (error) {
        results.failed++;
        results.errors.push(`${slug}: ${error.message}`);
      } else if (!data || data.length === 0) {
        results.notFound++;
      } else {
        results.updated++;
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
