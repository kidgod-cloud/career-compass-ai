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
    const { jobPosting, profile } = await req.json();

    if (!jobPosting || !jobPosting.trim()) {
      return new Response(JSON.stringify({ error: "채용공고 텍스트를 입력해주세요." }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const profileSummary = profile ? `
현재 직함: ${profile.job_title || '미입력'}
목표 직무: ${profile.target_job || '미입력'}
산업군: ${profile.industry || '미입력'}
경력 연수: ${profile.experience_years ?? '미입력'}
보유 기술: ${(profile.skills || []).join(', ') || '미입력'}
자격증: ${(profile.certifications || []).join(', ') || '없음'}
학력: ${(profile.education || []).map((e: any) => `${e.school} ${e.degree} ${e.major}`).join('; ') || '미입력'}
경력: ${(profile.work_experience || []).map((w: any) => `${w.company} ${w.position} (${w.period})`).join('; ') || '미입력'}
` : '프로필 정보 없음';

    const systemPrompt = `당신은 채용 적합도 평가 전문가입니다. 지원자의 프로필과 채용공고를 비교 분석하여 적합도를 평가합니다.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "grade": "A~F 중 하나 (A=매우적합, B=적합, C=보통, D=부족, E=매우부족, F=부적합)",
  "score": 0~100 사이 점수,
  "summary": "전체 적합도 요약 (2-3문장)",
  "dimensions": [
    {
      "name": "평가 항목명 (예: 기술 스택 매칭, 경력 수준, 산업 경험, 학력 요건, 자격증, 직무 관련성, 리더십/팀워크, 도메인 지식, 성장 가능성, 문화 적합도)",
      "score": 0~100,
      "grade": "A~F",
      "comment": "해당 항목에 대한 구체적 평가 코멘트"
    }
  ],
  "strengths": ["강점 1", "강점 2", "강점 3"],
  "gaps": ["보완점 1", "보완점 2", "보완점 3"],
  "recommendations": ["추천 액션 1", "추천 액션 2", "추천 액션 3"],
  "interviewTips": ["면접 준비 팁 1", "면접 준비 팁 2"]
}

10가지 평가 항목(dimensions)을 반드시 포함하세요:
1. 기술 스택 매칭 (가중치 20%)
2. 경력 수준 (15%)
3. 산업 경험 (10%)
4. 학력 요건 (5%)
5. 자격증/인증 (5%)
6. 직무 관련성 (15%)
7. 리더십/팀워크 (10%)
8. 도메인 지식 (5%)
9. 성장 가능성 (10%)
10. 문화 적합도 (5%)

가중치를 반영하여 총점(score)을 산출하세요.`;

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
          { role: "user", content: `## 지원자 프로필\n${profileSummary}\n\n## 채용공고\n${jobPosting}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다. 설정에서 크레딧을 추가해주세요." }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("evaluate-job-fit error:", error);
    return new Response(JSON.stringify({ error: error.message || "평가 중 오류가 발생했습니다." }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
