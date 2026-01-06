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
    const { targetJob, currentJob, industry, goals, challenges, experienceYears } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `당신은 경력 멘토링 전문가입니다. 사용자의 경력 목표와 현재 상황을 분석하여 이상적인 멘토 프로필을 추천하고, 멘토링 관계를 성공적으로 구축하는 방법을 안내해주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "idealMentorProfile": {
    "title": "이상적인 멘토 직책",
    "industry": "산업 분야",
    "experienceLevel": "경력 수준",
    "keySkills": ["핵심 기술 1", "핵심 기술 2", "핵심 기술 3"],
    "characteristics": ["특성 1", "특성 2", "특성 3"]
  },
  "recommendedMentors": [
    {
      "type": "멘토 유형",
      "title": "추천 직책/역할",
      "why": "이 멘토가 적합한 이유",
      "whatToLearn": ["배울 수 있는 것 1", "배울 수 있는 것 2"],
      "whereToFind": "이런 멘토를 찾을 수 있는 곳",
      "approachTip": "접근 방법 팁"
    }
  ],
  "outreachStrategy": {
    "messageTemplate": "첫 연락 메시지 템플릿",
    "subjectLine": "이메일 제목 예시",
    "keyPoints": ["언급해야 할 포인트 1", "포인트 2", "포인트 3"],
    "commonMistakes": ["피해야 할 실수 1", "실수 2"]
  },
  "meetingPreparation": {
    "questionsToAsk": ["질문 1", "질문 2", "질문 3", "질문 4", "질문 5"],
    "topicsToDiscuss": ["토론 주제 1", "주제 2", "주제 3"],
    "doAndDonts": {
      "do": ["해야 할 것 1", "해야 할 것 2"],
      "dont": ["하지 말아야 할 것 1", "하지 말아야 할 것 2"]
    }
  },
  "relationshipBuilding": {
    "frequency": "추천 미팅 빈도",
    "duration": "멘토링 관계 기간",
    "valueExchange": ["멘토에게 제공할 수 있는 가치 1", "가치 2"],
    "progressTracking": ["진행 상황 추적 방법 1", "방법 2"]
  },
  "findingPlatforms": [
    {
      "platform": "플랫폼 이름",
      "type": "플랫폼 유형",
      "description": "설명",
      "tips": "활용 팁"
    }
  ],
  "actionPlan": {
    "week1": ["1주차 할 일 1", "할 일 2"],
    "week2": ["2주차 할 일 1", "할 일 2"],
    "week3": ["3주차 할 일 1", "할 일 2"],
    "week4": ["4주차 할 일 1", "할 일 2"]
  }
}`;

    const userPrompt = `다음 정보를 바탕으로 이상적인 멘토 프로필과 멘토 찾기 전략을 제안해주세요:

현재 직무: ${currentJob}
목표 직무: ${targetJob}
산업 분야: ${industry}
경력: ${experienceYears}년
경력 목표: ${goals}
현재 직면한 도전: ${challenges}`;

    console.log("Calling Lovable AI Gateway for mentor matching...");
    
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

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from AI response");
    }
    
    const mentorData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(mentorData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in mentor-match function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
