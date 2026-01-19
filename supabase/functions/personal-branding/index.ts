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
    const { currentRole, targetRole, industry, strengths, values, uniqueExperiences, targetAudience } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `당신은 퍼스널 브랜딩 전문가입니다. 다음 정보를 바탕으로 개인 브랜드 전략을 생성해주세요.

사용자 정보:
- 현재 역할: ${currentRole}
- 목표 역할: ${targetRole}
- 산업: ${industry}
- 강점: ${strengths}
- 핵심 가치: ${values}
- 독특한 경험: ${uniqueExperiences}
- 타겟 청중: ${targetAudience}

다음 JSON 형식으로 응답해주세요:
{
  "brandStatement": {
    "headline": "개인 브랜드 핵심 문장 (한 줄)",
    "elevator_pitch": "30초 엘리베이터 피치",
    "tagline": "기억에 남는 태그라인",
    "mission": "개인 미션 선언문"
  },
  "uniqueValueProposition": {
    "main": "핵심 차별화 포인트",
    "supporting_points": ["차별화 요소 1", "차별화 요소 2", "차별화 요소 3"],
    "proof_points": ["증거 포인트 1", "증거 포인트 2"]
  },
  "brandPersonality": {
    "traits": ["성격 특성 1", "성격 특성 2", "성격 특성 3"],
    "tone": "커뮤니케이션 톤",
    "archetype": "브랜드 아키타입 (예: 전문가, 혁신가, 조력자 등)"
  },
  "visualIdentity": {
    "color_palette": ["색상 1", "색상 2", "색상 3"],
    "style_keywords": ["스타일 키워드 1", "스타일 키워드 2"],
    "imagery_direction": "이미지 방향성"
  },
  "contentPillars": [
    {
      "pillar": "콘텐츠 기둥 1",
      "description": "설명",
      "example_topics": ["주제 1", "주제 2"]
    },
    {
      "pillar": "콘텐츠 기둥 2",
      "description": "설명",
      "example_topics": ["주제 1", "주제 2"]
    },
    {
      "pillar": "콘텐츠 기둥 3",
      "description": "설명",
      "example_topics": ["주제 1", "주제 2"]
    }
  ],
  "onlinePresence": {
    "linkedin_headline": "LinkedIn 헤드라인 제안",
    "linkedin_summary": "LinkedIn 요약 제안 (3-4문장)",
    "bio_short": "짧은 바이오 (트위터용, 160자)",
    "bio_long": "긴 바이오 (웹사이트용)"
  },
  "storytelling": {
    "origin_story": "브랜드 기원 스토리 (왜 이 일을 하게 되었는지)",
    "transformation_story": "변화 스토리 (어떤 변화를 이끌어내는지)",
    "key_anecdotes": ["핵심 일화 1", "핵심 일화 2"]
  },
  "actionPlan": {
    "week1": ["액션 1", "액션 2", "액션 3"],
    "week2": ["액션 1", "액션 2", "액션 3"],
    "week3": ["액션 1", "액션 2", "액션 3"],
    "week4": ["액션 1", "액션 2", "액션 3"]
  },
  "metrics": {
    "kpis": ["성과 지표 1", "성과 지표 2", "성과 지표 3"],
    "milestones": [
      { "timeline": "30일", "goal": "목표" },
      { "timeline": "90일", "goal": "목표" },
      { "timeline": "180일", "goal": "목표" }
    ]
  }
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "당신은 퍼스널 브랜딩 전문가입니다. 항상 유효한 JSON 형식으로 응답합니다." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다. 크레딧을 충전해주세요." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI 서비스 오류가 발생했습니다.");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Extract JSON from markdown code blocks if present
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    const analysis = JSON.parse(jsonContent);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in personal-branding function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "분석 중 오류가 발생했습니다." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
