"use client";

/**
 * FLUTTER HANDOFF: LoginScreen
 * Route: / (initial route)
 * Widget: StatelessWidget
 * State: none — the three sign-in buttons are Button (fill white, size xl, full width) with the brand logo as the icon;
 *        they navigate to /relationships (prototype skips real auth)
 * Tokens: --gradient-login, --md-sys-color-surface-static-white, --md-sys-color-text-on-white,
 *         --md-sys-color-text-primary, --md-sys-color-neonindigo, --radius-full
 * Flutter equivalent: login_page.dart
 */

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  // Prototype: every sign-in option skips real auth.
  const signIn = () => router.push("/relationships");
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden h-full"
      style={{ background: "var(--gradient-login)" }}
    >
      {/* Ambient glow — neon indigo */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, color-mix(in srgb, var(--md-sys-color-neonindigo) 18%, transparent) 0%, transparent 70%)",
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
          background: "radial-gradient(circle, color-mix(in srgb, var(--md-sys-color-brand-coral) 10%, transparent) 0%, transparent 70%)",
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
          style={{ objectFit: "contain", height: "auto" }}
        />
      </div>

      {/* Tagline */}
      <div className="text-center mb-12 relative z-10">
        <p className="text-xl-bold leading-snug" style={{ color: "var(--md-sys-color-text-primary)" }}>
          Smarter meetings.
          <br />
          Anywhere.
          <br />
          Synced with your{" "}
          <span style={{ color: "var(--md-sys-color-neonindigo)" }}>CRM</span>.
        </p>
      </div>

      {/* Auth buttons */}
      <div className="w-full flex flex-col gap-3 relative z-10">
        <Button fill="white" size="xl" fullWidth onClick={signIn} icon={<Image src="/google-g.svg" alt="" width={20} height={20} />}>
          Continue with Google
        </Button>
        <Button fill="white" size="xl" fullWidth onClick={signIn} icon={<Image src="/microsoft-logo.svg" alt="" width={20} height={20} />}>
          Continue with Microsoft
        </Button>
        <Button fill="white" size="xl" fullWidth onClick={signIn} icon={<Image src="/apple-logo.svg" alt="" width={18} height={22} style={{ height: "auto" }} />}>
          Sign in with Apple
        </Button>
      </div>

      {/* Email login — hidden for now, keeping for future use */}
      {/* <div className="mt-8 relative z-10">
        <Link
          href="/relationships"
          className="text-sm font-medium"
          style={{ color: "var(--md-sys-color-neonindigo)" }}
        >
          Log in with Email
        </Link>
      </div> */}
    </div>
  );
}
