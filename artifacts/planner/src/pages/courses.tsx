import { useState } from "react";
import { useCourses } from "@/hooks/use-courses";
import type { Course } from "@/hooks/use-courses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Plus, Trash2, Award } from "lucide-react";

const STATUS_LABELS: Record<Course["status"], string> = { want: "Quero Iniciar", "in-progress": "Em Andamento", completed: "Concluído" };

export default function Courses() {
  const { courses, addCourse, updateCourse, deleteCourse } = useCourses();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", institution: "", hasCertificate: false, certificateHours: 0, status: "want" as Course["status"], progress: 0 });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addCourse(form);
    setForm({ name: "", description: "", institution: "", hasCertificate: false, certificateHours: 0, status: "want", progress: 0 });
    setOpen(false);
  };

  const renderCourseList = (status: Course["status"]) => {
    const filtered = courses.filter((c) => c.status === status);
    if (filtered.length === 0) return <p className="text-center text-muted-foreground py-8">Nenhum curso aqui ainda ✨</p>;
    return (
      <div className="space-y-3">
        {filtered.map((course) => (
          <Card key={course.id} data-testid={`course-${course.id}`}>
            <CardContent className="py-4 px-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{course.name}</h3>
                  {course.institution && <p className="text-sm text-muted-foreground">{course.institution}</p>}
                  {course.description && <p className="text-xs text-muted-foreground mt-1">{course.description}</p>}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {course.hasCertificate && (
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Award className="h-3 w-3" /> {course.certificateHours}h
                      </Badge>
                    )}
                    {status !== "want" && (
                      <Select value={course.status} onValueChange={(v) => updateCourse(course.id, { status: v as Course["status"] })}>
                        <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="want">Quero Iniciar</SelectItem>
                          <SelectItem value="in-progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  {status === "in-progress" && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progresso</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <input type="range" min="0" max="100" value={course.progress} onChange={(e) => updateCourse(course.id, { progress: parseInt(e.target.value) })} className="w-full accent-primary" />
                    </div>
                  )}
                </div>
                <button onClick={() => deleteCourse(course.id)} className="text-muted-foreground hover:text-destructive ml-2"><Trash2 className="h-4 w-4" /></button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
          <Sparkles className="h-6 w-6" /> Cursos
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" data-testid="button-add-course"><Plus className="h-4 w-4 mr-1" /> Novo Curso</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif italic">Adicionar Curso</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome do curso" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-course-name" />
              <Input placeholder="Instituição" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} data-testid="input-course-institution" />
              <Textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="input-course-description" />
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Course["status"] })}>
                <SelectTrigger data-testid="select-course-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="want">Quero Iniciar</SelectItem>
                  <SelectItem value="in-progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.hasCertificate} onCheckedChange={(c) => setForm({ ...form, hasCertificate: c === true })} id="cert" data-testid="checkbox-certificate" />
                <label htmlFor="cert" className="text-sm">Possui certificado</label>
              </div>
              {form.hasCertificate && (
                <Input type="number" placeholder="Horas do certificado" value={form.certificateHours || ""} onChange={(e) => setForm({ ...form, certificateHours: parseInt(e.target.value) || 0 })} data-testid="input-certificate-hours" />
              )}
              <Button onClick={handleAdd} className="w-full" data-testid="button-save-course">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="in-progress">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="want">Quero ({courses.filter((c) => c.status === "want").length})</TabsTrigger>
          <TabsTrigger value="in-progress">Em Andamento ({courses.filter((c) => c.status === "in-progress").length})</TabsTrigger>
          <TabsTrigger value="completed">Concluídos ({courses.filter((c) => c.status === "completed").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="want" className="mt-4">{renderCourseList("want")}</TabsContent>
        <TabsContent value="in-progress" className="mt-4">{renderCourseList("in-progress")}</TabsContent>
        <TabsContent value="completed" className="mt-4">{renderCourseList("completed")}</TabsContent>
      </Tabs>
    </div>
  );
}
