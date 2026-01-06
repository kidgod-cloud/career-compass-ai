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
    const { targetAudience, industry, expertise, goals, tone, frequency } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `당신은 LinkedIn 콘텐츠 전략 전문가입니다. 사용자의 전문 분야와 목표에 맞는 LinkedIn 게시물 아이디어와 콘텐츠 전략을 제안해주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "contentStrategy": {
    "positioning": "개인 브랜드 포지셔닝 전략",
    "uniqueAngle": "차별화된 관점/각도",
    "coreThemes": ["핵심 주제 1", "핵심 주제 2", "핵심 주제 3"]
  },
  "contentPillars": [
    {
      "pillar": "콘텐츠 필러 이름",
      "description": "설명",
      "percentage": 30,
      "examples": ["예시 주제 1", "예시 주제 2"]
    }
  ],
  "postIdeas": [
    {
      "type": "게시물 유형 (텍스트/이미지/캐러셀/동영상/폴)",
      "title": "게시물 제목/훅",
      "hook": "관심을 끄는 첫 문장",
      "outline": ["본문 포인트 1", "본문 포인트 2", "본문 포인트 3"],
      "cta": "행동 유도 문구",
      "hashtags": ["해시태그1", "해시태그2", "해시태그3"],
      "bestTime": "최적 게시 시간",
      "expectedEngagement": "예상 참여도"
    }
  ],
  "weeklyPlan": {
    "monday": { "type": "게시물 유형", "theme": "주제" },
    "tuesday": { "type": "게시물 유형", "theme": "주제" },
    "wednesday": { "type": "게시물 유형", "theme": "주제" },
    "thursday": { "type": "게시물 유형", "theme": "주제" },
    "friday": { "type": "게시물 유형", "theme": "주제" }
  },
  "engagementTips": [
    {
      "tip": "참여도 향상 팁",
      "why": "이유",
      "howTo": "실행 방법"
    }
  ],
  "trendingFormats": [
    {
      "format": "트렌딩 포맷 이름",
      "description": "설명",
      "example": "예시"
    }
  ],
  "hashtagStrategy": {
    "primary": ["주요 해시태그 1", "주요 해시태그 2"],
    "secondary": ["보조 해시태그 1", "보조 해시태그 2"],
    "niche": ["니치 해시태그 1", "니치 해시태그 2"],
    "tips": "해시태그 사용 팁"
  },
  "monthlyGoals": {
    "posts": "월간 게시물 수",
    "engagement": "목표 참여율",
    "followers": "예상 팔로워 증가",
    "milestones": ["마일스톤 1", "마일스톤 2"]
  }
}`;

    const userPrompt = `다음 정보를 바탕으로 LinkedIn 콘텐츠 전략과 게시물 아이디어를 생성해주세요:

타겟 오디언스: ${targetAudience}
산업 분야: ${industry}
전문 분야/기술: ${expertise}
콘텐츠 목표: ${goals}
선호하는 톤: ${tone}
게시 빈도: ${frequency}

최소 10개의 구체적인 게시물 아이디어를 포함해주세요.`;

    console.log("Calling Lovable AI Gateway for content strategy...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다. 충전이 필요합니다." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response received successfully");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from AI response");
    }
    
    const strategyData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(strategyData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in content-strategy function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
