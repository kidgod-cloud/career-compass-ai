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
    const { currentSkills, targetJob, experienceYears, industry } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `당신은 경력 개발 전문가입니다. 사용자의 현재 보유 기술과 목표 직무를 분석하여 기술 격차를 파악하고 실질적인 개선 방안을 제시해주세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "summary": "전반적인 기술 격차 요약 (2-3문장)",
  "currentSkillsAnalysis": [
    {
      "skill": "기술명",
      "level": "상/중/하",
      "relevance": "목표 직무와의 관련성 설명"
    }
  ],
  "requiredSkills": [
    {
      "skill": "필요한 기술명",
      "priority": "필수/권장/선택",
      "currentGap": "현재 수준과의 격차 설명",
      "learningPath": "학습 방법 제안"
    }
  ],
  "recommendations": [
    {
      "category": "카테고리 (예: 기술 학습, 자격증, 프로젝트 경험)",
      "action": "구체적인 액션 아이템",
      "timeframe": "예상 소요 기간",
      "resources": ["추천 리소스 1", "추천 리소스 2"]
    }
  ],
  "overallReadiness": {
    "percentage": 0-100 사이의 숫자,
    "assessment": "목표 직무 준비도 평가"
  }
}`;

    const userPrompt = `현재 보유 기술: ${currentSkills}
목표 직무: ${targetJob}
경력 연수: ${experienceYears || '미입력'}년
업계: ${industry || '미입력'}

위 정보를 바탕으로 기술 격차를 분석하고 개선 방안을 제시해주세요.`;

    console.log("Calling Lovable AI Gateway for skill analysis...");

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
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("Raw AI response:", content);

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
      console.error("Failed to parse AI response:", parseError);
      throw new Error("AI 응답을 파싱하는데 실패했습니다.");
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in analyze-skills function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
