"use client";

import { signIn } from "next-auth/react";
import { Shield, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MasterLogin() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-slate-900 border-slate-800 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
            <Shield className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black text-white uppercase tracking-tight">Master Login</CardTitle>
          <CardDescription className="text-slate-400">Restricted access for platform administrators.</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10 space-y-6">
          <Button 
            onClick={() => signIn("google", { callbackUrl: "/master" })} 
            className="w-full bg-white hover:bg-slate-100 text-slate-900 h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </Button>
          
          <div className="relative">
             <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-800"></span></div>
             <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500 font-bold">Internal Only</span></div>
          </div>

          <Button 
            variant="ghost" 
            onClick={() => signIn()}
            className="w-full text-slate-500 hover:text-white font-bold uppercase text-[10px] tracking-widest"
          >
            Admin Credentials <Lock className="w-3 h-3 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
