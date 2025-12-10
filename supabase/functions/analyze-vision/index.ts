import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { currentJob, targetJob, industry, experienceYears, threeYearVision, currentGoals, values } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `당신은 경력 개발 전문 코치입니다. 사용자의 3년 경력 비전을 분석하고 현재 목표와의 정렬 상태를 평가합니다.
실질적이고 구체적인 조언을 제공하며, 비전과 목표 사이의 간극을 파악하고 이를 해소할 전략을 제시합니다.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "alignmentScore": 1-100 사이의 정렬 점수,
  "visionAnalysis": {
    "clarity": "비전의 명확성 분석",
    "feasibility": "실현 가능성 분석",
    "motivation": "동기 부여 요소 분석"
  },
  "alignmentAnalysis": {
    "aligned": ["현재 목표와 정렬된 요소들"],
    "misaligned": ["정렬되지 않은 요소들"],
    "gaps": ["채워야 할 간극들"]
  },
  "valueAlignment": {
    "score": 1-100,
    "analysis": "가치관과 비전의 일치도 분석"
  },
  "milestones": [
    {
      "year": 1,
      "title": "1년차 마일스톤",
      "goals": ["목표1", "목표2"],
      "actions": ["행동1", "행동2"]
    },
    {
      "year": 2,
      "title": "2년차 마일스톤",
      "goals": ["목표1", "목표2"],
      "actions": ["행동1", "행동2"]
    },
    {
      "year": 3,
      "title": "3년차 마일스톤",
      "goals": ["목표1", "목표2"],
      "actions": ["행동1", "행동2"]
    }
  ],
  "recommendations": {
    "immediate": ["즉시 실행할 행동들"],
    "shortTerm": ["3-6개월 내 실행할 행동들"],
    "longTerm": ["1년 이상 장기적으로 실행할 행동들"]
  },
  "riskFactors": ["비전 달성을 방해할 수 있는 위험 요소들"],
  "successFactors": ["비전 달성에 도움이 될 성공 요소들"],
  "refinedVision": "개선된 비전 제안"
}`;

    const userPrompt = `현재 직무: ${currentJob}
목표 직무: ${targetJob}
업계: ${industry || '일반'}
경력: ${experienceYears || 0}년

3년 경력 비전:
${threeYearVision}

현재 목표:
${currentGoals || '입력되지 않음'}

중요한 가치관:
${values || '입력되지 않음'}

위 정보를 바탕으로 경력 비전 정렬 분석을 수행해주세요.`;

    console.log('Analyzing career vision alignment');

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
        return new Response(JSON.stringify({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: '크레딧이 부족합니다.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    console.log('Career vision analysis completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-vision function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
