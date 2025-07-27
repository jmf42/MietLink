import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadges } from "@/components/ui/trust-badges";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Home, 
  Upload, 
  Search, 
  Check, 
  Clock,
  Link,
  FileText,
  Calendar,
  Trophy,
  Bot,
  FileCheck,
  Pen,
  CalendarCheck,
  MessageSquare,
  Star,
  User,
  Building,
  Rocket,
  Play,
  Shield,
  Globe,
  Smartphone,
  CreditCard,
  Apple
} from "lucide-react";

export default function Landing() {
  const { t } = useLanguage();
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
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
              <Button variant="ghost" onClick={handleLogin} data-testid="button-login">
                {t("nav.login")}
              </Button>
              <Button onClick={handleGetStarted} data-testid="button-get-started">
                {t("nav.getStarted")}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-blue-50 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  {t("landing.hero.title")}
                  <span className="text-swiss-blue"> {t("landing.hero.subtitle")}</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  {t("landing.hero.description")}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 py-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-swiss-blue">&lt; 5</div>
                  <div className="text-sm text-slate-600">{t("landing.stats.clicks")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-swiss-blue">&lt; 7</div>
                  <div className="text-sm text-slate-600">{t("landing.stats.application")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-swiss-blue">80%</div>
                  <div className="text-sm text-slate-600">{t("landing.stats.acceptance")}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-swiss-red hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold"
                  onClick={handleGetStarted}
                  data-testid="button-list-property"
                >
                  <Upload className="mr-2 w-5 h-5" />
                  {t("landing.cta.listProperty")}
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 px-8 py-4 text-lg font-semibold"
                  onClick={handleGetStarted}
                  data-testid="button-find-property"
                >
                  <Search className="mr-2 w-5 h-5" />
                  {t("landing.cta.findProperty")}
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Check className="text-green-500 w-4 h-4" />
                  <span>{t("landing.trust.noCreditCard")}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <Clock className="text-green-500 w-4 h-4" />
                  <span>{t("landing.trust.readyToUse")}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Modern Swiss apartment interior" 
                className="rounded-2xl shadow-2xl w-full h-auto" 
              />
              <Card className="absolute -bottom-6 -left-6 bg-white p-6 shadow-lg border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="text-green-600 w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{t("landing.card.dossierValidated.title")}</div>
                    <div className="text-sm text-slate-600">{t("landing.card.dossierValidated.description")}</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t("landing.howItWorks.title")}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t("landing.howItWorks.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: Link,
                title: t("landing.howItWorks.step1.title"),
                description: t("landing.howItWorks.step1.description")
              },
              {
                icon: FileText,
                title: t("landing.howItWorks.step2.title"), 
                description: t("landing.howItWorks.step2.description")
              },
              {
                icon: Calendar,
                title: t("landing.howItWorks.step3.title"),
                description: t("landing.howItWorks.step3.description")
              },
              {
                icon: Trophy,
                title: t("landing.howItWorks.step4.title"),
                description: t("landing.howItWorks.step4.description")
              }
            ].map((step, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-swiss-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-700 transition-colors">
                  <step.icon className="text-white w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t("landing.features.title")}
            </h2>
            <p className="text-xl text-slate-600">
              {t("landing.features.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: t("landing.features.parser.title"),
                description: t("landing.features.parser.description"),
                badge: t("landing.features.parser.badge"),
                badgeColor: "purple"
              },
              {
                icon: FileCheck,
                title: t("landing.features.documentWizard.title"),
                description: t("landing.features.documentWizard.description"),
                badge: t("landing.features.documentWizard.badge"),
                badgeColor: "green"
              },
              {
                icon: Pen,
                title: t("landing.features.coverLetterGenerator.title"),
                description: t("landing.features.coverLetterGenerator.description"),
                badge: t("landing.features.coverLetterGenerator.badge"),
                badgeColor: "blue"
              },
              {
                icon: CalendarCheck,
                title: t("landing.features.appointmentBooking.title"),
                description: t("landing.features.appointmentBooking.description"),
                badge: t("landing.features.appointmentBooking.badge"),
                badgeColor: "orange"
              },
              {
                icon: Trophy,
                title: t("landing.features.dossierBundle.title"),
                description: t("landing.features.dossierBundle.description"),
                badge: t("landing.features.dossierBundle.badge"),
                badgeColor: "red"
              },
              {
                icon: MessageSquare,
                title: t("landing.features.decisionFeedback.title"),
                description: t("landing.features.decisionFeedback.description"),
                badge: t("landing.features.decisionFeedback.badge"),
                badgeColor: "indigo"
              }
            ].map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className={`w-12 h-12 bg-${feature.badgeColor}-100 rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className={`text-${feature.badgeColor}-600 w-6 h-6`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-4">{feature.description}</p>
                  <div className={`flex items-center text-sm text-${feature.badgeColor}-600`}>
                    <Check className="mr-2 w-4 h-4" />
                    {feature.badge}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t("landing.pricing.title")}
            </h2>
            <p className="text-xl text-slate-600">
              {t("landing.pricing.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 border-2 border-slate-200">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{t("landing.pricing.basic.title")}</h3>
                  <div className="text-4xl font-bold text-slate-900 mb-2">{t("landing.pricing.basic.price")}</div>
                  <p className="text-slate-600">{t("landing.pricing.basic.subtitle")}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" />
                    <span className="text-slate-700">{t("landing.pricing.basic.feature1")}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" />
                    <span className="text-slate-700">{t("landing.pricing.basic.feature2")}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" />
                    <span className="text-slate-700">{t("landing.pricing.basic.feature3")}</span>
                  </li>
                </ul>
                <Button className="w-full" variant="secondary" data-testid="button-basic-plan">
                  {t("landing.pricing.basic.cta")}
                </Button>
              </CardContent>
            </Card>

            <Card className="p-8 border-2 border-swiss-blue transform scale-105 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-swiss-red">
                {t("landing.pricing.popularBadge")}
              </Badge>
              <CardContent className="p-0 text-white">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2 text-slate-900">{t("landing.pricing.premium.title")}</h3>
                  <div className="text-4xl font-bold mb-2 text-slate-900">CHF 49</div>
                  <p className="text-slate-600">{t("landing.pricing.premium.subtitle")}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" />
                    <span className="text-slate-700">{t("landing.pricing.premium.feature1")}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" />
                    <span className="text-slate-700">{t("landing.pricing.premium.feature2")}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" />
                    <span className="text-slate-700">{t("landing.pricing.premium.feature3")}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" />
                    <span className="text-slate-700">{t("landing.pricing.premium.feature4")}</span>
                  </li>
                </ul>
                <Button className="w-full bg-swiss-blue hover:bg-blue-700" data-testid="button-premium-plan">
                  {t("landing.pricing.premium.cta")}
                </Button>
              </CardContent>
            </Card>

            <Card className="p-8 border-2 border-slate-200">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{t("landing.pricing.regie.title")}</h3>
                  <div className="text-4xl font-bold text-slate-900 mb-2">{t("landing.pricing.regie.price")}</div>
                  <p className="text-slate-600">{t("landing.pricing.regie.subtitle")}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" />
                    <span className="text-slate-700">{t("landing.pricing.regie.feature1")}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" />
                    <span className="text-slate-700">{t("landing.pricing.regie.feature2")}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-3 w-4 h-4" />
                    <span className="text-slate-700">{t("landing.pricing.regie.feature3")}</span>
                  </li>
                </ul>
                <Button className="w-full" variant="secondary" data-testid="button-enterprise-plan">
                  {t("landing.pricing.regie.cta")}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Payment Trust */}
          <div className="text-center mt-12 space-y-4">
            <div className="flex justify-center items-center space-x-8 text-slate-400">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-6 h-6" />
                <span className="font-medium">TWINT</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6" />
                <span className="font-medium">Visa & Mastercard</span>
              </div>
              <div className="flex items-center space-x-2">
                <Apple className="w-6 h-6" />
                <span className="font-medium">Apple Pay</span>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              <Shield className="inline mr-2 w-4 h-4" />
              {t("landing.paymentTrust.description")}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-swiss-blue to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t("landing.ctaSection.title")}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t("landing.ctaSection.description")}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button 
              size="lg"
              className="bg-swiss-red hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold"
              onClick={handleGetStarted}
              data-testid="button-cta-start"
            >
              <Rocket className="mr-2 w-5 h-5" />
              {t("landing.ctaSection.startCta")}
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="border-2 border-white text-white hover:bg-white hover:text-swiss-blue px-8 py-4 text-lg font-semibold"
              data-testid="button-cta-demo"
            >
              <Play className="mr-2 w-5 h-5" />
              {t("landing.ctaSection.demoCta")}
            </Button>
          </div>

          <div className="flex justify-center items-center space-x-8 text-blue-200 text-sm">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{t("landing.ctaSection.readyToUse")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{t("landing.ctaSection.noCreditCard")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>{t("landing.ctaSection.swissHosted")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-swiss-blue rounded-lg flex items-center justify-center">
                  <Home className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold">MietLink</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t("landing.footer.description")}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t("landing.footer.product.title")}</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.product.features")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.product.pricing")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.product.demo")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.product.api")}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t("landing.footer.support.title")}</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.support.helpCenter")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.support.contact")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.support.status")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.support.roadmap")}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t("landing.footer.legal.title")}</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.legal.privacy")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.legal.terms")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.legal.imprint")}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t("landing.footer.legal.cookies")}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              {t("landing.footer.copyright")}
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-slate-400">
                <Globe className="w-4 h-4" />
                <span>{t("landing.footer.hostedInSwitzerland")}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Shield className="w-4 h-4" />
                <span>{t("landing.footer.gdprCompliant")}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
