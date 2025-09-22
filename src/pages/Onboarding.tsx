import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    companyName: "",
    capabilities: "",
    naicsCodes: [] as string[],
    certifications: [] as string[],
    samRegistered: false
  });

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Update the user's profile with all onboarding data
      const { error } = await supabase
        .from("users")
        .update({
          company_name: formData.companyName,
          capabilities: formData.capabilities,
          naics_codes: formData.naicsCodes,
          certifications: formData.certifications,
          sam_data: { registered: formData.samRegistered },
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating user profile:", error);
        throw error;
      }

      toast({
        title: "Profile Complete!",
        description: "Your contractor profile has been set up successfully.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "There was an issue saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNAICSChange = (code: string) => {
    const newCodes = formData.naicsCodes.includes(code)
      ? formData.naicsCodes.filter(c => c !== code)
      : [...formData.naicsCodes, code];
    handleInputChange("naicsCodes", newCodes);
  };

  const handleCertificationChange = (cert: string) => {
    const newCerts = formData.certifications.includes(cert)
      ? formData.certifications.filter(c => c !== cert)
      : [...formData.certifications, cert];
    handleInputChange("certifications", newCerts);
  };

  const commonNAICS = [
    { code: "236220", name: "Commercial and Institutional Building Construction" },
    { code: "541330", name: "Engineering Services" },
    { code: "541511", name: "Custom Computer Programming Services" },
    { code: "541512", name: "Computer Systems Design Services" },
    { code: "561210", name: "Facilities Support Services" },
    { code: "541990", name: "All Other Professional, Scientific, and Technical Services" }
  ];

  const commonCertifications = [
    "8(a) Business Development",
    "HUBZone Certified",
    "Woman-Owned Small Business (WOSB)",
    "Service-Disabled Veteran-Owned",
    "Small Disadvantaged Business",
    "Veteran-Owned Small Business"
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="Enter your company name"
                required
              />
            </div>
            <div>
              <Label htmlFor="capabilities">Core Capabilities</Label>
              <textarea
                id="capabilities"
                className="w-full p-3 border rounded-md resize-none h-32"
                value={formData.capabilities}
                onChange={(e) => handleInputChange("capabilities", e.target.value)}
                placeholder="Describe your company's main capabilities and services..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Your Primary NAICS Codes</Label>
              <p className="text-sm text-gray-600 mb-4">
                Choose the codes that best represent your business services
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {commonNAICS.map((naics) => (
                  <div key={naics.code} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={naics.code}
                      checked={formData.naicsCodes.includes(naics.code)}
                      onChange={() => handleNAICSChange(naics.code)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={naics.code} className="text-sm">
                      <span className="font-medium">{naics.code}</span> - {naics.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Business Certifications</Label>
              <p className="text-sm text-gray-600 mb-4">
                Select any certifications your business holds
              </p>
              <div className="space-y-2">
                {commonCertifications.map((cert) => (
                  <div key={cert} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={cert}
                      checked={formData.certifications.includes(cert)}
                      onChange={() => handleCertificationChange(cert)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={cert} className="text-sm">
                      {cert}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>SAM Registration Status</Label>
              <p className="text-sm text-gray-600 mb-4">
                Are you registered in the System for Award Management (SAM)?
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sam-yes"
                    name="samRegistered"
                    checked={formData.samRegistered === true}
                    onChange={() => handleInputChange("samRegistered", true)}
                  />
                  <label htmlFor="sam-yes" className="text-sm">
                    Yes, I'm registered in SAM
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sam-no"
                    name="samRegistered"
                    checked={formData.samRegistered === false}
                    onChange={() => handleInputChange("samRegistered", false)}
                  />
                  <label htmlFor="sam-no" className="text-sm">
                    No, I need to register
                  </label>
                </div>
              </div>
              {formData.samRegistered === false && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> SAM registration is required for most federal contracts. 
                    You can register at <a href="https://sam.gov" target="_blank" rel="noopener noreferrer" className="underline">sam.gov</a>
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Company Information";
      case 2: return "NAICS Codes";
      case 3: return "Certifications";
      case 4: return "SAM Registration";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
            <span className="ml-2 text-3xl font-bold text-gray-900">BidSync</span>
          </div>
          <p className="text-gray-600">Let's set up your contractor profile</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>{getStepTitle()}</CardTitle>
                <CardDescription>
                  Step {currentStep} of {totalSteps}
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
          </CardHeader>
          
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Button onClick={handleNext} disabled={isSubmitting}>
                {currentStep === totalSteps ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Complete Setup"}
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
