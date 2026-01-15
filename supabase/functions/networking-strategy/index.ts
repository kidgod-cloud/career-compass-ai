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
    const { targetJob, currentJob, industry, goals, networkingStyle, targetContacts } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `당신은 전문 네트워킹 전략가입니다. 사용자의 경력 목표와 현재 상황을 분석하여 효과적인 네트워킹 전략, 메시지 템플릿, 참여 아이디어를 제공해주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "networkingProfile": {
    "currentStrengths": ["현재 네트워킹 강점 1", "강점 2", "강점 3"],
    "areasToImprove": ["개선 영역 1", "개선 영역 2"],
    "networkingStyle": "추천 네트워킹 스타일",
    "uniqueValue": "네트워크에 제공할 고유 가치"
  },
  "targetAudience": [
    {
      "type": "타겟 유형",
      "description": "설명",
      "whereToFind": ["찾을 수 있는 곳 1", "곳 2"],
      "approachStrategy": "접근 전략",
      "valueExchange": "가치 교환 방법"
    }
  ],
  "messageTemplates": {
    "coldOutreach": {
      "subject": "이메일 제목",
      "message": "첫 연락 메시지 템플릿",
      "followUp": "후속 메시지 템플릿"
    },
    "linkedInConnection": {
      "connectionRequest": "LinkedIn 연결 요청 메시지",
      "afterConnection": "연결 후 메시지"
    },
    "eventFollowUp": {
      "sameDay": "당일 후속 메시지",
      "oneWeekLater": "1주일 후 메시지"
    },
    "referralRequest": "추천 요청 메시지 템플릿"
  },
  "engagementStrategies": [
    {
      "platform": "플랫폼명",
      "frequency": "활동 빈도",
      "actions": ["활동 1", "활동 2", "활동 3"],
      "contentIdeas": ["콘텐츠 아이디어 1", "아이디어 2"],
      "bestPractices": ["모범 사례 1", "사례 2"]
    }
  ],
  "weeklyPlan": {
    "monday": ["할 일 1", "할 일 2"],
    "tuesday": ["할 일 1", "할 일 2"],
    "wednesday": ["할 일 1", "할 일 2"],
    "thursday": ["할 일 1", "할 일 2"],
    "friday": ["할 일 1", "할 일 2"],
    "weekend": ["할 일 1", "할 일 2"]
  },
  "eventStrategy": {
    "typesOfEvents": ["이벤트 유형 1", "유형 2", "유형 3"],
    "preparationTips": ["준비 팁 1", "팁 2", "팁 3"],
    "duringEventTips": ["이벤트 중 팁 1", "팁 2"],
    "followUpProcess": ["후속 프로세스 1", "프로세스 2"]
  },
  "relationshipMaintenance": {
    "frequency": "연락 빈도",
    "touchpointIdeas": ["터치포인트 아이디어 1", "아이디어 2", "아이디어 3"],
    "valueAddingActions": ["가치 추가 행동 1", "행동 2"],
    "trackingMethod": "관계 추적 방법"
  },
  "networkingMistakes": ["피해야 할 실수 1", "실수 2", "실수 3", "실수 4"],
  "thirtyDayPlan": {
    "week1": {
      "focus": "1주차 집중 영역",
      "tasks": ["과제 1", "과제 2", "과제 3"]
    },
    "week2": {
      "focus": "2주차 집중 영역",
      "tasks": ["과제 1", "과제 2", "과제 3"]
    },
    "week3": {
      "focus": "3주차 집중 영역",
      "tasks": ["과제 1", "과제 2", "과제 3"]
    },
    "week4": {
      "focus": "4주차 집중 영역",
      "tasks": ["과제 1", "과제 2", "과제 3"]
    }
  },
  "metrics": {
    "weeklyGoals": {
      "newConnections": 5,
      "meaningfulConversations": 3,
      "contentEngagement": 10,
      "eventsAttended": 1
    },
    "monthlyGoals": {
      "networkGrowth": 20,
      "informationalInterviews": 4,
      "referrals": 2
    }
  }
}`;

    const userPrompt = `다음 정보를 바탕으로 맞춤형 네트워킹 전략을 제안해주세요:

현재 직무: ${currentJob}
목표 직무: ${targetJob}
산업 분야: ${industry}
네트워킹 목표: ${goals}
선호하는 네트워킹 스타일: ${networkingStyle}
타겟 연락처 유형: ${targetContacts}`;

    console.log("Calling Lovable AI Gateway for networking strategy...");
    
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
    console.error("Error in networking-strategy function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
