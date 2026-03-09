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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "파일이 제공되지 않았습니다." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileName = file.name.toLowerCase();
    const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/.test(fileName);
    const isPdf = fileName.endsWith('.pdf');
    const isDocx = fileName.endsWith('.docx') || fileName.endsWith('.doc');

    if (!isImage && !isPdf && !isDocx) {
      return new Response(JSON.stringify({ error: "지원하지 않는 파일 형식입니다. PDF, DOCX, 이미지(JPG/PNG) 파일을 업로드해주세요." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read file as base64 for AI processing
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    let mimeType = file.type || "application/octet-stream";
    if (isPdf) mimeType = "application/pdf";
    else if (isDocx) mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (isImage && !mimeType.startsWith("image/")) mimeType = "image/jpeg";

    const systemPrompt = `당신은 이력서 파싱 전문가입니다. 업로드된 이력서에서 정보를 추출하여 반드시 다음 JSON 형식으로만 응답해주세요. 다른 텍스트 없이 JSON만 반환하세요.

{
  "full_name": "이름",
  "job_title": "현재 직무/직책",
  "target_job": "목표 직무 (추론 가능한 경우)",
  "industry": "산업 분야",
  "experience_years": 경력연수(숫자),
  "skills": ["기술1", "기술2"],
  "education": [{"school": "학교명", "degree": "학위", "major": "전공", "year": "졸업연도"}],
  "work_experience": [{"company": "회사명", "position": "직책", "period": "기간", "description": "업무 설명"}],
  "certifications": ["자격증1", "자격증2"],
  "summary": "이력서 전체 내용 요약 (텍스트)",
  "resume_text": "이력서의 전체 텍스트 내용을 가능한 한 그대로 추출"
}

- 정보가 없는 필드는 null 또는 빈 배열로 설정하세요.
- experience_years는 경력 기간을 계산하여 숫자로 입력하세요.
- industry는 다음 중 가장 적합한 것을 선택하세요: IT/소프트웨어, 금융/은행, 제조업, 의료/헬스케어, 교육, 마케팅/광고, 컨설팅, 미디어/엔터테인먼트, 유통/물류, 기타
- resume_text에는 이력서의 전체 텍스트 내용을 가능한 한 원문 그대로 추출해주세요.`;

    console.log("Parsing resume:", file.name, "type:", mimeType, "size:", file.size);

    // Use Gemini with vision capability for all file types
    const userContent: any[] = [
      {
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64}`,
        },
      },
      {
        type: "text",
        text: "이 이력서의 내용을 분석하여 정보를 추출해주세요.",
      },
    ];

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
          { role: "user", content: userContent },
        ],
        temperature: 0.1,
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
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다." }), {
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
    console.log("AI Response:", content?.substring(0, 300));

    let parsed;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(JSON.stringify({ error: "이력서 파싱에 실패했습니다. 다시 시도해주세요.", rawContent: content }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in parse-resume:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
