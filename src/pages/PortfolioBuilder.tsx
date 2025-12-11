import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Palette, 
  Loader2, 
  Star, 
  Briefcase, 
  Code, 
  GraduationCap,
  Mail,
  Sparkles,
  User,
  Target,
  Building,
  FileText,
  Lightbulb,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SkillItem {
  name: string;
  level: number;
  description: string;
}

interface SkillCategory {
  name: string;
  items: SkillItem[];
}

interface Project {
  title: string;
  description: string;
  role: string;
  impact: string;
  technologies: string[];
  highlights: string[];
}

interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

interface PortfolioData {
  hero: {
    headline: string;
    tagline: string;
    cta: string;
  };
  about: {
    title: string;
    content: string;
    highlights: string[];
  };
  skills: {
    categories: SkillCategory[];
  };
  projects: Project[];
  experience: Experience[];
  testimonials: Testimonial[];
  contact: {
    headline: string;
    message: string;
    email: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  recommendations: {
    improvements: string[];
    additions: string[];
    designTips: string[];
  };
}

export default function PortfolioBuilder() {
  const [name, setName] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [industry, setIndustry] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState("");
  const [experiences, setExperiences] = useState("");
  const [education, setEducation] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name || !targetJob || !summary) {
      toast({
        title: "입력 오류",
        description: "이름, 목표 직무, 자기소개는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPortfolio(null);

    try {
      const { data, error } = await supabase.functions.invoke("build-portfolio", {
        body: { name, targetJob, industry, summary, skills, projects, experiences, education, contact },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setPortfolio(data.portfolio);
      toast({
        title: "포트폴리오 생성 완료",
        description: "AI가 포트폴리오 콘텐츠를 생성했습니다.",
      });
    } catch (error) {
      console.error("Portfolio build error:", error);
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "포트폴리오 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                대시보드
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">포트폴리오 빌더</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                포트폴리오 정보 입력
              </CardTitle>
              <CardDescription>
                프로젝트와 경험을 입력하면 AI가 전문적인 디지털 포트폴리오 콘텐츠를 생성합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" /> 이름 *
                  </label>
                  <Input
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> 목표 직무 *
                  </label>
                  <Input
                    placeholder="프론트엔드 개발자"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" /> 산업
                  </label>
                  <Input
                    placeholder="IT/소프트웨어"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> 자기소개 *
                </label>
                <Textarea
                  placeholder="본인을 소개하는 내용을 작성해주세요. 전문성, 관심 분야, 목표 등을 포함해주세요."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" /> 기술 스택
                </label>
                <Textarea
                  placeholder="보유한 기술 스택을 나열해주세요 (예: React, TypeScript, Node.js, Python, AWS 등)"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" /> 프로젝트
                </label>
                <Textarea
                  placeholder="진행한 프로젝트들을 설명해주세요. 프로젝트명, 역할, 사용 기술, 성과 등을 포함해주세요."
                  value={projects}
                  onChange={(e) => setProjects(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> 경력 사항
                </label>
                <Textarea
                  placeholder="경력 사항을 작성해주세요. 회사명, 직책, 기간, 주요 업무 등을 포함해주세요."
                  value={experiences}
                  onChange={(e) => setExperiences(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> 학력
                  </label>
                  <Textarea
                    placeholder="학력 사항 (학교, 전공, 졸업년도 등)"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> 연락처
                  </label>
                  <Textarea
                    placeholder="이메일, 링크드인, 깃허브 등"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI가 포트폴리오를 생성하고 있습니다...
                  </>
                ) : (
                  <>
                    <Palette className="w-4 h-4 mr-2" />
                    포트폴리오 생성하기
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {portfolio && (
            <div className="space-y-6">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" /> 미리보기
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> 개선 제안
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-6 mt-6">
                  {/* Hero Section */}
                  <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-8 text-center">
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {portfolio.hero.headline}
                      </h2>
                      <p className="text-lg text-muted-foreground mb-4">
                        {portfolio.hero.tagline}
                      </p>
                      <Button>{portfolio.hero.cta}</Button>
                    </div>
                  </Card>

                  {/* About Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{portfolio.about.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{portfolio.about.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {portfolio.about.highlights.map((highlight, idx) => (
                          <Badge key={idx} variant="secondary">{highlight}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" /> 기술 스택
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {portfolio.skills.categories.map((category, idx) => (
                        <div key={idx}>
                          <h4 className="font-semibold text-foreground mb-3">{category.name}</h4>
                          <div className="space-y-3">
                            {category.items.map((skill, skillIdx) => (
                              <div key={skillIdx}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-foreground">{skill.name}</span>
                                  <span className="text-muted-foreground">{skill.level}%</span>
                                </div>
                                <Progress value={skill.level} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Projects Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5" /> 프로젝트
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {portfolio.projects.map((project, idx) => (
                          <Card key={idx} className="border border-border">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{project.title}</CardTitle>
                              <CardDescription>{project.role}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                              <div className="p-2 bg-primary/5 rounded-lg">
                                <p className="text-sm font-medium text-primary">💡 {project.impact}</p>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {project.technologies.map((tech, techIdx) => (
                                  <Badge key={techIdx} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {project.highlights.map((highlight, hIdx) => (
                                  <li key={hIdx}>• {highlight}</li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Experience Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" /> 경력
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {portfolio.experience.map((exp, idx) => (
                          <div key={idx} className="border-l-2 border-primary/30 pl-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-foreground">{exp.role}</h4>
                                <p className="text-sm text-muted-foreground">{exp.company}</p>
                              </div>
                              <Badge variant="secondary">{exp.period}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{exp.description}</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {exp.achievements.map((achievement, aIdx) => (
                                <li key={aIdx} className="flex items-start gap-2">
                                  <span className="text-primary">✓</span> {achievement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Testimonials */}
                  {portfolio.testimonials.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>추천사</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {portfolio.testimonials.map((testimonial, idx) => (
                            <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm italic text-muted-foreground mb-3">
                                "{testimonial.quote}"
                              </p>
                              <div>
                                <p className="text-sm font-medium text-foreground">{testimonial.author}</p>
                                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Contact Section */}
                  <Card>
                    <CardContent className="text-center py-8">
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {portfolio.contact.headline}
                      </h3>
                      <p className="text-muted-foreground mb-4">{portfolio.contact.message}</p>
                      <Button size="lg">
                        <Mail className="w-4 h-4 mr-2" />
                        {portfolio.contact.email || "연락하기"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* SEO Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">SEO 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">페이지 제목</p>
                        <p className="text-sm text-foreground">{portfolio.seo.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">메타 설명</p>
                        <p className="text-sm text-foreground">{portfolio.seo.description}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">키워드</p>
                        <div className="flex flex-wrap gap-1">
                          {portfolio.seo.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-600">
                        <Lightbulb className="w-5 h-5" /> 개선 제안
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {portfolio.recommendations.improvements.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-amber-600">⚡</span>
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <Sparkles className="w-5 h-5" /> 추가 콘텐츠 제안
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {portfolio.recommendations.additions.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-green-600">+</span>
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-600">
                        <Palette className="w-5 h-5" /> 디자인 팁
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {portfolio.recommendations.designTips.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-purple-600">🎨</span>
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
