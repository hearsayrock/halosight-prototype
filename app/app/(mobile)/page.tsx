/**
 * FLUTTER HANDOFF: LoginScreen
 * Route: / (initial route)
 * Widget: StatelessWidget
 * State: none — auth buttons navigate to /accounts (prototype skips real auth)
 * Tokens: --gradient-login, --color-brand-coral, --color-surface-white,
 *         --color-text-primary, --color-text-inverse, --color-brand-purple, --radius-xl
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
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Tagline */}
      <div className="text-center mb-12 relative z-10">
        <p className="text-xl font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>
          Smarter meetings.
          <br />
          Anywhere.
          <br />
          Synced with your{" "}
          <span style={{ color: "var(--color-brand-purple)" }}>CRM</span>.
        </p>
      </div>

      {/* Auth buttons */}
      <div className="w-full flex flex-col gap-3 relative z-10">
        <Link href="/accounts" className="block">
          <button
            className="w-full flex items-center justify-center gap-3 h-14 font-semibold text-base transition-opacity active:opacity-80"
            style={{
              background: "var(--color-brand-coral)",
              color: "var(--color-text-primary)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <Image src="/google-g.svg" alt="" width={20} height={20} />
            Continue with Google
          </button>
        </Link>

        <Link href="/accounts" className="block">
          <button
            className="w-full flex items-center justify-center gap-3 h-14 font-semibold text-base transition-opacity active:opacity-80"
            style={{
              background: "var(--color-surface-white)",
              color: "var(--color-text-inverse)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <Image src="/microsoft-logo.svg" alt="" width={20} height={20} />
            Continue with Microsoft
          </button>
        </Link>

        <Link href="/accounts" className="block">
          <button
            className="w-full flex items-center justify-center gap-3 h-14 font-semibold text-base transition-opacity active:opacity-80"
            style={{
              background: "var(--color-surface-white)",
              color: "var(--color-text-inverse)",
              borderRadius: "var(--radius-xl)",
            }}
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
          className="text-sm font-medium"
          style={{ color: "var(--color-brand-purple)" }}
        >
          Log in with Email
        </Link>
      </div>
    </div>
  );
}
