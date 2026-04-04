"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Rocket, Shield, Palette, Building, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    adminPassword: "",
    primaryColor: "#000000",
    annualGoal: "50000000",
  });
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    // In a real SaaS, this would call a /api/setup endpoint
    alert("Creating your professional dashboard instance...");
    router.push("/admin/login");
  };

  const handleDemoData = () => {
    setFormData({
      companyName: "Empire Realty Group",
      subdomain: "empire",
      adminPassword: "demo",
      primaryColor: "#0f172a",
      annualGoal: "75000000",
    });
    setStep(4);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure? This will remove all local configuration and reset the wizard.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const steps = [
    { title: "Identity", icon: Building, description: "Set your group name and URL" },
    { title: "Security", icon: Shield, description: "Secure your admin portal" },
    { title: "Branding", icon: Palette, description: "Customize the look" },
    { title: "Launch", icon: Rocket, description: "Set your initial goals" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Helper Actions */}
        <div className="flex justify-end gap-2 px-4">
          <Button variant="outline" size="sm" onClick={handleDemoData} className="text-xs bg-white">
            Create Demo Information
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-500">
            Remove All Old Information
          </Button>
        </div>

        {/* Progress Stepper */}
        <div className="flex justify-between items-center px-4">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-black text-white' : 'bg-slate-200 text-slate-400'}`}>
                {step > i + 1 ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${step === i + 1 ? 'text-black' : 'text-slate-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <Card className="shadow-2xl border-none overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-black uppercase tracking-tight">{steps[step-1].title}</CardTitle>
                <CardDescription>{steps[step-1].description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 px-8 min-h-[300px]">
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Property Group Name</Label>
                      <Input 
                        id="companyName" 
                        placeholder="e.g. Smith Realty Group" 
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="h-12 text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subdomain">Desired URL</Label>
                      <div className="flex items-center">
                        <Input 
                          id="subdomain" 
                          placeholder="smith" 
                          value={formData.subdomain}
                          onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase())}
                          className="h-12 text-lg rounded-r-none border-r-0"
                        />
                        <div className="h-12 px-4 flex items-center bg-slate-100 border border-slate-200 rounded-r-lg text-slate-500 font-medium">
                          .realtordash.com
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Admin Management Password</Label>
                      <Input 
                        id="adminPassword" 
                        type="password"
                        placeholder="••••••••" 
                        value={formData.adminPassword}
                        onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                        className="h-12 text-lg"
                      />
                      <p className="text-xs text-slate-500">This password will grant access to update the dashboard data.</p>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Primary Brand Color</Label>
                      <div className="flex gap-4 items-center">
                        <input 
                          type="color" 
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="w-16 h-16 rounded-xl cursor-pointer border-none"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-bold uppercase">{formData.primaryColor}</p>
                          <p className="text-xs text-slate-500">This color will be used for your logo and progress bars.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Preview Logo (Initials)</Label>
                      <div className="flex justify-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div 
                          className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-xl"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          {formData.companyName ? formData.companyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LD'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="annualGoal">Annual Team Goal ($)</Label>
                      <Input 
                        id="annualGoal" 
                        type="number"
                        value={formData.annualGoal}
                        onChange={(e) => handleInputChange('annualGoal', e.target.value)}
                        className="h-12 text-2xl font-black text-blue-600"
                      />
                    </div>
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                      <div className="bg-blue-600 p-2 rounded-lg h-fit text-white">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-blue-900">Ready to Launch!</h4>
                        <p className="text-sm text-blue-700">Once you finish, your team dashboard will be live. You can add agents and houses immediately from the admin panel.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between p-8 bg-slate-50/50 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={step === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                
                {step < 4 ? (
                  <Button 
                    onClick={nextStep}
                    disabled={step === 1 && !formData.companyName}
                    className="bg-black text-white px-8 h-12 flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white px-10 h-12 flex items-center gap-2 shadow-lg shadow-green-200"
                  >
                    Create Dashboard <Rocket className="w-4 h-4" />
                  </Button>
                )}
              </CardFooter>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
