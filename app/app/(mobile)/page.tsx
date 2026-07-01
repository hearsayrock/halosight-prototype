/**
 * FLUTTER HANDOFF: LoginScreen
 * Route: / (initial route)
 * Widget: StatelessWidget
 * State: none — auth buttons navigate to /accounts (prototype skips real auth)
 * Tokens: --gradient-login, --md-sys-color-brand-coral, --md-sys-color-surface-white,
 *         --md-sys-color-text-primary, --md-sys-color-text-inverse, --md-sys-color-neonindigo, --radius-xl
 * Flutter equivalent: login_page.dart
 */

import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
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
          style={{ objectFit: "contain", height: "auto" }}
        />
      </div>

      {/* Tagline */}
      <div className="text-center mb-12 relative z-10">
        <p className="text-xl font-semibold leading-snug" style={{ color: "var(--md-sys-color-text-primary)" }}>
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
        <Link href="/home" className="block">
          <button
            className="w-full flex items-center justify-center gap-3 h-14 font-semibold text-base transition-opacity active:opacity-80"
            style={{
              background: "var(--md-sys-color-brand-coral)",
              color: "var(--md-sys-color-text-primary)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <Image src="/google-g.svg" alt="" width={20} height={20} />
            Continue with Google
          </button>
        </Link>

        <Link href="/home" className="block">
          <button
            className="w-full flex items-center justify-center gap-3 h-14 font-semibold text-base transition-opacity active:opacity-80"
            style={{
              background: "var(--md-sys-color-surface-white)",
              color: "var(--md-sys-color-text-inverse)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <Image src="/microsoft-logo.svg" alt="" width={20} height={20} />
            Continue with Microsoft
          </button>
        </Link>

        <Link href="/home" className="block">
          <button
            className="w-full flex items-center justify-center gap-3 h-14 font-semibold text-base transition-opacity active:opacity-80"
            style={{
              background: "var(--md-sys-color-surface-white)",
              color: "var(--md-sys-color-text-inverse)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <Image src="/apple-logo.svg" alt="" width={18} height={22} style={{ height: "auto" }} />
            Sign in with Apple
          </button>
        </Link>
      </div>

      {/* Email login */}
      <div className="mt-8 relative z-10">
        <Link
          href="/home"
          className="text-sm font-medium"
          style={{ color: "var(--md-sys-color-neonindigo)" }}
        >
          Log in with Email
        </Link>
      </div>
    </div>
  );
}
