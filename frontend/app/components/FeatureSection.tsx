"use client"

import { motion } from "framer-motion"
import { Bot, Zap, Shield, Sparkles, Cpu, Globe } from "lucide-react"

const features = [
  { icon: Bot, title: "Easy Bot Creation", description: "Build complex bots with a simple interface" },
  { icon: Zap, title: "Lightning Fast", description: "Deploy your bots in seconds, not hours" },
  { icon: Shield, title: "Secure & Reliable", description: "Bank-grade security for your Discord community" },
  { icon: Sparkles, title: "AI-Powered", description: "Leverage cutting-edge AI for smarter bots" },
  { icon: Cpu, title: "Advanced Automation", description: "Automate tasks with powerful workflows" },
  { icon: Globe, title: "Global Scaling", description: "Scale your bots to millions of users effortlessly" },
]

export default function FeatureSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
      className="mt-24"
    >
      <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 1.2 }}
          >
            <FeatureCard {...feature} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotateY: 5 }}
      whileTap={{ scale: 0.95 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 p-px group"
    >
      <div className="relative z-10 bg-gray-900 p-8 rounded-xl h-full">
        <div className="mb-4 text-sky-400">
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 ease-in-out" />
      <div className="absolute inset-0 backdrop-blur-xl scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out" />
    </motion.div>
  )
}

