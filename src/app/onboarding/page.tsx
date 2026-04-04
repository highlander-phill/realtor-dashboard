"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Rocket, Shield, Palette, Building, ChevronRight, ChevronLeft, Check, AlertTriangle, X, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingWizard() {
  const [step, setStep] = useState(0); // Start at 0 for Authorization
  const [hasExistingData, setHasExistingData] = useState(false);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [authError, setAuthError] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    adminPassword: "",
    tempPassword: "",
    primaryColor: "#2563eb",
    annualGoal: "50000000",
    theme: "realtor",
  });
  const router = useRouter();

  const steps = [
    { title: "Authorization", description: "Verify your license", icon: Lock },
    { title: "Company", description: "Your property group details", icon: Building },
    { title: "Security", description: "Management access", icon: Shield },
    { title: "Branding", description: "Colors and logo", icon: Palette },
    { title: "Goals", description: "Annual production targets", icon: Rocket },
  ];

  useEffect(() => {
    const savedData = localStorage.getItem("nspg_dashboard_data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.tenant && parsed.tenant.onboardingCompleted) {
          setHasExistingData(true);
        }
      } catch (e) {}
    }
    
    // Auto-detect subdomain from URL
    const host = window.location.hostname;
    if (host.includes('.')) {
      const sub = host.split('.')[0];
      if (sub !== 'www' && sub !== 'team-goals') {
        setFormData(prev => ({ ...prev, subdomain: sub }));
      }
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (field === 'tempPassword') setAuthError("");
  };

  const nextStep = async () => {
    if (step === 0) {
      // In a real app, this would hit /api/master/verify
      // For now, let's assume any password works or handle demo
      if (!formData.tempPassword) {
        setAuthError("Please enter your temporary license password.");
        return;
      }
      setStep(1);
    } else {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (hasExistingData && !showOverwriteWarning) {
      setShowOverwriteWarning(true);
      return;
    }

    const isDemo = formData.subdomain === 'empire' || formData.companyName.toLowerCase().includes('demo');
    
    const updatedData = {
      tenant: {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.companyName,
        subdomain: formData.subdomain,
        primaryColor: formData.primaryColor,
        theme: formData.theme,
        onboardingCompleted: true,
      },
      team: {
        goal: Number(formData.annualGoal),
        ytdProduction: isDemo ? 28450000 : 0,
      },
      agents: isDemo ? [
        {
          id: 'demo-1',
          name: 'Sarah Jenkins',
          goal: 15000000,
          volumeClosed: 8400000,
          volumePending: 4200000,
          listingsVolume: 3500000,
          buyers: 8,
          sellers: 4,
          transactions: [
            { id: 'dt1', agentId: 'demo-1', address: '123 Ocean View Dr', price: 1250000, status: 'Sold', side: 'Seller', date: '2026-02-10' },
            { id: 'dt2', agentId: 'demo-1', address: '789 Canyon Road', price: 850000, status: 'Pending', side: 'Buyer', date: '2026-03-22' },
            { id: 'dt3', agentId: 'demo-1', address: '456 Hilltop Ln', price: 3500000, status: 'Active', side: 'Seller', date: '2026-04-01' },
          ]
        },
        {
          id: 'demo-2',
          name: 'Marcus Thorne',
          goal: 12000000,
          volumeClosed: 12500000,
          volumePending: 2100000,
          listingsVolume: 0,
          buyers: 12,
          sellers: 3,
          transactions: [
            { id: 'dt4', agentId: 'demo-2', address: '456 Skyline Blvd', price: 2100000, status: 'Pending', side: 'Seller', date: '2026-04-01' },
            { id: 'dt5', agentId: 'demo-2', address: '111 Pine St', price: 12500000, status: 'Sold', side: 'Buyer', date: '2026-01-15' },
          ]
        }
      ] : [],
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem("nspg_dashboard_data", JSON.stringify(updatedData));
    
    try {
      await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
    } catch (err) {
      console.error("Cloud save failed during onboarding", err);
    }

    alert("Success! Your team dashboard is ready.");
    router.push("/");
  };

  const handleDemoData = () => {
    setFormData({
      companyName: "Empire Realty Group",
      subdomain: "empire",
      adminPassword: "demo",
      tempPassword: "demo",
      primaryColor: "#0f172a",
      annualGoal: "75000000",
      theme: "realtor",
    });
    setStep(4);
  };

  const handleCancel = () => {
    if (hasExistingData) {
      router.push("/");
    } else {
      alert("Please complete the authorization to use the dashboard.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Overwrite Warning Modal Overlay */}
        <AnimatePresence>
          {showOverwriteWarning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold">Overwrite Existing Data?</h3>
                  <p className="text-slate-500">Completing this setup will replace your current dashboard configuration for {formData.subdomain}.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700 text-white h-12 text-lg font-bold">
                    Yes, Replace Everything
                  </Button>
                  <Button variant="ghost" onClick={() => setShowOverwriteWarning(false)} className="h-12 text-slate-500">
                    Go Back & Review
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper Actions */}
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-xs">TG</div>
             <span className="font-bold tracking-tight">TeamGoals</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDemoData} className="text-xs bg-white border-slate-200">
              Try with Demo Data
            </Button>
            {hasExistingData && (
              <Button variant="ghost" size="sm" onClick={handleCancel} className="text-xs text-slate-400">
                <X className="w-3 h-3 mr-1" /> Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="flex justify-between items-center px-4">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${step > i ? 'bg-green-500 text-white shadow-lg shadow-green-100' : step === i ? 'bg-black text-white shadow-lg shadow-slate-200 scale-110' : 'bg-slate-200 text-slate-400'}`}>
                {step > i ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${step === i ? 'text-black' : 'text-slate-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <Card className="shadow-2xl border-none overflow-hidden rounded-[32px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardHeader className="text-center pb-8 pt-10">
                <CardTitle className="text-3xl font-black uppercase tracking-tight">{steps[step].title}</CardTitle>
                <CardDescription className="text-slate-500 font-medium">{steps[step].description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 px-10 min-h-[320px]">
                {step === 0 && (
                   <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">License Subdomain</Label>
                        <div className="h-12 flex items-center bg-white border border-slate-200 rounded-xl px-4 font-black text-blue-600">
                          {formData.subdomain || 'unknown'}.team-goals.com
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tempPassword" className="text-xs font-bold uppercase tracking-wider text-slate-400">Temporary License Password</Label>
                        <Input 
                          id="tempPassword" 
                          type="password"
                          placeholder="Check your SMS invitation" 
                          value={formData.tempPassword}
                          onChange={(e) => handleInputChange('tempPassword', e.target.value)}
                          className={`h-14 text-xl font-bold border-slate-200 focus:ring-black rounded-2xl ${authError ? 'border-red-500' : ''}`}
                        />
                        {authError && <p className="text-xs text-red-500 font-bold">{authError}</p>}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed text-center">
                      A unique license is required to create a new dashboard. If you don't have a password, please contact the administrator.
                    </p>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-xs font-bold uppercase tracking-wider text-slate-400">Team / Group Name</Label>
                      <Input 
                        id="companyName" 
                        placeholder="e.g. Empire Sales Group" 
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="h-14 text-xl font-bold border-slate-200 focus:ring-black rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Dashboard Theme</Label>
                      <div className="grid grid-cols-2 gap-4">
                         <Button 
                          variant="outline" 
                          onClick={() => handleInputChange('theme', 'realtor')}
                          className={`h-20 rounded-2xl border-2 flex flex-col gap-1 ${formData.theme === 'realtor' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}
                         >
                           <span className="font-bold">Real Estate</span>
                           <span className="text-[10px] text-slate-400">Houses & Closings</span>
                         </Button>
                         <Button 
                          variant="outline" 
                          onClick={() => handleInputChange('theme', 'sales')}
                          className={`h-20 rounded-2xl border-2 flex flex-col gap-1 ${formData.theme === 'sales' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}
                         >
                           <span className="font-bold">General Sales</span>
                           <span className="text-[10px] text-slate-400">Volume & Targets</span>
                         </Button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword" className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Management Password</Label>
                      <Input 
                        id="adminPassword" 
                        type="password"
                        placeholder="••••••••" 
                        value={formData.adminPassword}
                        onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                        className="h-14 text-xl font-bold border-slate-200 focus:ring-black rounded-2xl"
                      />
                      <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        This password will be used to access the management portal for your team.
                      </p>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Brand Identity</Label>
                      <div className="flex gap-6 items-center bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                        <input 
                          type="color" 
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="w-20 h-20 rounded-2xl cursor-pointer border-4 border-white shadow-xl"
                        />
                        <div className="flex-1 space-y-1">
                          <p className="text-lg font-black uppercase tracking-tighter">{formData.primaryColor}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">Choose a color that matches your company branding.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Logo Preview</Label>
                      <div className="flex justify-center p-10 bg-white rounded-[24px] border-2 border-dashed border-slate-200 shadow-inner">
                        <div 
                          className="w-28 h-28 rounded-[24px] flex items-center justify-center text-5xl font-black text-white shadow-2xl transition-all duration-500"
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          {formData.companyName ? formData.companyName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'TG'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="annualGoal" className="text-xs font-bold uppercase tracking-wider text-slate-400">Annual Team Volume Goal ($)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
                        <Input 
                          id="annualGoal" 
                          type="number"
                          value={formData.annualGoal}
                          onChange={(e) => handleInputChange('annualGoal', e.target.value)}
                          className="h-20 pl-12 text-4xl font-black text-blue-600 border-slate-200 focus:ring-black rounded-3xl shadow-lg shadow-blue-50"
                        />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[32px] text-white shadow-xl shadow-blue-200 flex gap-5">
                      <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl h-fit">
                        <Check className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold">Ready to Launch!</h4>
                        <p className="text-sm text-blue-100 leading-relaxed">Your dashboard is authorized and ready to go live at <strong>{formData.subdomain}.team-goals.com</strong>.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between p-10 bg-slate-50/50 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={step === 0}
                  className="flex items-center gap-2 h-12 font-bold text-slate-500 hover:text-black"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                
                {step < 4 ? (
                  <Button 
                    onClick={nextStep}
                    disabled={step === 1 && !formData.companyName}
                    className="bg-black text-white px-10 h-14 rounded-2xl flex items-center gap-2 font-bold shadow-xl shadow-slate-200 hover:scale-105 transition-transform"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-12 h-14 rounded-2xl flex items-center gap-3 shadow-xl shadow-blue-200 font-black uppercase tracking-wider hover:scale-105 transition-all"
                  >
                    Finish & Launch <Rocket className="w-5 h-5" />
                  </Button>
                )}
              </CardFooter>
            </motion.div>
          </AnimatePresence>
        </Card>
        
        <p className="text-center text-slate-400 text-xs font-medium">
          Professional Team Tracking Platform • team-goals.com
        </p>
      </div>
    </div>
  );
}
