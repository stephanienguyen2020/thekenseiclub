"use client";

import type React from "react";

import { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  HelpCircle,
  Plus,
  Trash2,
  UploadCloud,
  Image as ImageIcon
} from "lucide-react";
import Navbar from "@/components/navbar";
import { AxiosResponse } from "axios";
import { Coin } from "../../types";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";

// Update the component to include the new features with neo-brutalism style without asymmetry
export default function CreateProposalPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [options, setOptions] = useState(["Yes", "No"]);
  const [votingAmount, setVotingAmount] = useState(""); // This seems unused in submission, review if needed
  const [tag, setTag] = useState(""); // Added state for tag
  const [imageFile, setImageFile] = useState<File | null>(null); // Added state for image file
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Added state for image preview
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coin, setCoin] = useState<any>({
    id: "",
    name: "",
    symbol: "",
    logo: "",
    minVotingPower: 0,
    treasury: 0,
    website: "",
    twitter: "",
    telegram: "",
    description: "",
    whitepaper: "",
    communityLinks: [],
  });
  const [loading, setLoading] = useState(false);
  const currentAccount = useCurrentAccount();
  const { id } = useParams();

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Calculate maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      // Fetch coin data
      const coinResponse: AxiosResponse<Coin> = await api.get(`/coin/${id}`);
      setCoin({
        ...coinResponse.data,
        website: "https://example.com",
        twitter: "https://twitter.com/example",
        telegram: "https://t.me/example",
      });
    };

    fetchData();
  }, [id]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount?.address) {
      alert("Please connect your wallet.");
      return;
    }
    if (!imageFile) {
      alert("Please upload a proposal image.");
      return;
    }
    if (!tag.trim()) {
        alert("Please enter a proposal tag.");
        return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("options", JSON.stringify(options)); // Send options as JSON string
    formData.append("createdBy", currentAccount.address);
    formData.append("tokenAddress", String(id)); // coin.id should be the tokenAddress
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("tag", tag);
    formData.append("image", imageFile);

    try {
      // Call the Next.js API route /api/daos
      const response = await fetch("/api/daos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create proposal");
      }

      const result = await response.json();
      console.log("Proposal created:", result);
      alert("Proposal created successfully!");
      // Redirect back to token page
      window.location.href = `/marketplace/${id}`;
    } catch (error) {
      console.error("Error creating proposal:", error);
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0039C6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg border-4 border-black">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-[#c0ff00] border-r-[#c0ff00] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium">Loading proposal form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0039C6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <Navbar isAuthenticated={true} />

        <div className="flex items-center mb-8 mt-4">
          <Link href={`/marketplace/${id}`} className="flex items-center gap-2">
            <div className="bg-[#c0ff00] p-2 rounded-full border-4 border-black">
              <ArrowLeft className="text-black" size={24} />
            </div>
            <div className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold border-4 border-black">
              Back to {coin.symbol}
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 mb-8 border-4 border-black">
          <div className="flex items-center gap-4 mb-8 bg-[#c0ff00] p-4 rounded-xl border-4 border-black">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-black">
              <Image
                src={coin.logo || "/placeholder.svg"}
                width={64}
                height={64}
                alt={coin.name || "Token Logo"}
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-black">
                Create Proposal for {coin.name || "Your Token"}
              </h1>
              <p className="text-black font-bold">
                Create a governance proposal for the {coin.symbol || "Token"} community to vote on
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Image Upload */}
                        <div>
              <label
                htmlFor="imageUpload"
                className="block text-lg font-black text-black mb-2 uppercase"
              >
                Proposal Image
              </label>
              <div className="mt-2 flex justify-center items-center px-6 pt-5 pb-6 border-4 border-black border-dashed rounded-xl bg-gray-50 hover:bg-gray-100">
                <div className="space-y-4 text-center">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Proposal preview" width={200} height={200} className="mx-auto h-48 w-auto object-contain rounded-lg border-2 border-black" />
                  ) : (
                    <ImageIcon className="mx-auto h-32 w-32 text-gray-400" size={48} />
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <label
                      htmlFor="imageUploadInput"
                      className="relative cursor-pointer bg-[#c0ff00] rounded-md font-medium text-black hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#c0ff00] p-2 border-2 border-black"
                    >
                      <span>Upload an image</span>
                      <input id="imageUploadInput" name="imageUpload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg" />
                    </label>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                    {imageFile && <p className="text-sm text-green-600 font-bold">Selected: {imageFile.name}</p>}
                  </div>
                </div>
              </div>
            </div>
            {/* Proposal Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-lg font-black text-black mb-2 uppercase"
              >
                Proposal Title
              </label>
              <input
                type="text"
                id="title"
                className="w-full rounded-xl border-4 border-black p-4 focus:outline-none focus:ring-4 focus:ring-[#c0ff00] text-lg font-bold bg-gray-100"
                placeholder="e.g. Increase Marketing Budget"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Proposal Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-lg font-black text-black mb-2 uppercase"
              >
                Proposal Description
              </label>
              <textarea
                id="description"
                rows={6}
                className="w-full rounded-xl border-4 border-black p-4 focus:outline-none focus:ring-4 focus:ring-[#c0ff00] text-lg font-bold bg-gray-100"
                placeholder="Describe your proposal in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Proposal Tag */}
            <div>
              <label
                htmlFor="tag"
                className="block text-lg font-black text-black mb-2 uppercase"
              >
                Proposal Tag/Category
              </label>
              <input
                type="text"
                id="tag"
                className="w-full rounded-xl border-4 border-black p-4 focus:outline-none focus:ring-4 focus:ring-[#c0ff00] text-lg font-bold bg-gray-100"
                placeholder="e.g. Marketing, Development, Community"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                required
              />
            </div>

            {/* Voting Options */}
            <div className="bg-[#0039C6] p-6 rounded-xl border-4 border-black">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-black text-white uppercase">
                  Voting Options
                </label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="bg-[#c0ff00] text-black px-4 py-2 rounded-xl font-black border-4 border-black flex items-center gap-2 hover:bg-yellow-300 transition-colors"
                >
                  <Plus size={20} /> ADD OPTION
                </button>
              </div>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      className="flex-1 rounded-xl border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#c0ff00] text-lg font-bold bg-white"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="bg-red-500 text-white p-3 rounded-xl border-4 border-black hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={24} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white mt-3 font-bold">
                You need at least 2 voting options.
              </p>
            </div>

            {/* Voting Start Date */}
            <div>
              <label
                htmlFor="start-date"
                className="block text-lg font-black text-black mb-2 uppercase"
              >
                Voting Start Date
              </label>
              <div className="flex items-center gap-3">
                <div className="bg-[#c0ff00] p-3 rounded-xl border-4 border-black">
                  <Calendar size={24} className="text-black" />
                </div>
                <input
                  type="date"
                  id="start-date"
                  className="flex-1 rounded-xl border-4 border-black p-4 focus:outline-none focus:ring-4 focus:ring-[#c0ff00] text-lg font-bold bg-gray-100"
                  min={minDate}
                  max={maxDateStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <p className="text-sm font-bold mt-2 bg-yellow-100 p-2 rounded-lg border-2 border-black inline-block">
                When should voting begin?
              </p>
            </div>

            {/* Voting End Date */}
            <div>
              <label
                htmlFor="end-date"
                className="block text-lg font-black text-black mb-2 uppercase"
              >
                Voting End Date
              </label>
              <div className="flex items-center gap-3">
                <div className="bg-[#c0ff00] p-3 rounded-xl border-4 border-black">
                  <Calendar size={24} className="text-black" />
                </div>
                <input
                  type="date"
                  id="end-date"
                  className="flex-1 rounded-xl border-4 border-black p-4 focus:outline-none focus:ring-4 focus:ring-[#c0ff00] text-lg font-bold bg-gray-100"
                  min={startDate || minDate} // Ensure end date is not before start date
                  max={maxDateStr}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <p className="text-sm font-bold mt-2 bg-yellow-100 p-2 rounded-lg border-2 border-black inline-block">
                Voting period can be between 1 day and 3 months.
              </p>
            </div>

            {/* Voting Power Contribution */}
            <div className="bg-[#0039C6] p-6 rounded-xl border-4 border-black">
              <label
                htmlFor="voting-amount"
                className="block text-lg font-black text-white mb-3 uppercase"
              >
                Your Voting Power Contribution
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  id="voting-amount"
                  className="flex-1 rounded-xl border-4 border-black p-4 focus:outline-none focus:ring-4 focus:ring-[#c0ff00] text-lg font-bold bg-white"
                  placeholder={`Enter amount of ${coin.symbol} tokens`}
                  value={votingAmount}
                  onChange={(e) => setVotingAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <div className="bg-[#c0ff00] px-6 py-4 rounded-xl text-black font-black text-lg border-4 border-black">
                  {coin.symbol}
                </div>
              </div>
              <p className="text-sm text-white mt-3 font-bold">
                Adding tokens increases your voting power. You can add up to
                your full balance.
              </p>
            </div>

            {/* Requirements Info */}
            <div className="bg-yellow-100 p-6 rounded-xl border-4 border-black">
              <div className="flex items-start gap-4">
                <div className="bg-[#0039C6] p-3 rounded-xl border-4 border-black flex-shrink-0">
                  <HelpCircle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-black uppercase mb-3">
                    Proposal Requirements
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-black">
                      <Clock size={20} className="text-[#0039C6]" />
                      <span className="font-bold">
                        You must hold at least{" "}
                        {/* {coin.minVotingPower.toLocaleString() || ""}{" "} */}
                        {coin.symbol} tokens to create a proposal
                      </span>
                    </li>
                    <li className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-black">
                      <Clock size={20} className="text-[#0039C6]" />
                      <span className="font-bold">
                        Proposals must be active for at least 24 hours
                      </span>
                    </li>
                    <li className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-black">
                      <Clock size={20} className="text-[#0039C6]" />
                      <span className="font-bold">
                        Treasury proposals can allocate up to 10% of the
                        treasury ({(coin.treasury / 1000000).toFixed(1)}M{" "}
                        {coin.symbol})
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#c0ff00] text-black px-8 py-4 rounded-xl font-black text-xl border-4 border-black hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:translate-y-[-5px] transition-transform"
                disabled={
                  isSubmitting ||
                  !title.trim() ||
                  !description.trim() ||
                  !tag.trim() ||
                  !startDate ||
                  !endDate ||
                  !imageFile || 
                  options.some(opt => !opt.trim()) // Ensure no empty options
                }
              >
                {isSubmitting ? "CREATING PROPOSAL..." : "CREATE PROPOSAL 🚀"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
