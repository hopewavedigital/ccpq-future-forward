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

// Clean HTML tags and convert <br> to newlines
function cleanHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/<br\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Extract the main description (overview section)
function extractDescription(content: string): string {
  if (!content) return '';
  
  // Clean the content first
  let cleaned = cleanHtml(content);
  
  // Try to extract just the overview/intro section before "Who should take" or "Accredited by"
  const overviewMatch = cleaned.match(/^(?:Overview:?\s*)?(.+?)(?=(?:Who [Ss]hould [Tt]ake|Accredited by CPD|Key Features|Main Course Features|Learning Outcomes|Certification|Assessment))/is);
  
  if (overviewMatch && overviewMatch[1]) {
    return overviewMatch[1].trim();
  }
  
  // If no match, return cleaned content up to a reasonable length
  return cleaned.substring(0, 2000).trim();
}

// Extract learning outcomes
function extractLearningOutcomes(content: string): string | null {
  if (!content) return null;
  
  const cleaned = cleanHtml(content);
  
  // Look for "Learning Outcomes" section
  const match = cleaned.match(/Learning Outcomes[\s\S]*?(?:By the end of the course, learners will be able to:)?\s*([\s\S]*?)(?=Assessment|Certification|Accreditation|$)/i);
  
  if (match && match[1]) {
    const outcomes = match[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('By the end'));
    
    if (outcomes.length > 0) {
      return outcomes.join('\n');
    }
  }
  return null;
}

// Extract who should take this course
function extractWhoShouldTake(content: string): string | null {
  if (!content) return null;
  
  const cleaned = cleanHtml(content);
  
  // Look for "Who should take" section
  const match = cleaned.match(/Who [Ss]hould [Tt]ake[^:]*[:\s]*([\s\S]*?)(?=Certification|Learning Outcomes|Assessment|Accreditation|Key Features|$)/i);
  
  if (match && match[1]) {
    const who = match[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^Anyone with a knack/i));
    
    if (who.length > 0) {
      return who.join('\n');
    }
  }
  
  // Also check for specific role lists
  const rolesMatch = cleaned.match(/(?:This course is ideal for|ideal for those|includes the following professions)[:\s]*([\s\S]*?)(?=Certification|Learning|Assessment|$)/i);
  if (rolesMatch && rolesMatch[1]) {
    const roles = rolesMatch[1]
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (roles.length > 0) {
      return roles.join('\n');
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

      const description = extractDescription(course.content);
      const curriculum = parseCurriculum(course.curriculum);
      const learningOutcomes = extractLearningOutcomes(course.content);
      const whoShouldTake = extractWhoShouldTake(course.content);

      const updateData: Record<string, string | null> = {
        description: description || null,
        curriculum: curriculum || null,
        learning_outcomes: learningOutcomes,
        who_should_take: whoShouldTake,
      };

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
