import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentJob, targetJob, experienceYears, industry } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `당신은 경력 전환 전문 코치입니다. 사용자의 현재 직무와 목표 직무를 바탕으로 6개월간의 상세한 경력 로드맵을 생성해주세요.

로드맵은 반드시 다음 JSON 형식으로 응답해주세요:
{
  "title": "로드맵 제목",
  "summary": "전체 로드맵 요약 (2-3문장)",
  "milestones": [
    {
      "month": 1,
      "title": "마일스톤 제목",
      "goals": ["목표1", "목표2", "목표3"],
      "actions": ["실행 항목1", "실행 항목2", "실행 항목3"],
      "skills": ["습득할 기술1", "습득할 기술2"],
      "resources": ["추천 리소스1", "추천 리소스2"]
    }
  ],
  "keySkills": ["핵심 기술1", "핵심 기술2", "핵심 기술3"],
  "potentialChallenges": ["예상 도전 과제1", "예상 도전 과제2"],
  "successMetrics": ["성공 지표1", "성공 지표2"]
}

각 월별로 구체적이고 실행 가능한 계획을 제시해주세요. 한국어로 작성해주세요.`;

    const userPrompt = `현재 직무: ${currentJob}
목표 직무: ${targetJob}
경력 연수: ${experienceYears || "미입력"}년
산업 분야: ${industry || "미입력"}

위 정보를 바탕으로 6개월간의 경력 전환 로드맵을 생성해주세요.`;

    console.log("Generating roadmap for:", { currentJob, targetJob, experienceYears, industry });

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
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
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다. 크레딧을 충전해주세요." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI 서비스 오류가 발생했습니다." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI Response received:", content?.substring(0, 200));

    // Parse the JSON from the response
    let roadmap;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      roadmap = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("Failed to parse roadmap JSON:", parseError);
      // If parsing fails, return the raw content
      roadmap = { 
        title: `${currentJob}에서 ${targetJob}으로의 전환 로드맵`,
        rawContent: content,
        parseError: true 
      };
    }

    return new Response(JSON.stringify({ roadmap, currentJob, targetJob }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-roadmap function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
