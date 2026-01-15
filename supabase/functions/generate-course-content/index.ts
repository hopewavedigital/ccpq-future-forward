import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function generateCourseContent(title: string, existingData: any): Promise<{
  description: string;
  short_description: string;
  curriculum: string;
  learning_outcomes: string;
  who_should_take: string;
}> {
  const systemPrompt = `You are an expert course content writer for CCPQ (Centre for Continuous Professional Qualifications), a professional training institution in South Africa. Generate comprehensive, professional course content.

IMPORTANT FORMATTING RULES:
- Use plain text with line breaks, NOT markdown
- For lists, use simple bullet points with "• " prefix
- Keep content professional and formal
- Focus on practical, career-oriented benefits
- Content should be suitable for working professionals seeking qualifications

EXAMPLE FORMAT for curriculum:
Module 1: Introduction to [Topic]
• Understanding fundamentals
• Key concepts and terminology

Module 2: [Next Topic]
• Practical applications
• Case studies

EXAMPLE FORMAT for learning_outcomes:
Upon completion of this course, learners will be able to:
• [Outcome 1]
• [Outcome 2]
• [Outcome 3]

EXAMPLE FORMAT for who_should_take:
This course is ideal for:
• [Target audience 1]
• [Target audience 2]
• Professionals seeking to [benefit]`;

  const userPrompt = `Generate complete course content for: "${title}"

${existingData.description ? `Existing description (improve if needed): ${existingData.description}` : ""}
${existingData.curriculum ? `Existing curriculum (improve if needed): ${existingData.curriculum}` : ""}
${existingData.duration ? `Course duration: ${existingData.duration}` : ""}

Generate the following in JSON format:
{
  "description": "A comprehensive 150-250 word description of the course, its importance, and what students will gain",
  "short_description": "A 1-2 sentence summary (max 150 characters)",
  "curriculum": "Detailed curriculum with 4-6 modules, each with 3-5 bullet points",
  "learning_outcomes": "5-8 specific, measurable learning outcomes",
  "who_should_take": "Description of ideal candidates with 4-6 bullet points of target audiences"
}

Return ONLY valid JSON, no markdown code blocks.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  // Parse JSON from response (handle potential markdown code blocks)
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
  }
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse AI response:", content);
    throw new Error("Failed to parse AI response as JSON");
  }
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
    const batchSize = body.batch_size || 10;
    const offset = body.offset || 0;
    const dryRun = body.dry_run || false;

    // Fetch published courses that need content
    // Priority: missing description, then missing curriculum, then missing learning_outcomes
    const { data: courses, error: fetchError } = await supabase
      .from("courses")
      .select("id, title, slug, description, short_description, curriculum, learning_outcomes, who_should_take, duration")
      .eq("is_published", true)
      .or("description.is.null,description.eq.,curriculum.is.null,curriculum.eq.,learning_outcomes.is.null,learning_outcomes.eq.,who_should_take.is.null,who_should_take.eq.")
      .range(offset, offset + batchSize - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch courses: ${fetchError.message}`);
    }

    if (!courses || courses.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No courses need content generation",
          processed: 0,
          remaining: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Count total remaining
    const { count: totalRemaining } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .or("description.is.null,description.eq.,curriculum.is.null,curriculum.eq.,learning_outcomes.is.null,learning_outcomes.eq.,who_should_take.is.null,who_should_take.eq.");

    const results = {
      processed: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
      samples: [] as any[],
      remaining: (totalRemaining || 0) - courses.length,
    };

    for (const course of courses) {
      results.processed++;
      
      try {
        console.log(`Generating content for: ${course.title} (${course.id})`);
        
        const generated = await generateCourseContent(course.title, {
          description: course.description,
          curriculum: course.curriculum,
          duration: course.duration,
        });

        // Build update object - only update missing fields
        const updateData: any = {};
        
        if (!course.description || course.description.length < 50) {
          updateData.description = generated.description;
        }
        if (!course.short_description || course.short_description.length < 20) {
          updateData.short_description = generated.short_description;
        }
        if (!course.curriculum || course.curriculum.length < 50) {
          updateData.curriculum = generated.curriculum;
        }
        if (!course.learning_outcomes || course.learning_outcomes.length < 50) {
          updateData.learning_outcomes = generated.learning_outcomes;
        }
        if (!course.who_should_take || course.who_should_take.length < 50) {
          updateData.who_should_take = generated.who_should_take;
        }

        if (Object.keys(updateData).length === 0) {
          console.log(`No updates needed for: ${course.title}`);
          continue;
        }

        // Store sample for dry run or first few
        if (dryRun || results.samples.length < 3) {
          results.samples.push({
            id: course.id,
            title: course.title,
            updates: updateData,
          });
        }

        if (!dryRun) {
          const { error: updateError } = await supabase
            .from("courses")
            .update(updateData)
            .eq("id", course.id);

          if (updateError) {
            results.failed++;
            results.errors.push(`${course.title}: ${updateError.message}`);
          } else {
            results.updated++;
          }
        } else {
          results.updated++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (e) {
        results.failed++;
        const errorMsg = e instanceof Error ? e.message : "Unknown error";
        results.errors.push(`${course.title}: ${errorMsg}`);
        console.error(`Failed to generate for ${course.title}:`, e);
      }
    }

    return new Response(
      JSON.stringify({
        message: dryRun ? "Dry run complete" : "Content generation complete",
        ...results,
        next_offset: offset + batchSize,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("Generate course content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
