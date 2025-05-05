"use client";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  Twitter,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  const handleDisconnect = () => {
    disconnect();
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "My Wallet",
      icon: Wallet,
      href: "/dashboard/wallet",
    },
    {
      title: "Watchlist",
      icon: Star,
      href: "/dashboard/watchlist",
    },
    {
      title: "My Proposals",
      icon: FileText,
      href: "/dashboard/proposals",
    },
    {
      title: "My Tweets",
      icon: Twitter,
      href: "/dashboard/tweets",
    },
    {
      title: "Chat Bot",
      icon: MessageSquare,
      href: "/dashboard/chatbot",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="h-screen bg-[#0039C6] w-64 flex-shrink-0 border-r-4 border-black">
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center gap-3 bg-[#0046F4] p-3 rounded-xl border-4 border-black">
            <div className="w-10 h-10 rounded-full bg-[#c0ff00] flex items-center justify-center border-2 border-black">
              <div className="relative w-8 h-8 overflow-hidden">
                <Image
                  src="/pixel-cool-cat.png"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                  onError={(e) => {
                    // Fallback to a User icon if image fails to load
                    const fallbackIcon = document.createElement("div");
                    fallbackIcon.innerHTML =
                      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                    e.currentTarget.parentNode?.appendChild(fallbackIcon);
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                {currentAccount
                  ? formatAddress(currentAccount.address)
                  : "Not Connected"}
              </div>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl border-4 transition-all ${
                  isActive
                    ? "bg-[#c0ff00] text-black border-black font-bold"
                    : "bg-[#0046F4] text-white border-[#0046F4] hover:border-white"
                }`}
              >
                <item.icon size={20} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 w-64 p-4 border-t-4 border-black">
        <div className="space-y-4 mb-2">
          <button
            onClick={handleDisconnect}
            className="flex items-center justify-center gap-3 p-3 rounded-xl border-4 border-red-500 bg-red-500 text-white w-full hover:border-white transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Disconnect</span>
          </button>
        </div>
      </div>
    </div>
  );
}
