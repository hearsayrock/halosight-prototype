/**
 * FLUTTER HANDOFF: LoginScreen
 * Route: / (initial route)
 * Widget: StatelessWidget
 * State: none — auth buttons navigate to /accounts (prototype skips real auth)
 * Tokens: surface/app, action/primary, brand neon indigo, text/primary, radius-xl
 * Flutter equivalent: login_page.dart
 */

import Image from "next/image";
import Link from "next/link";
import PhoneFrame from "@/components/layout/PhoneFrame";

export default function LoginPage() {
  return (
    <PhoneFrame>
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 40%, #1A1E44 0%, #131728 40%, #111420 100%)",
          minHeight: "100%",
        }}
      >
        {/* Ambient glow — neon indigo */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,146,255,0.18) 0%, transparent 70%)",
            top: "5%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        {/* Ambient glow — coral */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,90,0.10) 0%, transparent 70%)",
            bottom: "15%",
            right: "5%",
          }}
        />

        {/* Logo */}
        <div className="mb-8 relative z-10">
          <Image
            src="/logo-white.png"
            alt="Halosight"
            width={220}
            height={60}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Tagline */}
        <div className="text-center mb-12 relative z-10">
          <p className="text-[22px] font-semibold leading-snug" style={{ color: "#F7F8FF" }}>
            Smarter meetings.
            <br />
            Anywhere.
            <br />
            Synced with your{" "}
            <span style={{ color: "#8B92FF" }}>CRM</span>.
          </p>
        </div>

        {/* Auth buttons */}
        <div className="w-full flex flex-col gap-3 relative z-10">
          <Link href="/accounts" className="block">
            <button
              className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl font-semibold text-[16px] transition-opacity active:opacity-80"
              style={{ background: "#FF6B5A", color: "#FFFFFF" }}
            >
              <Image src="/google-g.svg" alt="" width={20} height={20} />
              Continue with Google
            </button>
          </Link>

          <Link href="/accounts" className="block">
            <button
              className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl font-semibold text-[16px] transition-opacity active:opacity-80"
              style={{ background: "#FFFFFF", color: "#111420" }}
            >
              <Image src="/microsoft-logo.svg" alt="" width={20} height={20} />
              Continue with Microsoft
            </button>
          </Link>

          <Link href="/accounts" className="block">
            <button
              className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl font-semibold text-[16px] transition-opacity active:opacity-80"
              style={{ background: "#FFFFFF", color: "#111420" }}
            >
              <Image src="/apple-logo.svg" alt="" width={18} height={22} />
              Sign in with Apple
            </button>
          </Link>
        </div>

        {/* Email login */}
        <div className="mt-8 relative z-10">
          <Link
            href="/accounts"
            className="text-[15px] font-medium"
            style={{ color: "#8B92FF" }}
          >
            Log in with Email
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
