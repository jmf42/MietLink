import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/ui/trust-badges";
import { LanguageSelector } from "@/components/ui/language-selector";
import { type Property } from "@shared/schema";
import { 
  Home,
  MapPin,
  Euro,
  Key,
  Calendar,
  Shield,
  Lock,
  Globe,
  ArrowRight,
  Check
} from "lucide-react";

interface PropertyIntroProps {
  params: {
    slug: string;
  };
}

export default function PropertyIntro({ params }: PropertyIntroProps) {
  const [, setLocation] = useLocation();
  const { slug } = params;

  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: ["/api/properties", slug],
  });

  const handleStartApplication = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-swiss-blue"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Inserat nicht gefunden</h1>
            <p className="text-slate-600 mb-6">
              Das gesuchte Wohnungsinserat existiert nicht oder wurde entfernt.
            </p>
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
              <div className="hidden md:block">
                <LanguageSelector />
              </div>
              <Button variant="ghost" onClick={() => window.location.href = "/api/login"} data-testid="button-login-nav">
                Anmelden
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Property Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-100 text-green-800">
            <Shield className="w-3 h-3 mr-1" />
            Verifiziertes Inserat
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Wunderschöne Wohnung zu vermieten
          </h1>
          <div className="flex items-center justify-center text-slate-600 mb-2">
            <MapPin className="w-5 h-5 mr-2" />
            <span className="text-lg">{property.address}</span>
          </div>
        </div>

        {/* Property Image */}
        <div className="relative mb-12">
          {property.mainPhotoUrl ? (
            <img
              src={property.mainPhotoUrl}
              alt="Wohnung"
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-slate-200 rounded-2xl flex items-center justify-center">
              <Home className="w-24 h-24 text-slate-400" />
            </div>
          )}
          
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-swiss-blue">CHF {property.rentChf}</div>
              <div className="text-sm text-slate-600">pro Monat</div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Euro className="w-8 h-8 text-swiss-blue mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900 mb-1">CHF {property.rentChf}</div>
              <div className="text-slate-600">Monatliche Miete</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Key className="w-8 h-8 text-swiss-blue mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900 mb-1">{property.keyCount}</div>
              <div className="text-slate-600">Schlüssel</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-swiss-blue mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {new Date(property.earliestExit).toLocaleDateString('de-CH')}
              </div>
              <div className="text-slate-600">Verfügbar ab</div>
            </CardContent>
          </Card>
        </div>

        {/* Application CTA */}
        <Card className="border-2 border-swiss-blue bg-gradient-to-r from-swiss-blue/5 to-blue-50">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Interesse an dieser Wohnung?
            </h2>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Starten Sie Ihre Bewerbung in weniger als 7 Minuten. Unsere AI hilft Ihnen dabei, 
              ein perfektes Dossier zu erstellen, das Vermieter überzeugt.
            </p>
            
            <Button 
              size="lg"
              className="bg-swiss-red hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold mb-6"
              onClick={handleStartApplication}
              data-testid="button-start-application"
            >
              Jetzt bewerben
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>&lt; 7 Min. Bewerbung</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>AI-unterstützt</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Check className="w-4 h-4" />
                <span>Sofort verfügbar</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Section */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Ihre Daten sind sicher
          </h3>
          <div className="flex justify-center items-center space-x-8 text-slate-500">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Swiss-hosted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>E2E verschlüsselt</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>GDPR-konform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
