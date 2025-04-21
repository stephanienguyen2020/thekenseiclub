"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, HelpCircle, Plus, Trash2 } from "lucide-react"
import Navbar from "@/components/navbar"

// Update the component to include the new features with neo-brutalism style without asymmetry
export default function CreateProposalPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [options, setOptions] = useState(["Yes", "No"])
  const [votingAmount, setVotingAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coin, setCoin] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  // Calculate maximum date (3 months from now)
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateStr = maxDate.toISOString().split("T")[0]

  // Mock data for the coin
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setCoin({
        id: params.id,
        name:
          params.id === "pepe"
            ? "Pepe"
            : params.id === "doge"
              ? "Doge"
              : params.id.charAt(0).toUpperCase() + params.id.slice(1),
        symbol: params.id.toUpperCase(),
        logo:
          params.id === "pepe"
            ? "/happy-frog-on-a-lilypad.png"
            : params.id === "doge"
              ? "/alert-shiba.png"
              : params.id === "shib"
                ? "/stylized-shiba-inu.png"
                : params.id === "wojak"
                  ? "/Distressed-Figure.png"
                  : params.id === "moon"
                    ? "/crescent-moon-silhouette.png"
                    : params.id === "cat"
                      ? "/playful-calico.png"
                      : `/placeholder.svg?height=64&width=64&query=${params.id} logo`,
        price: 0.00000123,
        change24h: 12.5,
        marketCap: 12500000,
        holders: 5432,
        treasury: 5000000,
        minVotingPower: 10000,
      })
      setLoading(false)
    }, 500)
  }, [params.id])

  const handleAddOption = () => {
    // Remove the limit of 5 options
    setOptions([...options, ""])
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options]
      newOptions.splice(index, 1)
      setOptions(newOptions)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      // Redirect back to token page
      window.location.href = `/marketplace/${params.id}`
    }, 1500)
  }

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
    )
  }

  return (
    <div className="min-h-screen bg-[#0039C6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <Navbar isAuthenticated={true} />

        <div className="flex items-center mb-8 mt-4">
          <Link href={`/marketplace/${params.id}`} className="flex items-center gap-2">
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
                alt={coin.name}
                className="rounded-full"
              />
            </div>
            <div>
              <h1 className="text-3xl font-black">Create Proposal for {coin.name}</h1>
              <p className="text-black font-bold">
                Create a governance proposal for the {coin.symbol} community to vote on
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Proposal Title */}
            <div>
              <label htmlFor="title" className="block text-lg font-black text-black mb-2 uppercase">
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
              <label htmlFor="description" className="block text-lg font-black text-black mb-2 uppercase">
                Proposal Description
              </label>
              <textarea
                id="description"
                rows={6}
                className="w-full rounded-xl border-4 border-black p-4 focus:outline-none focus:ring-4 focus:ring-[#c0ff00] text-lg font-bold bg-gray-100"
                placeholder="Describe your proposal in detail. Include what you're proposing, why it's important, and how it will benefit the community."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Voting Options */}
            <div className="bg-[#0039C6] p-6 rounded-xl border-4 border-black">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-black text-white uppercase">Voting Options</label>
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
                      onChange={(e) => handleOptionChange(index, e.target.value)}
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
              <p className="text-sm text-white mt-3 font-bold">You need at least 2 voting options.</p>
            </div>

            {/* Voting Start Date */}
            <div>
              <label htmlFor="start-date" className="block text-lg font-black text-black mb-2 uppercase">
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
              <label htmlFor="end-date" className="block text-lg font-black text-black mb-2 uppercase">
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
                  min={startDate || minDate}
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
              <label htmlFor="voting-amount" className="block text-lg font-black text-white mb-3 uppercase">
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
                Adding tokens increases your voting power. You can add up to your full balance.
              </p>
            </div>

            {/* Requirements Info */}
            <div className="bg-yellow-100 p-6 rounded-xl border-4 border-black">
              <div className="flex items-start gap-4">
                <div className="bg-[#0039C6] p-3 rounded-xl border-4 border-black flex-shrink-0">
                  <HelpCircle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-black uppercase mb-3">Proposal Requirements</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-black">
                      <Clock size={20} className="text-[#0039C6]" />
                      <span className="font-bold">
                        You must hold at least {coin.minVotingPower.toLocaleString()} {coin.symbol} tokens to create a
                        proposal
                      </span>
                    </li>
                    <li className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-black">
                      <Clock size={20} className="text-[#0039C6]" />
                      <span className="font-bold">Proposals must be active for at least 24 hours</span>
                    </li>
                    <li className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-black">
                      <Clock size={20} className="text-[#0039C6]" />
                      <span className="font-bold">
                        Treasury proposals can allocate up to 10% of the treasury (
                        {(coin.treasury / 1000000).toFixed(1)}M {coin.symbol})
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
                disabled={isSubmitting || !title || !description || !startDate || !endDate}
              >
                {isSubmitting ? "CREATING PROPOSAL..." : "CREATE PROPOSAL 🚀"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
