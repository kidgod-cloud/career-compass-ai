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
    const { currentRoutine, goals, challenges, workStyle, priorityAreas } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating optimized schedule for:', { currentRoutine, goals, workStyle });

    const systemPrompt = `당신은 생산성 전문가이자 시간 관리 코치입니다. 사용자의 현재 루틴을 분석하고 최적화된 일정을 제안합니다.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "analysis": {
    "currentState": "현재 루틴 분석 요약",
    "strengths": ["강점 1", "강점 2"],
    "weaknesses": ["개선점 1", "개선점 2"],
    "timeWasters": ["시간 낭비 요소 1", "시간 낭비 요소 2"],
    "productivityScore": 65
  },
  "optimizedSchedule": {
    "morningRoutine": {
      "timeBlock": "06:00-09:00",
      "activities": [
        {"time": "06:00", "activity": "기상 및 스트레칭", "duration": "15분", "purpose": "목적"},
        {"time": "06:15", "activity": "활동명", "duration": "시간", "purpose": "목적"}
      ]
    },
    "workBlocks": [
      {"timeBlock": "09:00-12:00", "focus": "집중 업무", "tasks": ["과제 1", "과제 2"], "technique": "포모도로 기법"}
    ],
    "breakSchedule": [
      {"time": "10:30", "duration": "15분", "activity": "휴식 활동"}
    ],
    "eveningRoutine": {
      "timeBlock": "18:00-22:00",
      "activities": [
        {"time": "18:00", "activity": "활동명", "duration": "시간", "purpose": "목적"}
      ]
    }
  },
  "weeklyPlan": {
    "monday": {"theme": "주간 테마", "focusAreas": ["집중 영역"]},
    "tuesday": {"theme": "테마", "focusAreas": ["영역"]},
    "wednesday": {"theme": "테마", "focusAreas": ["영역"]},
    "thursday": {"theme": "테마", "focusAreas": ["영역"]},
    "friday": {"theme": "테마", "focusAreas": ["영역"]},
    "saturday": {"theme": "테마", "focusAreas": ["영역"]},
    "sunday": {"theme": "테마", "focusAreas": ["영역"]}
  },
  "productivityTips": [
    {"category": "집중력", "tip": "구체적인 팁", "implementation": "실행 방법"},
    {"category": "에너지 관리", "tip": "팁", "implementation": "방법"}
  ],
  "habitRecommendations": [
    {"habit": "습관명", "frequency": "매일", "bestTime": "추천 시간", "benefit": "효과", "startSmall": "작게 시작하는 방법"}
  ],
  "toolRecommendations": [
    {"tool": "도구명", "purpose": "용도", "howToUse": "사용법"}
  ],
  "energyManagement": {
    "peakHours": ["최고 집중 시간대"],
    "lowEnergyHours": ["에너지 낮은 시간대"],
    "recommendations": ["에너지 관리 제안"]
  },
  "actionPlan": {
    "immediate": ["즉시 실행할 것"],
    "thisWeek": ["이번 주 목표"],
    "thisMonth": ["이번 달 목표"]
  }
}`;

    const userPrompt = `다음 정보를 바탕으로 최적화된 시간 관리 시스템을 제안해주세요:

현재 일상 루틴:
${currentRoutine}

달성하고 싶은 목표:
${goals}

현재 겪고 있는 어려움:
${challenges}

선호하는 업무 스타일: ${workStyle}

우선순위 영역: ${priorityAreas.join(', ')}

사용자의 상황에 맞춤화된 실용적이고 실현 가능한 일정을 제안해주세요.`;

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
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('AI response received:', content.substring(0, 200));

    let scheduleData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scheduleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      scheduleData = { rawContent: content };
    }

    return new Response(JSON.stringify(scheduleData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in optimize-schedule function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
