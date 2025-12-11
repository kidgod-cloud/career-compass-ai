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
    const { headline, summary, experience, skills, targetJob, industry } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing LinkedIn profile for:', targetJob);

    const systemPrompt = `당신은 LinkedIn 프로필 최적화 전문가입니다. 사용자의 프로필을 분석하고 구체적인 개선 제안을 제공해야 합니다.

분석 결과를 다음 JSON 형식으로 반환하세요:
{
  "overallScore": 85,
  "sections": {
    "headline": {
      "score": 80,
      "current": "현재 헤드라인 평가",
      "issues": ["문제점1", "문제점2"],
      "suggestions": ["개선안1", "개선안2"],
      "examples": ["예시 헤드라인1", "예시 헤드라인2"]
    },
    "summary": {
      "score": 75,
      "current": "현재 요약 평가",
      "issues": ["문제점1", "문제점2"],
      "suggestions": ["개선안1", "개선안2"],
      "improvedVersion": "개선된 요약 전체 텍스트"
    },
    "experience": {
      "score": 70,
      "current": "현재 경력 섹션 평가",
      "issues": ["문제점1", "문제점2"],
      "suggestions": ["개선안1", "개선안2"],
      "actionVerbs": ["추천 동작 동사1", "추천 동작 동사2"]
    },
    "skills": {
      "score": 65,
      "current": "현재 스킬 평가",
      "missingSkills": ["부족한 스킬1", "부족한 스킬2"],
      "recommendations": ["추천 스킬1", "추천 스킬2"]
    }
  },
  "keywords": {
    "current": ["현재 키워드1", "현재 키워드2"],
    "recommended": ["추천 키워드1", "추천 키워드2"],
    "industrySpecific": ["업계 특화 키워드1", "업계 특화 키워드2"]
  },
  "atsOptimization": {
    "score": 70,
    "tips": ["ATS 최적화 팁1", "ATS 최적화 팁2"]
  },
  "actionPlan": [
    {
      "priority": "high",
      "action": "즉시 실행할 액션",
      "impact": "예상 효과"
    }
  ]
}`;

    const userPrompt = `다음 LinkedIn 프로필을 분석해주세요:

목표 직무: ${targetJob}
업계: ${industry}

현재 헤드라인: ${headline || '없음'}

요약(About): ${summary || '없음'}

경력 사항: ${experience || '없음'}

스킬: ${skills || '없음'}

이 프로필을 ${targetJob} 포지션에 적합하도록 최적화하기 위한 상세한 분석과 개선안을 제공해주세요.`;

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
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw AI response:', content);

    // Parse JSON from response
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
      throw new Error('Failed to parse AI response');
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in optimize-linkedin function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
