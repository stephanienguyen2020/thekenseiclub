"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  Wallet,
  History,
  Twitter,
  Save,
  MessageCircle,
  Send,
  Facebook,
} from "lucide-react";
import { useSuiWallet } from "@/hooks/useSuiWallet";
import { toast } from "@/hooks/use-toast";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { fetchUserByAddress, updateUserProfile } from "@/app/api/users/route";

export default function SettingsPage() {
  const currentAccount = useCurrentAccount();
  const [avatar, setAvatar] = useState("/pixel-cool-cat.png");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("@username");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingUserData, setFetchingUserData] = useState(true);

  // Fetch user data when component mounts
  useEffect(() => {
    async function fetchUserData() {
      if (currentAccount?.address) {
        setFetchingUserData(true);
        try {
          const userData = await fetchUserByAddress(currentAccount?.address);
          if (userData) {
            setUsername(userData.username || "");
            setEmail(userData.email || "");
            if (userData.profilePictureUrl)
              setAvatar(userData.profilePictureUrl);
            console.log("User data fetched:", userData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // If user doesn't exist yet, that's okay - we can create them later
        } finally {
          setFetchingUserData(false);
        }
      }
    }

    fetchUserData();
  }, [currentAccount?.address]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          // Store the data URL for display
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // TODO: Upload the avatar to a file service and get a URL back
      // For now we just update the local state with the data URL
    }
  };

  const handleSaveProfile = async () => {
    if (!currentAccount?.address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to update your profile.",
        type: "foreground",
      });
      return;
    }

    setLoading(true);
    try {
      const userData = {
        username: username,
        email: email,
        profilePictureUrl: avatar.startsWith("data:") ? undefined : avatar, // Don't send data URLs to API
      };

      // Update the user profile
      await updateUserProfile(currentAccount?.address, userData);

      // Show success message
      setSaveSuccess(true);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        type: "foreground",
      });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        type: "foreground",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl text-white font-bold mb-2">Wallet Settings</h1>
      <p className="text-white mb-8">
        Manage your wallet connection and profile settings for Kensei.
      </p>

      {/* Profile Settings */}
      <div className="bg-[#FFE8D6] rounded-3xl p-6 border-4 border-black mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black bg-[#0046F4]">
              {fetchingUserData ? (
                <div className="flex items-center justify-center h-full w-full bg-gray-200">
                  <div className="animate-pulse">Loading...</div>
                </div>
              ) : (
                <Image
                  src={avatar || "/placeholder.svg"}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  priority
                />
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-[#c0ff00] p-2 rounded-full border-2 border-black cursor-pointer hover:bg-[#a0df00] transition-colors"
            >
              <Upload size={16} className="text-black" />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Profile Settings</h2>
            <div className="mt-4 flex flex-col md:flex-row items-start md:items-end gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={fetchingUserData}
                    placeholder={
                      fetchingUserData ? "Loading..." : "Enter username"
                    }
                    className="bg-white text-black border-2 border-black rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0046F4]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={fetchingUserData}
                    placeholder={
                      fetchingUserData ? "Loading..." : "Enter email"
                    }
                    className="bg-white text-black border-2 border-black rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#0046F4]"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={
                  loading || fetchingUserData || !currentAccount?.address
                }
                className={`bg-[#0046F4] hover:bg-[#0035C0] text-white px-4 py-2 rounded-lg font-bold border-2 border-black flex items-center gap-2 transition-colors ${
                  loading || fetchingUserData || !currentAccount?.address
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
            {saveSuccess && (
              <div className="mt-2 text-green-600 font-medium">
                Profile saved successfully!
              </div>
            )}
            {!currentAccount?.address && (
              <div className="mt-2 text-amber-600 font-medium">
                Please connect your wallet to update your profile.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Token Credits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#DDFFA3] rounded-3xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#0046F4] p-3 rounded-xl border-2 border-black">
              <Wallet size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold">Token Credits</h2>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4 border-2 border-black">
            <div className="text-gray-600 text-sm font-medium">
              Your Token Credits
            </div>
            <div className="text-3xl font-bold">0 $</div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-6 border-2 border-black">
            <div className="text-gray-600 text-sm font-medium">
              Connected Address
            </div>
            <div className="text-sm font-mono break-all">
              0xAddc0142a647aE0C1081d202d35D943C4A5c06d2
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Buy Token Credits</div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Amount in $"
                className="bg-white text-black border-2 border-black rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[#0046F4]"
              />
              <button className="bg-[#0046F4] hover:bg-[#0035C0] text-white px-4 py-2 rounded-lg font-bold border-2 border-black transition-colors">
                Buy Credits
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Withdraw Token Credits</div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Amount in $"
                className="bg-white text-black border-2 border-black rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[#0046F4]"
              />
              <button className="bg-[#0046F4] hover:bg-[#0035C0] text-white px-4 py-2 rounded-lg font-bold border-2 border-black transition-colors">
                Withdraw
              </button>
            </div>
          </div>

          <div>
            <div className="font-medium mb-2">
              Register Twitter Handle for Tokens
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                className="bg-white text-black border-2 border-black rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[#0046F4]"
              />
              <button className="bg-[#0046F4] hover:bg-[#0035C0] text-white px-4 py-2 rounded-lg font-bold border-2 border-black transition-colors">
                Register
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#FFB8D2] rounded-3xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#0046F4] p-3 rounded-xl border-2 border-black">
              <History size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold">Transaction History</h2>
          </div>

          <p className="text-gray-700 mb-4">
            View your recent credit transactions.
          </p>

          <div className="bg-white rounded-xl p-6 flex items-center justify-center h-64 border-2 border-black">
            <p className="text-gray-500">No recent transactions</p>
          </div>
        </div>
      </div>

      {/* Social Connections */}
      <div className="bg-[#B8E1FF] rounded-3xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#0046F4] p-3 rounded-xl border-2 border-black">
            <Twitter size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold">Social Connections</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <h3 className="font-bold text-lg">Connected Accounts</h3>
            <h3 className="font-bold text-lg">Connect New Account</h3>
          </div>

          {/* Twitter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="bg-white rounded-xl p-4 flex items-center justify-between border-2 border-black">
              <div className="flex items-center gap-3">
                <Twitter size={20} className="text-[#1DA1F2]" />
                <span className="text-gray-700 font-medium">Twitter</span>
              </div>
              <button className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">
                Disconnect
              </button>
            </div>
            <button className="bg-[#1DA1F2] hover:bg-[#0d8bd9] text-white px-6 py-3 rounded-xl font-bold w-full flex items-center justify-center gap-3 border-2 border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Twitter size={20} />
              Connect Twitter
            </button>
          </div>

          {/* Discord Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border-2 border-gray-300">
              <div className="flex items-center gap-3">
                <MessageCircle size={20} className="text-gray-400" />
                <span className="text-gray-500 font-medium">Discord</span>
              </div>
              <span className="text-gray-400 text-sm">Not connected</span>
            </div>
            <button className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-xl font-bold w-full flex items-center justify-center gap-3 border-2 border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <MessageCircle size={20} />
              Connect Discord
            </button>
          </div>

          {/* Telegram Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border-2 border-gray-300">
              <div className="flex items-center gap-3">
                <Send size={20} className="text-gray-400" />
                <span className="text-gray-500 font-medium">Telegram</span>
              </div>
              <span className="text-gray-400 text-sm">Not connected</span>
            </div>
            <button className="bg-[#0088cc] hover:bg-[#006699] text-white px-6 py-3 rounded-xl font-bold w-full flex items-center justify-center gap-3 border-2 border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Send size={20} />
              Connect Telegram
            </button>
          </div>

          {/* Facebook Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border-2 border-gray-300">
              <div className="flex items-center gap-3">
                <Facebook size={20} className="text-gray-400" />
                <span className="text-gray-500 font-medium">Facebook</span>
              </div>
              <span className="text-gray-400 text-sm">Not connected</span>
            </div>
            <button className="bg-[#1877F2] hover:bg-[#166FE5] text-white px-6 py-3 rounded-xl font-bold w-full flex items-center justify-center gap-3 border-2 border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Facebook size={20} />
              Connect Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
