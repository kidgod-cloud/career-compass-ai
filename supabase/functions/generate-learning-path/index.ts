import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetJob, currentSkills, experienceLevel, learningStyle, hoursPerDay, industry } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert career coach and learning path designer. Analyze the user's target job and current skills to create a comprehensive 30-day personalized learning plan.

Return your analysis as a JSON object with this structure:
{
  "overview": {
    "targetJob": "string",
    "totalDays": 30,
    "estimatedHoursTotal": number,
    "difficultyLevel": "beginner" | "intermediate" | "advanced",
    "summary": "string describing the learning journey"
  },
  "skillsToAcquire": [
    {
      "skill": "string",
      "priority": "high" | "medium" | "low",
      "estimatedHours": number,
      "reason": "string"
    }
  ],
  "weeklyPlan": [
    {
      "week": 1,
      "theme": "string",
      "goals": ["string"],
      "days": [
        {
          "day": 1,
          "title": "string",
          "tasks": [
            {
              "task": "string",
              "duration": "string",
              "type": "video" | "reading" | "practice" | "project" | "quiz",
              "resource": "string (recommended resource or platform)",
              "description": "string"
            }
          ],
          "milestone": "string (what you'll achieve by end of day)"
        }
      ]
    }
  ],
  "resources": {
    "courses": [
      {
        "name": "string",
        "platform": "string",
        "url": "string (example URL format)",
        "cost": "free" | "paid",
        "duration": "string"
      }
    ],
    "books": [
      {
        "title": "string",
        "author": "string",
        "reason": "string"
      }
    ],
    "tools": [
      {
        "name": "string",
        "purpose": "string",
        "learnPriority": "essential" | "recommended" | "optional"
      }
    ],
    "communities": [
      {
        "name": "string",
        "platform": "string",
        "benefit": "string"
      }
    ]
  },
  "milestones": [
    {
      "week": number,
      "title": "string",
      "description": "string",
      "deliverable": "string"
    }
  ],
  "tips": [
    {
      "category": "productivity" | "motivation" | "learning" | "networking",
      "tip": "string"
    }
  ],
  "nextSteps": ["string (what to do after 30 days)"]
}

Respond ONLY with the JSON object, no additional text.`;

    const userPrompt = `Create a personalized 30-day learning path for:

Target Job: ${targetJob}
Industry: ${industry || 'Not specified'}
Current Skills: ${currentSkills || 'Not specified'}
Experience Level: ${experienceLevel || 'Not specified'}
Preferred Learning Style: ${learningStyle || 'Mixed (videos, reading, practice)'}
Available Hours Per Day: ${hoursPerDay || '2'} hours

Please create a detailed, actionable 30-day learning plan that:
1. Prioritizes the most critical skills for the target job
2. Balances theory with practical application
3. Includes specific resources and recommendations
4. Has clear daily tasks and weekly milestones
5. Considers the learning style preference
6. Is realistic given the available time per day`;

    console.log('Generating learning path for:', targetJob);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('Learning path generated successfully');

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse learning path analysis');
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-learning-path function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
