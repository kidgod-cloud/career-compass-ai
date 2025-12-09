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
    const { resumeContent, targetJob, industry } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `당신은 전문 이력서 컨설턴트이자 ATS(Applicant Tracking System) 최적화 전문가입니다.
사용자가 제공한 이력서 내용을 분석하고 다음을 포함한 상세한 최적화 조언을 제공하세요:

1. ATS 호환성 점수 (0-100)
2. 키워드 분석 및 추천
3. 형식 및 구조 개선점
4. 경험 및 성과 표현 개선 제안
5. 구체적인 수정 예시

반드시 다음 JSON 형식으로 응답하세요:
{
  "atsScore": number,
  "summary": "전반적인 이력서 평가 요약",
  "keywordAnalysis": {
    "found": ["발견된 키워드들"],
    "missing": ["추가 필요한 키워드들"],
    "recommendations": "키워드 관련 조언"
  },
  "formatIssues": [
    {
      "issue": "문제점",
      "suggestion": "개선 방안",
      "priority": "high" | "medium" | "low"
    }
  ],
  "contentImprovements": [
    {
      "section": "섹션명",
      "original": "원본 내용 예시",
      "improved": "개선된 내용 예시",
      "reason": "개선 이유"
    }
  ],
  "strengthPoints": ["강점 포인트들"],
  "actionItems": [
    {
      "action": "실행 항목",
      "impact": "high" | "medium" | "low",
      "timeEstimate": "예상 소요 시간"
    }
  ]
}`;

    const userPrompt = `다음 이력서를 분석하고 ATS 최적화 및 개선점을 제안해주세요.

목표 직무: ${targetJob || '명시되지 않음'}
업계: ${industry || '명시되지 않음'}

이력서 내용:
${resumeContent}`;

    console.log("Calling Lovable AI Gateway for resume optimization...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다. 워크스페이스에 크레딧을 추가해주세요." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI Response received:", content?.substring(0, 200));

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      analysis = {
        atsScore: 70,
        summary: content,
        keywordAnalysis: { found: [], missing: [], recommendations: "분석 결과를 파싱할 수 없습니다." },
        formatIssues: [],
        contentImprovements: [],
        strengthPoints: [],
        actionItems: []
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in optimize-resume function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
