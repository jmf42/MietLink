import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { ScoreDisplay } from "@/components/ui/score-display";
import { TrustBadges } from "@/components/ui/trust-badges";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Home,
  ArrowLeft,
  Check,
  Upload,
  FileText,
  CreditCard,
  User,
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar,
  ExternalLink,
  Lightbulb,
  Star
} from "lucide-react";
import { z } from "zod";

interface DocumentWizardProps {
  params: {
    slug: string;
  };
}

const coverLetterSchema = z.object({
  coverLetter: z.string().min(50, "Motivationsschreiben muss mindestens 50 Zeichen lang sein"),
});

type CoverLetterFormData = z.infer<typeof coverLetterSchema>;

const documentTypes = [
  {
    id: "id",
    name: "Ausweis",
    description: "Schweizer ID oder Ausländerausweis",
    icon: User,
    required: true,
    accept: "image/*,.pdf"
  },
  {
    id: "permit",
    name: "Aufenthaltsbewilligung",
    description: "Für Nicht-Schweizer Bürger",
    icon: Shield,
    required: false,
    accept: "image/*,.pdf"
  },
  {
    id: "debt_extract",
    name: "Betreibungsauszug",
    description: "Direkt vom Kanton beziehen",
    icon: FileText,
    required: true,
    accept: "image/*,.pdf",
    hasLink: true
  },
  {
    id: "income",
    name: "Einkommensnachweis",
    description: "Lohnausweis oder Arbeitsvertrag",
    icon: CreditCard,
    required: true,
    accept: "image/*,.pdf"
  }
];

