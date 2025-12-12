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
    const { targetJob, industry, experienceYears, location, currentSalary, skills } = await req.json();

    console.log('Analyzing salary benchmark for:', { targetJob, industry, experienceYears, location });

    const prompt = `당신은 급여 분석 및 협상 전문가입니다. 다음 정보를 바탕으로 상세한 급여 벤치마킹 분석을 제공해주세요.

목표 직무: ${targetJob}
산업군: ${industry}
경력: ${experienceYears}년
위치: ${location}
현재 급여: ${currentSalary || '미제공'}
보유 스킬: ${skills || '미제공'}

다음 형식의 JSON으로 응답해주세요:
{
  "marketAnalysis": {
    "entryLevel": { "min": number, "max": number, "median": number },
    "midLevel": { "min": number, "max": number, "median": number },
    "seniorLevel": { "min": number, "max": number, "median": number },
    "yourRange": { "min": number, "max": number, "recommended": number }
  },
  "salaryFactors": [
    { "factor": "string", "impact": "positive|negative|neutral", "description": "string", "adjustmentPercent": number }
  ],
  "industryComparison": [
    { "industry": "string", "averageSalary": number, "trend": "up|down|stable" }
  ],
  "skillPremiums": [
    { "skill": "string", "premiumPercent": number, "demand": "high|medium|low", "recommendation": "string" }
  ],
  "negotiationStrategy": {
    "targetSalary": number,
    "minimumAcceptable": number,
    "openingAsk": number,
    "keyPoints": ["string"],
    "timingTips": ["string"],
    "commonMistakes": ["string"]
  },
  "negotiationScripts": [
    { "scenario": "string", "script": "string", "tips": ["string"] }
  ],
  "totalCompensation": {
    "basePercent": number,
    "bonusRange": { "min": number, "max": number },
    "equityCommon": boolean,
    "benefits": [{ "type": "string", "value": "string", "negotiable": boolean }]
  },
  "marketTrends": {
    "demandLevel": "high|medium|low",
    "salaryTrend": "increasing|stable|decreasing",
    "trendPercent": number,
    "hotSkills": ["string"],
    "forecast": "string"
  },
  "actionPlan": [
    { "priority": number, "action": "string", "timeline": "string", "expectedImpact": "string" }
  ],
  "additionalTips": ["string"]
}

모든 급여는 한국 원화(만원 단위)로 제공하고, 현실적인 시장 데이터를 기반으로 분석해주세요.`;

    const response = await fetch('https://api.llm.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: '당신은 한국 IT 및 비즈니스 분야의 급여 분석 전문가입니다. 정확한 시장 데이터와 실용적인 협상 전략을 제공합니다.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('AI response received, parsing...');

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse AI response');
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in salary-benchmark function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
