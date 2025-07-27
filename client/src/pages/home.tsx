import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/ui/trust-badges";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Home,
  Plus,
  FileText,
  Users,
  Settings,
  LogOut,
  Building,
  Calendar,
  Star,
  Eye,
  Check
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties/my"],
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleNewProperty = () => {
    setLocation("/property-setup");
  };

  const handleDocuments = () => {
    setLocation("/documents");
  };

  const handleAppointments = () => {
    setLocation("/appointments");
  };

  const handleApplications = () => {
    setLocation("/applications");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-swiss-blue rounded-lg flex items-center justify-center">
                  <Home className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-slate-900">MietLink</span>
              </Link>
              <div className="hidden md:block ml-8">
                <TrustBadges />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <LanguageSelector />
              </div>
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
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {t("home.welcome")}, {user?.firstName || 'User'}!
          </h1>
          <p className="text-slate-600">
            {t("home.dashboard.description")}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleNewProperty}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-swiss-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                <Plus className="text-white w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{t("home.newProperty")}</h3>
              <p className="text-sm text-slate-600">{t("home.newProperty.description")}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleDocuments}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="text-green-600 w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{t("home.documents")}</h3>
              <p className="text-sm text-slate-600">{t("home.documents.description")}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleAppointments}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-orange-600 w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{t("home.appointments")}</h3>
              <p className="text-sm text-slate-600">{t("home.appointments.description")}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleApplications}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-600 w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{t("home.applications")}</h3>
              <p className="text-sm text-slate-600">{t("home.applications.description")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Properties Overview */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{t("home.properties")}</h2>
              <Button onClick={handleNewProperty} data-testid="button-new-property">
                <Plus className="w-4 h-4 mr-2" />
                {t("home.newProperty")}
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-2/3 mb-4" />
                      <div className="flex space-x-4">
                        <div className="h-3 bg-slate-200 rounded w-16" />
                        <div className="h-3 bg-slate-200 rounded w-16" />
                        <div className="h-3 bg-slate-200 rounded w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-300">
                <CardContent className="p-12 text-center">
                  <Building className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {t("home.noProperties")}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {t("home.noProperties.description")}
                  </p>
                  <Button onClick={handleNewProperty} data-testid="button-first-property">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("home.createFirst")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {properties.map((property: any) => (
                  <Card key={property.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {property.address}
                          </h3>
                          <p className="text-slate-600">
                            CHF {property.rentChf}/Monat • {property.keyCount} {t("home.property.keys")}
                          </p>
                        </div>
                        <Badge variant={property.closedAt ? "secondary" : "default"}>
                          {property.closedAt ? t("home.property.closed") : t("home.property.active")}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-6 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>0 {t("home.property.applications")}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>0 {t("home.property.views")}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>0 {t("home.property.appointments")}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/property/${property.id}/desk`)}
                            data-testid={`button-view-property-${property.id}`}
                          >
                            {t("home.property.manage")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/property/${property.slug}`, '_blank')}
                            data-testid={`button-share-property-${property.id}`}
                          >
                            {t("home.property.share")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("home.stats.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">{t("home.stats.activeListings")}</span>
                  <span className="font-semibold">{properties.filter((p: any) => !p.closedAt).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t("home.stats.totalApplications")}</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t("home.stats.successRate")}</span>
                  <span className="font-semibold">-</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("home.recentActivity.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">{t("home.recentActivity.noActivity")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">{t("home.tips.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800">
                  {t("home.tips.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
