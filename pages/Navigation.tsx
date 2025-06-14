// components/Navigation.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export function Navigation() {
  const router = useRouter();
  const { address } = useAccount();

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/claim", label: "Claim NFT", icon: "🎁" },
    { href: "/stake", label: "Staking", icon: "⚡" },
    { href: "/portfolio", label: "Portfolio", icon: "💼" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">Σ</span>
            </div>
            <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Sigma 369</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`nav-link ${router.pathname === item.href ? "active" : ""}`}>
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Connect Button */}
          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`nav-link text-sm ${router.pathname === item.href ? "active" : ""}`}>
                <div className="flex flex-col items-center">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
