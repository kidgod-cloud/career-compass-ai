import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, targetJob, industry, summary, skills, projects, experiences, education, contact } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Building portfolio for:", name, "targeting:", targetJob);

    const prompt = `당신은 전문 포트폴리오 디자이너이자 콘텐츠 전략가입니다.

다음 정보를 바탕으로 ${targetJob} 직무에 최적화된 디지털 포트폴리오 콘텐츠를 생성해주세요.

## 입력 정보
- 이름: ${name}
- 목표 직무: ${targetJob}
- 산업: ${industry}
- 자기소개: ${summary}
- 기술스택: ${skills}
- 프로젝트: ${projects}
- 경력: ${experiences}
- 학력: ${education}
- 연락처: ${contact}

## 분석 및 생성 요청

다음 JSON 형식으로 포트폴리오 콘텐츠를 생성해주세요:

{
  "hero": {
    "headline": "임팩트 있는 한 줄 소개",
    "tagline": "전문성을 강조하는 서브 타이틀",
    "cta": "콜투액션 문구"
  },
  "about": {
    "title": "About Me 섹션 제목",
    "content": "전문적이고 매력적인 자기소개 (200-300자)",
    "highlights": ["핵심 강점 1", "핵심 강점 2", "핵심 강점 3"]
  },
  "skills": {
    "categories": [
      {
        "name": "카테고리명",
        "items": [
          { "name": "기술명", "level": 90, "description": "간단한 설명" }
        ]
      }
    ]
  },
  "projects": [
    {
      "title": "프로젝트 제목",
      "description": "프로젝트 설명 (개선된 버전)",
      "role": "담당 역할",
      "impact": "성과/임팩트",
      "technologies": ["기술1", "기술2"],
      "highlights": ["주요 포인트 1", "주요 포인트 2"]
    }
  ],
  "experience": [
    {
      "company": "회사명",
      "role": "직책",
      "period": "기간",
      "description": "역할 설명 (개선된 버전)",
      "achievements": ["성과 1", "성과 2"]
    }
  ],
  "testimonials": [
    {
      "quote": "추천 예시 문구 (가상)",
      "author": "작성자",
      "role": "직책"
    }
  ],
  "contact": {
    "headline": "연락 섹션 제목",
    "message": "연락을 유도하는 메시지",
    "email": "${contact}"
  },
  "seo": {
    "title": "SEO 최적화된 페이지 제목",
    "description": "메타 설명",
    "keywords": ["키워드1", "키워드2"]
  },
  "recommendations": {
    "improvements": ["개선 제안 1", "개선 제안 2", "개선 제안 3"],
    "additions": ["추가하면 좋을 콘텐츠 1", "추가하면 좋을 콘텐츠 2"],
    "designTips": ["디자인 팁 1", "디자인 팁 2"]
  }
}

모든 콘텐츠는 ${targetJob} 직무와 ${industry} 산업에 최적화되어야 합니다.
JSON 형식만 반환하세요.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a professional portfolio designer and content strategist. Always respond with valid JSON only, no additional text." },
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
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다. 충전 후 다시 시도해주세요." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in response");
    }

    console.log("AI response received, parsing...");

    // Parse JSON from response
    let portfolio;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        portfolio = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse portfolio content");
    }

    return new Response(JSON.stringify({ portfolio }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Portfolio builder error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
