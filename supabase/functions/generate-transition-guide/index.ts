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
    const { currentJob, targetJob, experience, industry, skills, challenges } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert career transition coach specializing in creating detailed 60-day action plans for professionals transitioning to new roles.

Analyze the user's current situation and create a comprehensive 60-day transition guide.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "summary": "Brief overview of the transition strategy",
  "currentToTargetAnalysis": {
    "transferableSkills": ["skill1", "skill2"],
    "skillGaps": ["gap1", "gap2"],
    "industryConsiderations": "Analysis of industry-specific factors",
    "transitionDifficulty": "easy/moderate/challenging",
    "expectedTimeframe": "Realistic timeline assessment"
  },
  "weeklyPlan": [
    {
      "week": 1,
      "theme": "Week theme",
      "goals": ["goal1", "goal2"],
      "tasks": [
        {
          "task": "Specific task description",
          "priority": "high/medium/low",
          "estimatedHours": 5,
          "resources": ["resource1", "resource2"]
        }
      ],
      "milestones": ["milestone1"]
    }
  ],
  "learningPath": {
    "courses": [
      {
        "name": "Course name",
        "platform": "Platform name",
        "duration": "Duration",
        "priority": "high/medium/low"
      }
    ],
    "certifications": ["certification1", "certification2"],
    "books": ["book1", "book2"],
    "communities": ["community1", "community2"]
  },
  "networkingStrategy": {
    "targetConnections": ["type1", "type2"],
    "platforms": ["platform1", "platform2"],
    "weeklyGoals": "Networking goals per week",
    "outreachTemplates": ["template context 1"]
  },
  "portfolioBuilder": {
    "projects": [
      {
        "name": "Project name",
        "description": "Project description",
        "skills": ["skill1", "skill2"],
        "timeline": "Timeline"
      }
    ],
    "showcaseItems": ["item1", "item2"]
  },
  "interviewPrep": {
    "commonQuestions": ["question1", "question2"],
    "storyPoints": ["story1", "story2"],
    "technicalTopics": ["topic1", "topic2"]
  },
  "successMetrics": {
    "weeklyKPIs": ["kpi1", "kpi2"],
    "monthlyCheckpoints": ["checkpoint1", "checkpoint2"],
    "readinessIndicators": ["indicator1", "indicator2"]
  },
  "riskMitigation": {
    "potentialObstacles": ["obstacle1", "obstacle2"],
    "contingencyPlans": ["plan1", "plan2"],
    "supportResources": ["resource1", "resource2"]
  },
  "overallReadiness": 65
}

Create a detailed, actionable 60-day plan (approximately 8-9 weeks) with specific tasks, resources, and milestones. The plan should be realistic and tailored to the user's experience level and industry.`;

    const userPrompt = `Please create a 60-day role transition guide for:

Current Job: ${currentJob}
Target Job: ${targetJob}
Years of Experience: ${experience}
Industry: ${industry}
Current Skills: ${skills}
Main Challenges/Concerns: ${challenges || 'Not specified'}

Provide a comprehensive, week-by-week action plan with specific tasks, learning resources, networking strategies, and success metrics.`;

    console.log('Calling Lovable AI Gateway for transition guide generation...');

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
      console.error('AI Gateway error:', response.status, errorText);
      
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
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI response received, parsing JSON...');

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Failed to parse AI response',
        rawContent: content 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in generate-transition-guide function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
