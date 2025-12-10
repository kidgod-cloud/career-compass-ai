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
    const { action, targetJob, industry, experienceYears, question, answer } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'generate_questions') {
      systemPrompt = `당신은 채용 면접 전문가입니다. 주어진 직무와 업계에 맞는 실제 면접 질문을 생성합니다.
질문은 행동 기반 질문, 기술 질문, 상황 질문을 균형있게 포함해야 합니다.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "questions": [
    {
      "id": 1,
      "category": "행동 기반" | "기술" | "상황",
      "question": "질문 내용",
      "tip": "이 질문에 대한 짧은 팁"
    }
  ]
}`;

      userPrompt = `목표 직무: ${targetJob}
업계: ${industry || '일반'}
경력: ${experienceYears || 0}년

위 정보를 바탕으로 5개의 면접 질문을 생성해주세요.`;

    } else if (action === 'evaluate_answer') {
      systemPrompt = `당신은 채용 면접 전문가이자 코치입니다. 면접 답변을 분석하고 건설적인 피드백을 제공합니다.
STAR 기법(상황-과제-행동-결과)을 기반으로 평가하고, 구체적인 개선점과 예시를 제공합니다.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "score": 1-100 사이의 점수,
  "strengths": ["강점1", "강점2"],
  "improvements": ["개선점1", "개선점2"],
  "starAnalysis": {
    "situation": "상황 설명 분석",
    "task": "과제 설명 분석",
    "action": "행동 설명 분석",
    "result": "결과 설명 분석"
  },
  "improvedAnswer": "개선된 답변 예시",
  "tips": ["추가 팁1", "추가 팁2"]
}`;

      userPrompt = `직무: ${targetJob}
질문: ${question}
답변: ${answer}

위 답변을 평가하고 피드백을 제공해주세요.`;
    }

    console.log(`Interview coach action: ${action}`);

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
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    console.log(`Interview coach ${action} completed successfully`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in interview-coach function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
