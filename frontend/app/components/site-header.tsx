"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavItem,
  globalStyles,
} from "@/app/components/ui/navigation-menu";
import {
  Search,
  LineChart,
  Swords,
  TrendingUp,
  Users,
  Rocket,
  Target,
  Settings2,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { useWallet } from "../providers/WalletProvider";
import { MetaMaskConnectButton } from "./MetaMaskConnectButton";

// Matrix-style text scramble effect for the logo
class TextScramble {
  el: HTMLElement;
  chars: string;
  queue: Array<{
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
  }>;
  frame: number;
  frameRequest: number;
  resolve: (value: void | PromiseLike<void>) => void;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#₿Ξ◎Ð₳₮";
    this.queue = [];
    this.frame = 0;
    this.frameRequest = 0;
    this.resolve = () => {};
    this.update = this.update.bind(this);
  }

  setText(newText: string) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = "";
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }

    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

const MatrixConnectButton = () => {
  const router = useRouter();
  const { connect, isConnected } = useWallet();
  const [buttonHovered, setButtonHovered] = useState(false);

  const handleConnectClick = async () => {
    try {
      if (!isConnected) {
        await connect();
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      router.push("/dashboard");
    }
  };

  return (
    <button
      onClick={handleConnectClick}
      onMouseEnter={() => setButtonHovered(true)}
      onMouseLeave={() => setButtonHovered(false)}
      className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 ${
        buttonHovered
          ? "bg-sky-400 text-black shadow-[0_0_10px_rgba(56,189,248,0.7)]"
          : "bg-transparent border border-sky-400 text-sky-400"
      }`}
    >
      <div className="flex items-center">
        <Wallet className="mr-2 h-4 w-4" />
        <span>{isConnected ? "DASHBOARD" : "CONNECT"}</span>
      </div>
    </button>
  );
};

// Display wallet connect button or link to dashboard
const WalletButton = () => {
  return <MetaMaskConnectButton />;
};

export function SiteHeader() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const scramblerRef = useRef<TextScramble | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use wagmi account hook
  const { address, isConnected } = useAccount();

  // Use our wallet context
  const { disconnect } = useWallet();

  // Initialize text scramble effect for logo
  useEffect(() => {
    if (logoRef.current && !scramblerRef.current) {
      scramblerRef.current = new TextScramble(logoRef.current);
      setMounted(true);
    }
  }, []);

  // Apply text scramble effect on hover
  const handleLogoHover = () => {
    if (scramblerRef.current) {
      scramblerRef.current.setText("HYPERSONIC");
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Load authentication state and user data from localStorage on component mount
  useEffect(() => {
    // Check if connected via wagmi
    if (isConnected && address) {
      setIsAuthenticated(true);
      setUserAddress(address);
      return;
    }

    // Clear authentication if disconnected
    if (!isConnected) {
      setIsAuthenticated(false);
      setUserAddress(null);
      return;
    }

    // Only check localStorage if wagmi isn't connected
    const savedAuth = localStorage.getItem("isAuthenticated");
    const savedAddress = localStorage.getItem("userAddress");

    if (savedAuth === "true" && savedAddress) {
      setIsAuthenticated(true);
      setUserAddress(savedAddress);
    } else {
      setIsAuthenticated(false);
      setUserAddress(null);
    }
  }, [isConnected, address]);

  const publicMenuItems = useMemo(
    (): NavItem[] => [
      { label: "Marketcap", href: "/marketcap" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Bets", href: "/bets" },
    ],
    []
  );

  // Additional menu items for authenticated users
  const authenticatedMenuItems = useMemo(
    (): NavItem[] => [
      { label: "Launch Tokens", href: "/launch" },
      { label: "Create Bets", href: "/bets/create" },
      { label: "Quick Swap", href: "/dashboard/quick-swap" },
    ],
    []
  );

  // Memoize the combined menu items to prevent recreation on every render
  const menuItems = useMemo(
    () => [
      ...publicMenuItems,
      ...(isAuthenticated ? authenticatedMenuItems : []),
    ],
    [publicMenuItems, authenticatedMenuItems, isAuthenticated]
  );

  return (
    <header className="fixed top-0 z-50 w-full border-b border-sky-400/20 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="w-full px-6 md:px-8 lg:px-12">
        <nav className="flex items-center justify-between h-20">
          {/* Logo - aligned to the left edge of the screen */}
          <div className="flex-shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2"
              onMouseEnter={handleLogoHover}
            >
              <span
                ref={logoRef}
                className="text-2xl font-bold text-sky-400 font-mono"
                style={{ textShadow: "0 0 5px rgba(56,189,248,0.7)" }}
              >
                HYPERSONIC
              </span>
            </Link>
          </div>

          {/* Navigation Links - centered */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            <NavigationMenu items={menuItems} />
          </div>

          {/* Connect Button and Mobile Menu Toggle - aligned to the right edge of the screen */}
          <div className="flex-shrink-0 flex items-center space-x-4">
            <WalletButton />

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white/80 hover:text-white"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#00ff00]/20 bg-black/95 backdrop-blur">
            <nav className="flex flex-col space-y-4 px-2">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-sm transition-colors ${
                    pathname === item.href
                      ? "text-white font-medium"
                      : "text-white/80 hover:text-white hover:glow"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      <style jsx global>{`
        .dud {
          color: #fff;
          opacity: 0.7;
        }
        ${globalStyles}
      `}</style>
    </header>
  );
}

export default SiteHeader;
