"use client";

export const runtime = "edge";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
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
  UserCheck,
  ArrowRight
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
  const initialStep = parseInt(searchParams.get('step') || '0');
  const subdomain = params.subdomain as string;
  const [step, setStep] = useState(initialStep); 
  const [hasExistingData, setHasExistingData] = useState(false);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const handleTurnstileVerify = (token: string) => setTurnstileToken(token);
  
  const { data: session } = useSession();
  
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
  const [emailExists, setEmailExists] = useState(false);
  const [existingSubdomain, setExistingSubdomain] = useState<string | null>(null);
  const [hasDismissedEmailWarning, setHasDismissedEmailWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkEmail(email: string) {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          setEmailExists(data.exists);
          if (data.exists && data.subdomain) {
            setExistingSubdomain(data.subdomain);
          }
        }
      } catch (e) {}
    }

    // Only auto-fill if we're on the security step and haven't filled it yet
    if (step === 1 && session?.user?.email && !formData.adminEmail && !hasDismissedEmailWarning) {
      setFormData(prev => ({ ...prev, adminEmail: session.user.email as string }));
      checkEmail(session.user.email as string);
    }
  }, [session, step, hasDismissedEmailWarning]); // Added step back to dependencies to trigger on step change

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
          if (data.tenant && data.tenant.onboardingCompleted) {
            setHasExistingData(true);
          }
        }
      } catch (e) {
        console.error("Check existing error:", e);
      }
    }
    if (subdomain && !bypassKey) checkExisting();
  }, [subdomain, bypassKey]);

  const handleInputChange = async (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'adminEmail') {
       setEmailExists(false); 
       if (value.includes('@') && value.includes('.')) {
          const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(value)}`);
          if (res.ok) {
            const data = await res.json();
            // Only update if the value hasn't changed since the request started
            setFormData(current => {
              if (current.adminEmail === value) {
                setEmailExists(data.exists);
              }
              return current;
            });
          }
       }
    }
  };

  const nextStep = async () => {
    if (step === 1 && emailExists) {
      alert("Please use a different email address.");
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (hasExistingData && !showOverwriteWarning) {
      setShowOverwriteWarning(true);
      return;
    }

    setLoading(true);
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Save failed");
      }
      
      alert("Success! Your team dashboard is ready.");
      // Force a hard navigation to clear cache and ensure state is fresh
      window.location.href = `/${subdomain}`;
    } catch (err: any) {
      console.error("Cloud save failed during onboarding", err);
      alert(err.message || "Something went wrong saving your setup. Please try again.");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        
        <AnimatePresence>
          {existingSubdomain && existingSubdomain !== subdomain && step === 1 && !hasDismissedEmailWarning && formData.adminEmail === session?.user?.email && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[40px] p-10 max-w-lg w-full shadow-2xl space-y-8 border border-white/10"
              >
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
                  <UserCheck className="w-10 h-10" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black uppercase italic tracking-tight dark:text-white">Email in Use</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">The email <span className="font-bold text-blue-600">{session?.user?.email}</span> is already associated with the dashboard for <span className="text-blue-600 dark:text-blue-400 font-bold">{existingSubdomain}</span>.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={() => window.location.href = `/${existingSubdomain}`} className="bg-blue-600 hover:bg-blue-700 text-white h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 group">
                    Go to {existingSubdomain} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" onClick={() => setHasDismissedEmailWarning(true)} className="h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    Continue Anyway
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {hasExistingData && !showOverwriteWarning && !existingSubdomain && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[40px] p-10 max-w-lg w-full shadow-2xl space-y-8 border border-white/10"
              >
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
                  <UserCheck className="w-10 h-10" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black uppercase italic tracking-tight dark:text-white">Account Found</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">A dashboard already exists for <span className="text-blue-600 dark:text-blue-400 font-bold">{subdomain}</span>. What would you like to do?</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={() => router.push(`/${subdomain}`)} className="bg-blue-600 hover:bg-blue-700 text-white h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 group">
                    Go to Dashboard <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" onClick={() => setShowOverwriteWarning(true)} className="h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    Reset & Start Over
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showOverwriteWarning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[40px] p-10 max-w-lg w-full shadow-2xl space-y-8 border border-white/10"
              >
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-black uppercase italic tracking-tight dark:text-white">Dangerous Action</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Completing this setup will <span className="text-red-600 font-black uppercase">Permanently Delete</span> all existing data for <span className="font-bold">{subdomain}</span>.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700 text-white h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-red-900/20">
                    Yes, Delete Everything
                  </Button>
                  <Button variant="ghost" onClick={() => setShowOverwriteWarning(false)} className="h-14 rounded-2xl text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    No, Go Back
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-black text-xs">TG</div>
             <span className="font-bold tracking-tight dark:text-white">TeamGoals</span>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${step > i ? 'bg-green-500 text-white shadow-lg shadow-green-100 dark:shadow-green-950/20' : step === i ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-slate-200 dark:shadow-slate-800/20 scale-110' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                {step > i ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${step === i ? 'text-black dark:text-white' : 'text-slate-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <Card className="shadow-2xl border-none overflow-hidden rounded-[32px] bg-white dark:bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardHeader className="text-center pb-8 pt-10">
                <CardTitle className="text-3xl font-black uppercase tracking-tight dark:text-white">{steps[step].title}</CardTitle>
                <CardDescription className="text-slate-500 font-medium dark:text-slate-400">{steps[step].description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 px-10 min-h-[320px]">
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Team / Group Name</Label>
                      <Input 
                        id="companyName" 
                        placeholder="e.g. Empire Sales Group" 
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="h-14 text-xl font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:ring-black dark:focus:ring-white rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Dashboard Theme</Label>
                      <div className="grid grid-cols-2 gap-4">
                         <Button 
                          variant="outline" 
                          onClick={() => handleInputChange('theme', 'realtor')}
                          className={`h-20 rounded-2xl border-2 flex flex-col gap-1 transition-all ${formData.theme === 'realtor' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400'}`}
                         >
                           <span className="font-bold">Real Estate</span>
                         </Button>
                         <Button 
                          variant="outline" 
                          onClick={() => handleInputChange('theme', 'sales')}
                          className={`h-20 rounded-2xl border-2 flex flex-col gap-1 transition-all ${formData.theme === 'sales' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400'}`}
                         >
                           <span className="font-bold">General Sales</span>
                         </Button>
                         <Button 
                          variant="outline" 
                          onClick={() => handleInputChange('theme', 'car_sales')}
                          className={`h-20 rounded-2xl border-2 flex flex-col gap-1 transition-all ${formData.theme === 'car_sales' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-100 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400'}`}
                         >
                           <span className="font-bold">Car Sales</span>
                         </Button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        onClick={() => signIn("google", { callbackUrl: `/${subdomain}/onboarding?step=1` })}
                        className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                      </Button>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-100 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500 font-bold">Or use password</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Admin Email</Label>
                      <Input 
                        id="adminEmail" 
                        type="email"
                        placeholder="admin@example.com" 
                        value={formData.adminEmail}
                        onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                        className="h-14 text-xl font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:ring-black dark:focus:ring-white rounded-2xl"
                      />
                      {emailExists && (
                        <p className="text-xs text-red-500 font-bold">This email is already in use.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Admin Password</Label>
                      <Input 
                        id="adminPassword" 
                        type="password"
                        placeholder="••••••••" 
                        value={formData.adminPassword}
                        onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                        className="h-14 text-xl font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:ring-black dark:focus:ring-white rounded-2xl"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Primary Brand Color</Label>
                      <div className="flex gap-6 items-center bg-slate-50 dark:bg-slate-950 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800">
                        <input 
                          type="color" 
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="w-20 h-20 rounded-2xl cursor-pointer border-4 border-white dark:border-slate-800 shadow-xl"
                        />
                        <div className="flex-1 space-y-1">
                          <p className="text-lg font-black uppercase tracking-tighter dark:text-white">{formData.primaryColor}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Team Logo</Label>
                      <div className="space-y-4">
                        <Input 
                          placeholder="Logo URL (https://...)" 
                          value={formData.logoUrl}
                          onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                          className="h-12 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:ring-black dark:focus:ring-white rounded-xl"
                        />
                        <div className="grid grid-cols-2 gap-3">
                           <Button 
                             variant="outline" 
                             className="h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 border-slate-100 dark:border-slate-800 dark:text-slate-300"
                             onClick={() => alert("Image upload requires Cloudflare R2 or similar. Please provide a URL for now.")}
                           >
                             Upload Image
                           </Button>
                           <Button 
                             variant="outline"
                             className="h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 border-none"
                             onClick={() => {
                               const nameParam = (formData.companyName || "TG").trim().split(' ').map(n => n[0]).join('').substring(0, 2);
                               const cleanColor = (formData.primaryColor || "#2563eb").trim().replace('#', '');
                               const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameParam)}&background=${cleanColor}&color=fff&size=128&bold=true`;
                               handleInputChange('logoUrl', logoUrl);
                             }}
                           >
                             Generate Logo
                           </Button>
                        </div>
                        {formData.logoUrl && (
                          <div className="mt-4 p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 gap-3">
                             <img src={formData.logoUrl} alt="Logo Preview" className="h-20 object-contain shadow-2xl rounded-xl" onError={(e) => (e.currentTarget.style.display = 'none')} />
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="annualGoal" className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Annual Team Volume Goal ($)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400 dark:text-slate-600">$</span>
                        <Input 
                          id="annualGoal" 
                          type="number"
                          value={formData.annualGoal}
                          onChange={(e) => handleInputChange('annualGoal', e.target.value)}
                          className="h-20 pl-12 text-4xl font-black text-blue-600 dark:text-blue-500 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-black dark:focus:ring-white rounded-3xl"
                        />
                      </div>
                    </div>
                    <div className="py-4">
                      <Turnstile onVerify={handleTurnstileVerify} />
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between p-10 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={step === 0}
                  className="flex items-center gap-2 h-12 font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                
                {step < 3 ? (
                  <Button 
                    onClick={nextStep}
                    disabled={step === 0 && !formData.companyName}
                    className="bg-black dark:bg-white text-white dark:text-black px-10 h-14 rounded-2xl flex items-center gap-2 font-bold shadow-xl shadow-slate-200 dark:shadow-black/50 hover:bg-slate-800 dark:hover:bg-slate-100"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={!turnstileToken && !bypassKey}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-12 h-14 rounded-2xl flex items-center gap-3 shadow-xl shadow-blue-200 dark:shadow-blue-900/40 font-black uppercase tracking-wider"
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
