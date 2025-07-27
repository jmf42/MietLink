import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, ArrowLeft, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TaskChecklistProps {
  params: {
    propertyId: string;
  };
}

export default function TaskChecklist({ params }: TaskChecklistProps) {
  const { propertyId } = params;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks", propertyId],
    enabled: !!propertyId,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("POST", `/api/tasks/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", propertyId] });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Aufgabe konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const toggleTask = (task: any) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    updateTaskMutation.mutate({ id: task.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-swiss-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-swiss-blue rounded-lg flex items-center justify-center">
                  <Home className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-slate-900">MietLink</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Auszugs-Aufgaben</h1>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-600">Keine Aufgaben vorhanden.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task: any) => (
              <Card key={task.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={() => toggleTask(task)}
                  />
                  <div>
                    <div className="font-medium text-slate-900">{task.title}</div>
                    {task.dueDate && (
                      <div className="text-sm text-slate-600 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(task.dueDate), "dd.MM.yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="text-right">
          <Button onClick={() => setLocation(`/property/${propertyId}/desk`)}>
            Weiter
          </Button>
        </div>
      </div>
    </div>
  );
}
