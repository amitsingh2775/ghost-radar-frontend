"use client";

import dynamic from "next/dynamic";
import { LandingPage } from "@/components/ghost/landing-page";

const GhostPulseApp = dynamic(
  () => import("@/components/ghost/ghost-pulse-app").then((mod) => mod.GhostPulseApp),
  { 
    ssr: false,
    loading: () => <LandingPage onEnter={() => {}} isStatic={true} />
  }
);

export default function Home() {
  return (
    <main>
      <GhostPulseApp />

      <div className="hidden" aria-hidden="true">
        <LandingPage onEnter={() => {}} />
      </div>
      
      <noscript>
        <div className="p-10 text-center bg-black text-white font-mono">
          <h1>Ghost-Radar | Local Anonymous Chat & Nearby Strangers Chat</h1>
          <p>Connect with people nearby in a 500m to 3km radius. Bina login ke aas-pass ke logo se chat karein. Secure, E2EE, and zero logs.</p>
        </div>
      </noscript>
    </main>
  );
}