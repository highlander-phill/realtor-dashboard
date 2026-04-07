"use client";

export const runtime = "edge";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
  Lock, 
  Building, 
  Shield, 
  Palette, 
  Rocket, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  X,
  Layout,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Turnstile from "@/components/Turnstile";

function OnboardingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bypassKey = searchParams.get('key');
  const subdomain = params.subdomain as string;
  const [step, setStep] = useState(0); 
  const [hasExistingData, setHasExistingData] = useState(false);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: subdomain || "",
    adminEmail: "",
    adminPassword: "",
    primaryColor: "#2563eb",
    annualGoal: "50000000",
    theme: "realtor",
    logoUrl: "",
  });
  const router = useRouter();

  const steps = [
    { title: "Company", description: "Your property group details", icon: Building },
    { title: "Security", description: "Management access", icon: Shield },
    { title: "Branding", description: "Colors and logo", icon: Palette },
    { title: "Goals", description: "Annual production targets", icon: Rocket },
  ];

  useEffect(() => {
    if (bypassKey === 'setup' || bypassKey === 'master') {
      setStep(0);
    }
  }, [bypassKey]);

  useEffect(() => {
    async function checkExisting() {
      try {
        const res = await fetch(`/api/dashboard?subdomain=${subdomain}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.tenant || !data.tenant.onboardingCompleted) {
            setStep(0);
          } else if (data.tenant.onboardingCompleted) {
            setHasExistingData(true);
          }
        } else {
          setStep(0);
        }
      } catch (e) {
        setStep(0);
      }
    }
    if (subdomain && !bypassKey) checkExisting();
  }, [subdomain, bypassKey]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = async () => {
    setStep(s => s + 1);
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
        subdomain: subdomain, 
        primaryColor: formData.primaryColor,
        theme: formData.theme,
        logoUrl: formData.logoUrl,
        adminPassword: formData.adminPassword,
        adminEmail: formData.adminEmail,
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
          ]
        }
      ] : [],
      lastUpdated: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) throw new Error("Save failed");
      
      alert("Success! Your team dashboard is ready.");
      // Force a hard navigation to clear cache and ensure state is fresh
      window.location.href = `/${subdomain}`;
    } catch (err) {
      console.error("Cloud save failed during onboarding", err);
      alert("Something went wrong saving your setup. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        
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
                  <p className="text-slate-500">Completing this setup will replace your current dashboard configuration for {subdomain}.</p>
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

        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-xs">TG</div>
             <span className="font-bold tracking-tight">TeamGoals</span>
          </div>
          {hasExistingData && (
              <Button variant="ghost" size="sm" onClick={() => router.push(`/${subdomain}`)} className="text-xs text-slate-400">
                <X className="w-3 h-3 mr-1" /> Cancel
              </Button>
          )}
        </div>

        <div className="flex justify-between items-center px-4 overflow-x-auto pb-4">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[70px]">
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
                         </Button>
                         <Button 
                          variant="outline" 
                          onClick={() => handleInputChange('theme', 'sales')}
                          className={`h-20 rounded-2xl border-2 flex flex-col gap-1 ${formData.theme === 'sales' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}
                         >
                           <span className="font-bold">General Sales</span>
                         </Button>
                         <Button 
                          variant="outline" 
                          onClick={() => handleInputChange('theme', 'car_sales')}
                          className={`h-20 rounded-2xl border-2 flex flex-col gap-1 ${formData.theme === 'car_sales' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}
                         >
                           <span className="font-bold">Car Sales</span>
                         </Button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail" className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Email</Label>
                      <Input 
                        id="adminEmail" 
                        type="email"
                        placeholder="admin@example.com" 
                        value={formData.adminEmail}
                        onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                        className="h-14 text-xl font-bold border-slate-200 focus:ring-black rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword" className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Password</Label>
                      <Input 
                        id="adminPassword" 
                        type="password"
                        placeholder="••••••••" 
                        value={formData.adminPassword}
                        onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                        className="h-14 text-xl font-bold border-slate-200 focus:ring-black rounded-2xl"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Brand Color</Label>
                      <div className="flex gap-6 items-center bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                        <input 
                          type="color" 
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="w-20 h-20 rounded-2xl cursor-pointer border-4 border-white shadow-xl"
                        />
                        <div className="flex-1 space-y-1">
                          <p className="text-lg font-black uppercase tracking-tighter">{formData.primaryColor}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Logo</Label>
                      <div className="space-y-4">
                        <Input 
                          placeholder="Logo URL (https://...)" 
                          value={formData.logoUrl}
                          onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                          className="h-12 border-slate-200 focus:ring-black rounded-xl"
                        />
                        <div className="flex gap-2">
                           <Button 
                             variant="outline" 
                             className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest"
                             onClick={() => alert("Image upload requires Cloudflare R2 or similar. Please provide a URL for now.")}
                           >
                             Upload Image
                           </Button>
                           <Button 
                             variant="outline"
                             className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800"
                             onClick={() => handleInputChange('logoUrl', `https://logo.clearbit.com/${formData.companyName.toLowerCase().replace(/\s+/g, '')}.com`)}
                           >
                             Generate from Name
                           </Button>
                        </div>
                        {formData.logoUrl && (
                          <div className="mt-4 p-4 border border-slate-100 rounded-2xl flex items-center justify-center bg-slate-50">
                             <img src={formData.logoUrl} alt="Logo Preview" className="h-16 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="annualGoal" className="text-xs font-bold uppercase tracking-wider text-slate-600">Annual Team Volume Goal ($)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">$</span>
                        <Input 
                          id="annualGoal" 
                          type="number"
                          value={formData.annualGoal}
                          onChange={(e) => handleInputChange('annualGoal', e.target.value)}
                          className="h-20 pl-12 text-4xl font-black text-blue-600 border-slate-300 focus:ring-black rounded-3xl"
                        />
                      </div>
                    </div>
                    <Turnstile onVerify={(token) => setTurnstileToken(token)} />
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between p-10 bg-slate-50/50 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={step === 0}
                  className="flex items-center gap-2 h-12 font-bold text-slate-500"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                
                {step < 3 ? (
                  <Button 
                    onClick={nextStep}
                    disabled={step === 0 && !formData.companyName}
                    className="bg-black text-white px-10 h-14 rounded-2xl flex items-center gap-2 font-bold shadow-xl shadow-slate-200"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-12 h-14 rounded-2xl flex items-center gap-3 shadow-xl shadow-blue-200 font-black uppercase tracking-wider"
                  >
                    Finish & Launch <Rocket className="w-5 h-5" />
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

export default function OnboardingWizard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Setup...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
