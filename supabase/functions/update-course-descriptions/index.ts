import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

// Clean HTML tags and convert <br> to newlines
function cleanHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/<br\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Parse curriculum - clean module list
function parseCurriculum(curriculum: string): string {
  if (!curriculum) return '';
  const cleaned = cleanHtml(curriculum);
  // Filter out noise like "3 STUDENTS ENROLLED"
  const lines = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^\d+\s+STUDENTS?\s+ENROLLED$/i));
  return lines.join('\n');
}

// Extract main description (overview section) from content
function extractDescription(content: string): string {
  if (!content) return '';
  const cleaned = cleanHtml(content);
  
  // Try to extract overview section
  let desc = cleaned;
  
  // Remove everything after these headers
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
  
  // Clean up "Overview:" prefix
  desc = desc.replace(/^Overview:?\s*/i, '').trim();
  
  // Limit length
  if (desc.length > 3000) {
    desc = desc.substring(0, 3000) + '...';
  }
  
  return desc;
}

// Extract learning outcomes section
function extractLearningOutcomes(content: string): string | null {
  if (!content) return null;
  const cleaned = cleanHtml(content);
  
  // Match "Learning Outcomes" section
  const match = cleaned.match(/Learning Outcomes[:\s]*(?:By the end of the course, learners will be able to:)?\s*([\s\S]*?)(?=Assessment|Certification|Accreditation|Who (?:Should|is)|$)/i);
  
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

// Extract "Who should take" section
function extractWhoShouldTake(content: string): string | null {
  if (!content) return null;
  const cleaned = cleanHtml(content);
  
  // Try multiple patterns
  const patterns = [
    /Who [Ss]hould [Tt]ake[^:]*[:\s]*([\s\S]*?)(?=Certification|Learning Outcomes|Assessment|Accreditation|Key Features|$)/i,
    /Who is this course for\??[:\s]*([\s\S]*?)(?=Certification|Learning Outcomes|Assessment|Accreditation|$)/i,
    /(?:This course is ideal for|ideal for those|includes the following professions)[:\s]*([\s\S]*?)(?=Certification|Learning|Assessment|$)/i,
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      const lines = match[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => {
          if (line.length === 0) return false;
          // Skip generic filler text
          if (line.match(/^Anyone with a knack for learning/i)) return false;
          if (line.match(/^While this comprehensive training/i)) return false;
          return true;
        });
      
      if (lines.length > 0) {
        return lines.join('\n');
      }
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

    const { courses } = await req.json();

    if (!courses || !Array.isArray(courses)) {
      return new Response(JSON.stringify({ error: "courses array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${courses.length} courses...`);

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
        if (results.errors.length < 20) {
          results.errors.push(`Invalid URL: ${course.link}`);
        }
        continue;
      }

      const description = extractDescription(course.content);
      const curriculum = parseCurriculum(course.curriculum);
      const learningOutcomes = extractLearningOutcomes(course.content);
      const whoShouldTake = extractWhoShouldTake(course.content);

      const updateData: Record<string, string | null> = {};
      
      if (description) {
        updateData.description = description;
      }
      if (curriculum) {
        updateData.curriculum = curriculum;
      }
      if (learningOutcomes) {
        updateData.learning_outcomes = learningOutcomes;
      }
      if (whoShouldTake) {
        updateData.who_should_take = whoShouldTake;
      }
      if (course.duration) {
        updateData.duration = course.duration;
      }

      // Skip if no data to update
      if (Object.keys(updateData).length === 0) {
        continue;
      }

      const { data, error } = await supabase
        .from("courses")
        .update(updateData)
        .eq("slug", slug)
        .select("id");

      if (error) {
        results.failed++;
        if (results.errors.length < 20) {
          results.errors.push(`${slug}: ${error.message}`);
        }
      } else if (!data || data.length === 0) {
        results.notFound++;
      } else {
        results.updated++;
      }
    }

    console.log(`Completed: ${results.updated} updated, ${results.notFound} not found, ${results.failed} failed`);

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
