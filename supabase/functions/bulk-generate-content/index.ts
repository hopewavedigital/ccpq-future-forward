import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function generateCourseContent(title: string): Promise<{
  description: string;
  short_description: string;
  curriculum: string;
  learning_outcomes: string;
  who_should_take: string;
}> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { 
          role: "system", 
          content: `You are a course content writer for CCPQ (Centre for Continuous Professional Qualifications) in South Africa. Generate professional course content. Use plain text with bullet points (• prefix). Return ONLY valid JSON.` 
        },
        { 
          role: "user", 
          content: `Generate content for course: "${title}"

Return JSON:
{
  "description": "150-200 word professional description",
  "short_description": "1 sentence summary under 100 chars",
  "curriculum": "4-5 modules with 3-4 bullet points each",
  "learning_outcomes": "5-6 specific outcomes with bullet points",
  "who_should_take": "4-5 target audiences with bullet points"
}` 
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices?.[0]?.message?.content || "";
  
  // Clean up JSON
  content = content.trim();
  if (content.startsWith("```")) {
    content = content.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
  }
  
  return JSON.parse(content);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(body.limit || 50, 100);

    // Fetch courses needing content
    const { data: courses, error: fetchError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("is_published", true)
      .or("learning_outcomes.is.null,learning_outcomes.eq.,who_should_take.is.null,who_should_take.eq.")
      .limit(limit);

    if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);
    if (!courses || courses.length === 0) {
      return new Response(
        JSON.stringify({ message: "All courses have content!", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Count remaining
    const { count } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .or("learning_outcomes.is.null,learning_outcomes.eq.,who_should_take.is.null,who_should_take.eq.");

    const results = { processed: 0, updated: 0, failed: 0, errors: [] as string[], remaining: count || 0 };

    // Process in parallel batches of 5
    const PARALLEL = 5;
    for (let i = 0; i < courses.length; i += PARALLEL) {
      const batch = courses.slice(i, i + PARALLEL);
      
      const promises = batch.map(async (course) => {
        try {
          console.log(`Generating: ${course.title}`);
          const content = await generateCourseContent(course.title);
          
          const { error } = await supabase
            .from("courses")
            .update({
              description: content.description,
              short_description: content.short_description,
              curriculum: content.curriculum,
              learning_outcomes: content.learning_outcomes,
              who_should_take: content.who_should_take,
            })
            .eq("id", course.id);

          if (error) throw error;
          return { success: true };
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          console.error(`Failed ${course.title}: ${msg}`);
          return { success: false, error: `${course.title}: ${msg}` };
        }
      });

      const batchResults = await Promise.all(promises);
      
      for (const r of batchResults) {
        results.processed++;
        if (r.success) {
          results.updated++;
        } else {
          results.failed++;
          if (results.errors.length < 10 && r.error) {
            results.errors.push(r.error);
          }
        }
      }
    }

    results.remaining = (count || 0) - results.updated;

    return new Response(
      JSON.stringify({ message: "Batch complete", ...results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("Bulk generate error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
