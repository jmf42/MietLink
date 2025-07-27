import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPropertySchema } from "@shared/schema";
import { 
  Home,
  ArrowLeft,
  Upload,
  Check,
  Calendar,
  Key,
  Euro,
  MapPin,
  FileText,
  Loader2
} from "lucide-react";
import { z } from "zod";

const propertyFormSchema = insertPropertySchema.extend({
  address: z.string().min(10, "Address must be at least 10 characters"),
  rentChf: z.string().min(1, "Rent is required").transform(val => parseFloat(val)),
  earliestExit: z.string().min(1, "Exit date is required"),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

export default function PropertySetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [contractText, setContractText] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      address: "",
      rentChf: "",
      noticeMonths: 3,
      keyCount: 1,
      earliestExit: "",
    },
  });

  const parseContractMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/ai/parse-contract", { text });
      return response.json();
    },
    onSuccess: (data) => {
      setParsedData(data);
      form.setValue("rentChf", data.rent_chf.toString());
      form.setValue("noticeMonths", data.notice_months);
      form.setValue("keyCount", data.key_count);
      setStep(2);
      toast({
        title: t("setup.contract.parsed"),
        description: t("setup.contract.parsed.description"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: t("setup.parseError") + error.message,
        variant: "destructive",
      });
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const response = await apiRequest("POST", "/api/properties", data);
      return response.json();
    },
    onSuccess: (property) => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties/my"] });
      toast({
        title: t("common.success"),
        description: t("setup.created"),
      });
      setLocation(`/property/${property.id}/desk`);
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: t("setup.createError") + error.message,
        variant: "destructive",
      });
    },
  });

  const handleContractUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContractText(text);
      parseContractMutation.mutate(text);
    };
    reader.readAsText(file);
  };

  const onSubmit = (data: PropertyFormData) => {
    createPropertyMutation.mutate(data);
  };

  const skipToManual = () => {
    setStep(2);
  };

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
                  {t("common.back")}
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-swiss-blue rounded-lg flex items-center justify-center">
                  <Home className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-slate-900">MietLink</span>
              </div>
            </div>
            <Badge variant="outline">
              {t("setup.step")} {step} {t("setup.of")} 3
            </Badge>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {t("setup.title")}
              </h1>
              <p className="text-xl text-slate-600">
                {t("setup.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* AI Upload Option */}
              <Card className="border-2 border-swiss-blue">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-swiss-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="text-white w-8 h-8" />
                  </div>
                  <CardTitle>{t("setup.aiAnalysis")}</CardTitle>
                  <p className="text-slate-600">
                    {t("setup.aiDescription")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUpload
                    onFileSelect={handleContractUpload}
                    accept=".pdf,.txt,.doc,.docx"
                    disabled={parseContractMutation.isPending}
                    data-testid="upload-contract"
                  />
                  {parseContractMutation.isPending && (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>{t("setup.analyzingContract")}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>{t("setup.supportedLanguages")}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Manual Entry Option */}
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-slate-600 w-8 h-8" />
                  </div>
                  <CardTitle>{t("setup.manualEntry")}</CardTitle>
                  <p className="text-slate-600">
                    {t("setup.manualEntryDesc")}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={skipToManual}
                    data-testid="button-manual-entry"
                  >
                    {t("setup.manualEntryButton")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {t("setup.confirmData")}
              </h1>
              <p className="text-xl text-slate-600">
                {t("setup.confirmDataDesc")}
              </p>
            </div>

            {parsedData && (
              <Card className="border-green-200 bg-green-50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-green-800">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">
                      {t("setup.obligationsFound", {
                        count: parsedData.obligations?.length || 0,
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>{t("setup.locationHeading")}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("setup.fullAddress")}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("setup.addressPlaceholder")}
                              {...field}
                              data-testid="input-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rentChf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Euro className="w-4 h-4" />
                              <span>{t("setup.rent")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1200"
                                {...field}
                                data-testid="input-rent"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="keyCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Key className="w-4 h-4" />
                              <span>{t("setup.keyCount")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-keys"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="noticeMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("setup.noticeMonths")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="12"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                data-testid="input-notice-months"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="earliestExit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{t("setup.earliestExit")}</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                data-testid="input-exit-date"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} data-testid="button-back-step">
                    {t("common.back")}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPropertyMutation.isPending}
                    data-testid="button-create-property"
                  >
                    {createPropertyMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("setup.creating")}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {t("setup.createListing")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