export default function DocumentWizard({ params }: DocumentWizardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { slug } = params;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, any>>({});
  const [candidateScore, setCandidateScore] = useState(0);
  const [scoreReason, setScoreReason] = useState("");
  const [candidateStatus, setCandidateStatus] = useState<"green" | "yellow" | "incomplete">("incomplete");

  const form = useForm<CoverLetterFormData>({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      coverLetter: "",
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Sie müssen sich anmelden, um sich zu bewerben.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch property data
  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ["/api/properties", slug],
    enabled: !!slug,
  });

  // Fetch user documents
  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ["/api/documents/my"],
    enabled: isAuthenticated,
  });

  // Check if candidate already exists
  const { data: existingCandidate } = useQuery({
    queryKey: ["/api/candidates", property?.id],
    enabled: !!property?.id && isAuthenticated,
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("type", type);
      formData.append("propertyId", property?.id || "");

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (document) => {
      setUploadedDocuments(prev => ({
        ...prev,
        [document.type]: document
      }));
      refetchDocuments();
      calculateScore();
      toast({
        title: "Dokument hochgeladen",
        description: `${document.filename} wurde erfolgreich validiert.`,
      });
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
        title: "Upload-Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate cover letter mutation
  const generateCoverLetterMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/cover-letter", {
        propertyId: property?.id,
        userInfo: {
          name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email,
          email: user?.email,
        },
        propertyInfo: {
          address: property?.address,
          rent: property?.rentChf,
        },
        language: user?.language || "de",
      });
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue("coverLetter", data.text);
      toast({
        title: "Motivationsschreiben erstellt",
        description: "AI hat ein personalisiertes Schreiben für Sie erstellt.",
      });
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
        description: "Motivationsschreiben konnte nicht erstellt werden.",
        variant: "destructive",
      });
    },
  });

  // Create candidate mutation
  const createCandidateMutation = useMutation({
    mutationFn: async (data: CoverLetterFormData) => {
      const response = await apiRequest("POST", "/api/candidates", {
        propertyId: property?.id,
        coverLetter: data.coverLetter,
        tenantScore: candidateScore,
        status: "dossier_submitted",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bewerbung eingereicht!",
        description: "Ihre Bewerbung wurde erfolgreich eingereicht.",
      });
      setCurrentStep(5); // Move to confirmation step
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
        description: "Bewerbung konnte nicht eingereicht werden.",
        variant: "destructive",
      });
    },
  });

  const calculateScore = () => {
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter(doc => uploadedDocuments[doc.id]?.isValid);
    
    let score = 0;
    let status: "green" | "yellow" | "incomplete" = "incomplete";
    let reason = "";

    if (uploadedRequiredDocs.length === requiredDocs.length) {
      score = 85;
      status = "green";
      reason = "Alle erforderlichen Dokumente hochgeladen und validiert";
    } else if (uploadedRequiredDocs.length > requiredDocs.length / 2) {
      score = 60;
      status = "yellow";
      reason = "Einige Dokumente fehlen noch";
    } else {
      score = 25;
      status = "incomplete";
      reason = "Wichtige Dokumente fehlen";
    }

    setCandidateScore(score);
    setCandidateStatus(status);
    setScoreReason(reason);
  };

  const handleDocumentUpload = async (file: File, type: string) => {
    await uploadDocumentMutation.mutateAsync({ file, type });
  };

  const onSubmit = (data: CoverLetterFormData) => {
    createCandidateMutation.mutate(data);
  };

  const getStepProgress = () => {
    return Math.min((currentStep / 5) * 100, 100);
  };

  const getCantonLink = () => {
    // Simplified for demo - in production, this would determine canton from address
    return "https://www.betreibungsauszug.ch/";
  };

  if (authLoading || propertyLoading) {
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation(`/property/${slug}`)}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-swiss-blue rounded-lg flex items-center justify-center">
                  <Home className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-slate-900">MietLink</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Badge variant="outline">Schritt {currentStep} von 5</Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Progress value={getStepProgress()} className="h-2" />
          <div className="flex justify-between text-xs text-slate-600 mt-2">
            <span>Anmeldung</span>
            <span>Dokumente</span>
            <span>Motivationsschreiben</span>
            <span>Validierung</span>
            <span>Bewerbung</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Willkommen bei Ihrer Bewerbung
              </h1>
              <p className="text-xl text-slate-600 mb-6">
                Bewerben Sie sich für: {property.address}
              </p>
              <TrustBadges variant="detailed" />
            </div>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Sie sind angemeldet als {user?.firstName || user?.email}
                </h2>
                <p className="text-slate-600 mb-6">
                  Ihre Bewerbung wird in weniger als 7 Minuten fertig sein.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setCurrentStep(2)}
                  data-testid="button-start-application"
                >
                  Bewerbung starten
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Document Upload */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Dokumente hochladen
              </h1>
              <p className="text-xl text-slate-600">
                Laden Sie Ihre Dokumente einmalig hoch - für alle zukünftigen Bewerbungen
              </p>
            </div>

            <Tabs defaultValue={documentTypes[0].id} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {documentTypes.map((docType) => (
                  <TabsTrigger 
                    key={docType.id} 
                    value={docType.id}
                    className="flex items-center space-x-2"
                    data-testid={`tab-${docType.id}`}
                  >
                    <docType.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{docType.name}</span>
                    {uploadedDocuments[docType.id]?.isValid && (
                      <Check className="w-3 h-3 text-green-600" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {documentTypes.map((docType) => (
                <TabsContent key={docType.id} value={docType.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <docType.icon className="w-5 h-5" />
                        <span>{docType.name}</span>
                        {docType.required && (
                          <Badge variant="destructive">Erforderlich</Badge>
                        )}
                      </CardTitle>
                      <p className="text-slate-600">{docType.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {docType.hasLink && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-blue-900 mb-1">
                                Betreibungsauszug direkt beziehen
                              </h4>
                              <p className="text-sm text-blue-800 mb-3">
                                Holen Sie Ihren aktuellen Betreibungsauszug direkt vom Kanton.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(getCantonLink(), '_blank')}
                                data-testid="button-canton-link"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Zum Kantonsportal
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {uploadedDocuments[docType.id] ? (
                        <div className={`border-2 rounded-lg p-4 ${
                          uploadedDocuments[docType.id].isValid 
                            ? 'doc-valid' 
                            : 'doc-invalid'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {uploadedDocuments[docType.id].isValid ? (
                                <Check className="w-6 h-6 text-green-600" />
                              ) : (
                                <AlertCircle className="w-6 h-6 text-red-600" />
                              )}
                              <div>
                                <div className="font-medium">
                                  {uploadedDocuments[docType.id].filename}
                                </div>
                                <div className="text-sm text-slate-600">
                                  Vertrauen: {Math.round(uploadedDocuments[docType.id].confidence * 100)}%
                                </div>
                                {uploadedDocuments[docType.id].validationReason && (
                                  <div className="text-sm text-slate-600">
                                    {uploadedDocuments[docType.id].validationReason}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Re-upload logic
                                setUploadedDocuments(prev => {
                                  const newDocs = { ...prev };
                                  delete newDocs[docType.id];
                                  return newDocs;
                                });
                              }}
                              data-testid={`button-reupload-${docType.id}`}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Neu hochladen
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <FileUpload
                          onFileSelect={(file) => handleDocumentUpload(file, docType.id)}
                          accept={docType.accept}
                          disabled={uploadDocumentMutation.isPending}
                          data-testid={`upload-${docType.id}`}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
                data-testid="button-back-step"
              >
                Zurück
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!uploadedDocuments.id || !uploadedDocuments.debt_extract || !uploadedDocuments.income}
                data-testid="button-next-step"
              >
                Weiter
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Cover Letter */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Motivationsschreiben
              </h1>
              <p className="text-xl text-slate-600">
                Erstellen Sie ein persönliches Schreiben für den Vermieter
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Ihr Motivationsschreiben</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => generateCoverLetterMutation.mutate()}
                          disabled={generateCoverLetterMutation.isPending}
                          data-testid="button-generate-cover-letter"
                        >
                          {generateCoverLetterMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Star className="w-4 h-4 mr-2" />
                          )}
                          AI-Schreiben generieren
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="coverLetter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Motivationsschreiben (150-300 Wörter)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Schreiben Sie hier Ihr persönliches Motivationsschreiben..."
                                  className="min-h-[200px]"
                                  {...field}
                                  data-testid="textarea-cover-letter"
                                />
                              </FormControl>
                              <FormMessage />
                              <div className="text-xs text-slate-500">
                                {field.value.length} Zeichen
                              </div>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <div className="flex justify-between">
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setCurrentStep(2)}
                        data-testid="button-back-step"
                      >
                        Zurück
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        disabled={!form.watch("coverLetter") || form.watch("coverLetter").length < 50}
                        data-testid="button-next-step"
                      >
                        Weiter zur Validierung
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>

              <div className="space-y-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-900">💡 Tipps</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-blue-800 space-y-2">
                    <p>• Erwähnen Sie Ihr Einkommen und berufliche Stabilität</p>
                    <p>• Beschreiben Sie Ihren Lebensstil und Ihre Interessen</p>
                    <p>• Erklären Sie, warum Sie diese Wohnung möchten</p>
                    <p>• Bleiben Sie authentisch und persönlich</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Validation & Score */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Dossier-Validierung
              </h1>
              <p className="text-xl text-slate-600">
                Ihr Bewerbungsdossier wird validiert und bewertet
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <ScoreDisplay
                  score={candidateScore}
                  reason={scoreReason}
                  status={candidateStatus}
                  animated={true}
                  size="lg"
                  data-testid="candidate-score"
                />
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dokument-Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {documentTypes.map((docType) => (
                      <div key={docType.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <docType.icon className="w-4 h-4 text-slate-600" />
                          <span className="text-sm">{docType.name}</span>
                        </div>
                        {uploadedDocuments[docType.id]?.isValid ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Validiert
                          </Badge>
                        ) : uploadedDocuments[docType.id] ? (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Fehlerhaft
                          </Badge>
                        ) : (
                          <Badge variant="outline">Fehlt</Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {candidateStatus === "green" && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 text-green-800">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">
                          Bereit für Einreichung!
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Ihr Dossier erfüllt alle Anforderungen und kann eingereicht werden.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(3)}
                data-testid="button-back-step"
              >
                Zurück
              </Button>
              <Button 
                onClick={() => {
                  form.handleSubmit(onSubmit)();
                }}
                disabled={candidateStatus === "incomplete" || createCandidateMutation.isPending}
                data-testid="button-submit-application"
              >
                {createCandidateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird eingereicht...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Bewerbung einreichen
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                Bewerbung erfolgreich eingereicht!
              </h1>
              <p className="text-xl text-slate-600">
                Ihre Bewerbung für {property.address} wurde übermittelt
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-4">Was passiert als nächstes?</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-swiss-blue rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                        <div>
                          <div className="font-medium text-slate-900">Verarbeitung</div>
                          <div className="text-sm text-slate-600">Ihr Dossier wird vom Vermieter geprüft</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-swiss-blue rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                        <div>
                          <div className="font-medium text-slate-900">Besichtigung</div>
                          <div className="text-sm text-slate-600">Sie erhalten eine Einladung zur Besichtigung</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-swiss-blue rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                        <div>
                          <div className="font-medium text-slate-900">Entscheidung</div>
                          <div className="text-sm text-slate-600">Rückmeldung innerhalb von 7 Tagen</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-4">Ihre Bewerbung</h3>
                    <ScoreDisplay
                      score={candidateScore}
                      reason={scoreReason}
                      status={candidateStatus}
                      size="sm"
                      showDetails={false}
                      data-testid="final-score"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button onClick={() => setLocation("/")} data-testid="button-back-home">
                Zurück zur Startseite
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
