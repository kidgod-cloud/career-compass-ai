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
    const { currentJob, targetJob, experience, industry, skills } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `당신은 전문 경력 컨설턴트입니다. 사용자의 정보를 바탕으로 경력 SWOT 분석을 수행합니다.
    
반드시 다음 JSON 형식으로만 응답하세요:
{
  "summary": "전체 SWOT 분석 요약 (2-3문장)",
  "strengths": [
    { "title": "강점 제목", "description": "상세 설명", "leverage": "이 강점을 활용하는 방법" }
  ],
  "weaknesses": [
    { "title": "약점 제목", "description": "상세 설명", "improvement": "개선 방법" }
  ],
  "opportunities": [
    { "title": "기회 제목", "description": "상세 설명", "action": "기회를 잡기 위한 행동" }
  ],
  "threats": [
    { "title": "위협 제목", "description": "상세 설명", "mitigation": "위협을 완화하는 방법" }
  ],
  "actionPlan": [
    { "priority": 1, "action": "우선순위 행동 1", "timeline": "실행 기간", "expectedOutcome": "예상 결과" }
  ],
  "overallScore": 75
}

각 카테고리(강점, 약점, 기회, 위협)에 3-4개의 항목을 포함하고, 행동 계획은 5개를 제안하세요.
overallScore는 0-100 사이의 숫자로 전체 경력 경쟁력 점수입니다.`;

    const userPrompt = `다음 정보를 바탕으로 경력 SWOT 분석을 수행해주세요:

현재 직무: ${currentJob}
목표 직무: ${targetJob}
경력 연수: ${experience}년
업계: ${industry}
보유 기술: ${skills}

한국어로 상세하고 실용적인 SWOT 분석을 제공해주세요.`;

    console.log('Calling Lovable AI Gateway for SWOT analysis...');
    
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
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI Response received:', content.substring(0, 200));
    
    // Parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from AI response');
    }
    
    const swotAnalysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(swotAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in analyze-swot function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
