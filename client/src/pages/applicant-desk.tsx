import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreDisplay } from "@/components/ui/score-display";
import { TrustBadges } from "@/components/ui/trust-badges";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Home,
  ArrowLeft,
  Users,
  Calendar,
  Download,
  Mail,
  Eye,
  Check,
  X,
  Star,
  Clock,
  ExternalLink,
  Share,
  Settings,
  Filter,
  Search,
  TrendingUp,
  Award,
  Loader2,
  QrCode,
  Copy,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ApplicantDeskProps {
  params: {
    propertyId: string;
  };
}

export default function ApplicantDesk({ params }: ApplicantDeskProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { propertyId } = params;
  
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("score");

  // Fetch property data
  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ["/api/properties", propertyId],
  });

  // Fetch candidates
  const { data: candidates = [], isLoading: candidatesLoading, refetch: refetchCandidates } = useQuery({
    queryKey: ["/api/candidates", propertyId],
    enabled: !!propertyId,
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks", propertyId],
    enabled: !!propertyId,
  });

  // Fetch visit slots
  const { data: visitSlots = [] } = useQuery({
    queryKey: ["/api/visit-slots", propertyId],
    enabled: !!propertyId,
  });

  // Generate regie email mutation
  const generateRegieEmailMutation = useMutation({
    mutationFn: async () => {
      const topCandidates = filteredCandidates
        .sort((a, b) => b.tenantScore - a.tenantScore)
        .slice(0, 3);
        
      const response = await apiRequest("POST", "/api/ai/regie-email", {
        candidates: topCandidates,
        language: user?.language || "de",
      });
      return response.json();
    },
    onSuccess: (data) => {
      // In a real application, this would open an email client or send the email
      toast({
        title: "E-Mail generiert",
        description: "E-Mail für Regie wurde erstellt.",
      });
      console.log("Generated email:", data);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Fehler",
        description: "E-Mail konnte nicht generiert werden.",
        variant: "destructive",
      });
    },
  });

  const filteredCandidates = candidates.filter((candidate: any) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "green") return candidate.tenantScore >= 80;
    if (filterStatus === "yellow") return candidate.tenantScore >= 60 && candidate.tenantScore < 80;
    if (filterStatus === "incomplete") return candidate.tenantScore < 60;
    return candidate.status === filterStatus;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === "score") return b.tenantScore - a.tenantScore;
    if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "name") return (a.user?.firstName || "").localeCompare(b.user?.firstName || "");
    return 0;
  });

  const getStatusBadge = (candidate: any) => {
    if (candidate.tenantScore >= 80) {
      return <Badge className="bg-green-100 text-green-800">Grün</Badge>;
    }
    if (candidate.tenantScore >= 60) {
      return <Badge className="bg-orange-100 text-orange-800">Gelb</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Unvollständig</Badge>;
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/property/${property?.slug}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link kopiert",
      description: "Der Bewerbungslink wurde in die Zwischenablage kopiert.",
    });
  };

  const generateQRCode = () => {
    toast({
      title: "QR-Code",
      description: "QR-Code Funktion wird implementiert.",
    });
  };

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-swiss-blue" />
          <p className="text-slate-600">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Inserat nicht gefunden</h1>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-swiss-blue rounded-lg flex items-center justify-center">
                  <Home className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-slate-900">MietLink</span>
              </div>
              <div className="hidden md:block ml-8">
                <TrustBadges />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <div className="flex items-center space-x-2">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                <span className="text-sm text-slate-700">
                  {user?.firstName || user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Property Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {property.address}
              </h1>
              <div className="flex items-center space-x-4 text-slate-600">
                <span>CHF {property.rentChf}/Monat</span>
                <span>•</span>
                <span>{property.keyCount} Schlüssel</span>
                <span>•</span>
                <span>Verfügbar ab {format(new Date(property.earliestExit), 'dd.MM.yyyy', { locale: de })}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={copyShareLink}
                data-testid="button-copy-link"
              >
                <Copy className="w-4 h-4 mr-2" />
                Link kopieren
              </Button>
              <Button
                variant="outline"
                onClick={generateQRCode}
                data-testid="button-qr-code"
              >
                <QrCode className="w-4 h-4 mr-2" />
                QR-Code
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/property/${property.slug}`, '_blank')}
                data-testid="button-preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                Vorschau
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Bewerbungen</p>
                  <p className="text-2xl font-bold text-slate-900">{candidates.length}</p>
                </div>
                <Users className="w-8 h-8 text-swiss-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Grün-Status</p>
                  <p className="text-2xl font-bold text-green-600">
                    {candidates.filter((c: any) => c.tenantScore >= 80).length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Termine</p>
                  <p className="text-2xl font-bold text-slate-900">{visitSlots.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-swiss-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Aufgaben</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {tasks.filter((t: any) => t.status === "completed").length}/{tasks.length}
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="candidates" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="candidates" data-testid="tab-candidates">
              <Users className="w-4 h-4 mr-2" />
              Bewerbungen
            </TabsTrigger>
            <TabsTrigger value="visits" data-testid="tab-visits">
              <Calendar className="w-4 h-4 mr-2" />
              Besichtigungen
            </TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">
              <Check className="w-4 h-4 mr-2" />
              Aufgaben
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="w-4 h-4 mr-2" />
              Einstellungen
            </TabsTrigger>
          </TabsList>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm"
                    data-testid="filter-status"
                  >
                    <option value="all">Alle anzeigen</option>
                    <option value="green">Grün</option>
                    <option value="yellow">Gelb</option>
                    <option value="incomplete">Unvollständig</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-slate-600" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm"
                    data-testid="sort-by"
                  >
                    <option value="score">Nach Score</option>
                    <option value="date">Nach Datum</option>
                    <option value="name">Nach Name</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => generateRegieEmailMutation.mutate()}
                  disabled={sortedCandidates.length === 0 || generateRegieEmailMutation.isPending}
                  data-testid="button-generate-email"
                >
                  {generateRegieEmailMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Regie-E-Mail
                </Button>
                <Button
                  variant="outline"
                  disabled={sortedCandidates.length === 0}
                  data-testid="button-download-dossiers"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Top-3 Download
                </Button>
              </div>
            </div>

            {/* Candidates List */}
            {candidatesLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-swiss-blue" />
                <p className="text-slate-600">Bewerbungen werden geladen...</p>
              </div>
            ) : sortedCandidates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Noch keine Bewerbungen
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Teilen Sie Ihren Bewerbungslink, um qualifizierte Kandidaten zu finden.
                  </p>
                  <Button onClick={copyShareLink} data-testid="button-share-link">
                    <Share className="w-4 h-4 mr-2" />
                    Link teilen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedCandidates.map((candidate: any, index) => (
                  <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                            <span className="font-bold text-slate-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {candidate.user?.firstName && candidate.user?.lastName 
                                ? `${candidate.user.firstName} ${candidate.user.lastName}`
                                : candidate.user?.email || "Unbekannt"
                              }
                            </h3>
                            <p className="text-sm text-slate-600">
                              Eingereicht am {format(new Date(candidate.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              {getStatusBadge(candidate)}
                              {candidate.badgeFlag && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <ScoreDisplay
                            score={candidate.tenantScore}
                            size="sm"
                            showDetails={false}
                            data-testid={`score-${candidate.id}`}
                          />
                          
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-view-${candidate.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ansehen
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Bewerbung von {candidate.user?.firstName || candidate.user?.email}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <ScoreDisplay
                                    score={candidate.tenantScore}
                                    reason={`Score basiert auf vollständigen Dokumenten und Validierung`}
                                    status={candidate.tenantScore >= 80 ? "green" : candidate.tenantScore >= 60 ? "yellow" : "incomplete"}
                                    data-testid={`detailed-score-${candidate.id}`}
                                  />
                                  
                                  {candidate.coverLetter && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Motivationsschreiben</h4>
                                      <div className="bg-slate-50 rounded-lg p-4 text-sm">
                                        {candidate.coverLetter}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-download-${candidate.id}`}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Visit Slots Tab */}
          <TabsContent value="visits" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Besichtigungstermine</h2>
              <Button data-testid="button-add-slot">
                <Calendar className="w-4 h-4 mr-2" />
                Termin hinzufügen
              </Button>
            </div>

            {visitSlots.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Keine Termine geplant
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Erstellen Sie Besichtigungstermine für Ihre Bewerber.
                  </p>
                  <Button data-testid="button-create-first-slot">
                    Ersten Termin erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visitSlots.map((slot: any) => (
                  <Card key={slot.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">
                          {format(new Date(slot.startsAt), 'dd.MM.yyyy', { locale: de })}
                        </div>
                        <Badge variant="outline">
                          {slot.seatsLeft}/{slot.capacity} frei
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        {format(new Date(slot.startsAt), 'HH:mm', { locale: de })} - 
                        {format(new Date(new Date(slot.startsAt).getTime() + slot.durationMin * 60000), 'HH:mm', { locale: de })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Auszugs-Aufgaben</h2>
              <Button data-testid="button-add-task">
                <Check className="w-4 h-4 mr-2" />
                Aufgabe hinzufügen
              </Button>
            </div>

            {tasks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Check className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Keine Aufgaben
                  </h3>
                  <p className="text-slate-600 mb-6">
                    AI kann automatisch Aufgaben aus Ihrem Mietvertrag extrahieren.
                  </p>
                  <Button data-testid="button-generate-tasks">
                    Aufgaben generieren
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {tasks.map((task: any) => (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            task.status === "completed" 
                              ? "bg-green-500 border-green-500" 
                              : "border-slate-300"
                          }`}>
                            {task.status === "completed" && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{task.title}</div>
                            {task.dueDate && (
                              <div className="text-sm text-slate-600">
                                Fällig: {format(new Date(task.dueDate), 'dd.MM.yyyy', { locale: de })}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {task.mandatory && (
                            <Badge variant="destructive">Pflicht</Badge>
                          )}
                          {task.status === "completed" ? (
                            <Badge className="bg-green-100 text-green-800">Erledigt</Badge>
                          ) : (
                            <Badge variant="outline">Offen</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inserat-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Inserat aktiv</div>
                    <div className="text-sm text-slate-600">Bewerbungen werden angenommen</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Bewerbungslink</div>
                    <div className="text-sm text-slate-600">/property/{property.slug}</div>
                  </div>
                  <Button variant="outline" onClick={copyShareLink} data-testid="button-copy-settings">
                    <Copy className="w-4 h-4 mr-2" />
                    Kopieren
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Gefahrenzone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium text-slate-900">Inserat schließen</div>
                    <div className="text-sm text-slate-600 mb-3">
                      Das Inserat wird für neue Bewerbungen geschlossen.
                    </div>
                    <Button variant="destructive" data-testid="button-close-listing">
                      Inserat schließen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
