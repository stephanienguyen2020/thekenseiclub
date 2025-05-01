"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/navbar";
import {
  ArrowRight,
  Github,
  Linkedin,
  Twitter,
  Sword,
  Users,
  Zap,
  Cpu,
} from "lucide-react";

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Refs for scroll animations
  const missionRef = useRef(null);
  const techRef = useRef(null);
  const foundersRef = useRef(null);

  const missionInView = useInView(missionRef, { once: true, margin: "-100px" });
  const techInView = useInView(techRef, { once: true, margin: "-100px" });
  const foundersInView = useInView(foundersRef, {
    once: true,
    margin: "-100px",
  });

  // Founders data
  const founders = [
    {
      name: "Stephanie Ng.",
      role: "CEO & Founder",
      image: "/Stephanie.jpg",
      bio: "CS @ Columbia | Lead Dev at Blockchain @ Columbia. Degen since 2017",
      twitter: "https://x.com/0g_stephanieng",
      linkedin: "https://www.linkedin.com/in/steph-tien-ng",
    },
    {
      name: "Dylan N.",
      role: "CTO & Co-Founder",
      image: "/Dylan.jpg",
      bio: "CS @ University of Wisconsin-Madison | 2 Years Experience | Blockchain Enthusiast",
      twitter: "https://twitter.com",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
    {
      name: "Dat N.",
      role: "Head of Blockchain Infra",
      image: "/confident-professional.png",
      bio: "Product leader with experience at Coinbase and Uniswap. Crypto native since 2017.",
      twitter: "https://twitter.com",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
    {
      name: "Anh N.",
      role: "Head of Trading",
      image: "/Tien_Anh.jpg",
      bio: "CS @ PTIT | Fullstack Software Engineer | Blockchain Enthusiast",
      twitter: "https://twitter.com",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0039C6] p-4 md:p-8">
      <div className="w-full max-w-8xl mx-auto bg-[#0039C6] rounded-3xl overflow-hidden relative border border-blue-500">
        {/* Navigation */}
        <Navbar isAuthenticated={false} />

        {/* Hero Section */}
        <div className="relative px-6 py-12 md:py-24 overflow-hidden min-h-[400px]">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20">
            {Array(64)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border border-blue-400"></div>
              ))}
          </div>

          {/* Main Heading */}
          <div className="relative z-10 mx-auto text-center">
            <motion.h1
              className="text-white text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              ABOUT
              <br />
              <span className="text-[#c0ff00]">KENSEI</span>
            </motion.h1>

            <motion.p
              className="text-white text-lg md:text-xl mt-6 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Building the SocialFi layer for meme coins on SUI
            </motion.p>
          </div>

          {/* Decorative Elements */}
          <motion.div
            className="absolute top-[20%] right-[10%] z-20 transform rotate-12"
            initial={{ y: -100, opacity: 0, rotate: 20 }}
            animate={{ y: 0, opacity: 1, rotate: 12 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.4,
            }}
          >
            <div className="w-24 h-24 md:w-32 md:h-32 bg-[#c0ff00] rounded-full flex items-center justify-center border-4 border-black">
              <span className="text-black font-black text-2xl md:text-4xl">
                剣聖
              </span>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-[20%] left-[10%] z-20"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.6,
            }}
          >
            <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-lg border-4 border-black transform rotate-12 flex items-center justify-center">
              <span className="text-[#0039C6] font-black text-2xl md:text-4xl transform -rotate-12">
                🥷
              </span>
            </div>
          </motion.div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-t-[48px] p-8 md:p-12">
          {/* About Kensei Section */}
          <section className="mb-16">
            <div className="flex flex-col items-center text-center mb-10">
              <h2 className="text-3xl font-black mb-4 text-black inline-block border-b-4 border-[#c0ff00] pb-2">
                🥷 ABOUT KENSEI
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#c0ff00] rounded-full flex items-center justify-center border-4 border-black z-10">
                  <Sword size={24} className="text-black" />
                </div>
                <div className="bg-[#F5F5F5] rounded-3xl p-6 pt-10 border-4 border-black h-full transform hover:translate-y-[-5px] transition-transform">
                  <h3 className="text-xl font-bold mb-3">The Sword Saint</h3>
                  <p>
                    Kensei (剣聖) is a Japanese title given to legendary
                    warriors who mastered the art of the blade with purpose,
                    discipline, and spirit.
                  </p>
                </div>
              </div>

              <div className="relative mt-8 md:mt-12">
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#0039C6] rounded-full flex items-center justify-center border-4 border-black z-10">
                  <span className="text-white font-black text-2xl">💰</span>
                </div>
                <div className="bg-[#F5F5F5] rounded-3xl p-6 pt-10 border-4 border-black h-full transform hover:translate-y-[-5px] transition-transform">
                  <h3 className="text-xl font-bold mb-3">More Than Memes</h3>
                  <p>
                    Meme coins aren't just jokes. They're cultural weapons that
                    deserve more than just a pump and dump cycle.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#c0ff00] rounded-full flex items-center justify-center border-4 border-black z-10">
                  <span className="text-black font-black text-2xl">🚀</span>
                </div>
                <div className="bg-[#F5F5F5] rounded-3xl p-6 pt-10 border-4 border-black h-full transform hover:translate-y-[-5px] transition-transform">
                  <h3 className="text-xl font-bold mb-3">The Mastery</h3>
                  <p>
                    We chose Kensei because meme coins need that same
                    mastery—purpose, structure, and community governance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <motion.section
            ref={missionRef}
            className="mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={
              missionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col items-center text-center mb-10">
              <h2 className="text-3xl font-black mb-4 text-black inline-block border-b-4 border-[#c0ff00] pb-2">
                💥 OUR MISSION
              </h2>
            </div>

            <div className="relative bg-[#0039C6] rounded-3xl p-8 border-4 border-black overflow-hidden">
              {/* Background Grid Pattern */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 opacity-10">
                {Array(32)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="border border-blue-400"></div>
                  ))}
              </div>

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row gap-8 items-center mb-10">
                  <div className="md:w-1/2">
                    <div className="bg-white rounded-3xl p-6 border-4 border-black">
                      <h3 className="text-2xl font-bold mb-4 text-[#0039C6]">
                        The Problem
                      </h3>
                      <p className="text-lg mb-0">
                        In every cycle, memes return stronger, weirder, and more
                        viral. But they always suffer the same flaw:
                        <span className="block mt-2 font-bold text-xl">
                          No structure. No governance. No future.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="md:w-1/2">
                    <div className="bg-[#c0ff00] rounded-3xl p-6 border-4 border-black">
                      <h3 className="text-2xl font-bold mb-4 text-black">
                        The Solution
                      </h3>
                      <p className="text-lg mb-0">
                        Kensei transforms meme coins from jokes to digital
                        nations by providing:
                        <span className="block mt-2 font-bold text-xl">
                          Structure. Governance. Future.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                  <div className="bg-[#0046F4] rounded-2xl p-6 border-4 border-white transform hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border-2 border-black">
                      <Users size={32} className="text-[#0046F4]" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Social Identity</h4>
                    <p>Profile, feed, and following system for every token</p>
                  </div>

                  <div className="bg-[#0046F4] rounded-2xl p-6 border-4 border-white transform hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border-2 border-black">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                          stroke="#0046F4"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold mb-2">Governance Layer</h4>
                    <p>Proposals, voting, and treasury management</p>
                  </div>

                  <div className="bg-[#0046F4] rounded-2xl p-6 border-4 border-white transform hover:scale-105 transition-transform">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border-2 border-black">
                      <Zap size={32} className="text-[#0046F4]" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">AI-Powered Voice</h4>
                    <p>Agents, shill scores, and trend tracking</p>
                  </div>
                </div>

                <div className="mt-10 text-center">
                  <p className="text-white text-2xl font-bold">
                    We're making meme coins governable.
                    <br />
                    We're turning speculation into sovereignty.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Under the Hood Section */}
          <motion.section
            ref={techRef}
            className="mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={techInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col items-center text-center mb-10">
              <h2 className="text-3xl font-black mb-4 text-black inline-block border-b-4 border-[#c0ff00] pb-2">
                🔧 UNDER THE HOOD
              </h2>
            </div>

            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-4 bg-[#c0ff00] transform -translate-y-1/2 z-0"></div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  className="bg-white rounded-3xl p-6 border-4 border-black"
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                >
                  <div className="w-20 h-20 bg-[#0039C6] rounded-full flex items-center justify-center mb-4 mx-auto border-4 border-black">
                    <Cpu size={40} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">
                    AI Agentic Launchpad
                  </h3>
                  <p className="text-center">
                    Create a meme coin in seconds with our AI-powered launchpad
                  </p>
                </motion.div>

                <motion.div
                  className="bg-white rounded-3xl p-6 border-4 border-black"
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                >
                  <div className="w-20 h-20 bg-[#0039C6] rounded-full flex items-center justify-center mb-4 mx-auto border-4 border-black">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">
                    Bonding Curve Liquidity
                  </h3>
                  <p className="text-center">
                    Trade instantly with no LPs required
                  </p>
                </motion.div>

                <motion.div
                  className="bg-white rounded-3xl p-6 border-4 border-black"
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                >
                  <div className="w-20 h-20 bg-[#0039C6] rounded-full flex items-center justify-center mb-4 mx-auto border-4 border-black">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 8V13"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 16V11"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 8L7 4L11 8L15 4L19 8L23 4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 16L7 12L11 16L15 12L19 16L23 12"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">
                    AutoShill + Multi-Agent AI
                  </h3>
                  <p className="text-center">
                    Boost visibility, track whales, surface trends
                  </p>
                </motion.div>

                <motion.div
                  className="bg-white rounded-3xl p-6 border-4 border-black"
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                >
                  <div className="w-20 h-20 bg-[#0039C6] rounded-full flex items-center justify-center mb-4 mx-auto border-4 border-black">
                    <Users size={40} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">
                    Community Voting
                  </h3>
                  <p className="text-center">
                    Every token has its own mini DAO
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="mt-12 bg-[#F5F5F5] rounded-3xl p-8 border-4 border-black text-center">
              <p className="text-2xl font-bold mb-4">
                This isn't just a platform. It's a movement engine.
              </p>
              <div className="flex flex-col md:flex-row justify-center gap-4 text-xl">
                <div className="bg-[#c0ff00] px-6 py-3 rounded-full border-2 border-black">
                  <p className="font-bold m-0">Holders become governors</p>
                </div>
                <div className="bg-[#c0ff00] px-6 py-3 rounded-full border-2 border-black">
                  <p className="font-bold m-0">
                    Memes evolve into digital nations
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Founders Section */}
          <motion.section
            ref={foundersRef}
            className="mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={
              foundersInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col items-center text-center mb-10">
              <h2 className="text-3xl font-black mb-4 text-black inline-block border-b-4 border-[#c0ff00] pb-2">
                THE FOUNDERS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {founders.map((founder, index) => (
                <motion.div
                  key={index}
                  className="bg-[#F5F5F5] rounded-3xl border-4 border-black overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={founder.image || "/placeholder.svg"}
                      alt={founder.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold">{founder.name}</h3>
                    <p className="text-[#0039C6] font-medium mb-2">
                      {founder.role}
                    </p>
                    <p className="text-sm mb-4">{founder.bio}</p>
                    <div className="flex gap-3">
                      <a
                        href={founder.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full border-2 border-black hover:bg-[#c0ff00] transition-colors"
                      >
                        <Twitter size={16} />
                      </a>
                      <a
                        href={founder.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full border-2 border-black hover:bg-[#c0ff00] transition-colors"
                      >
                        <Github size={16} />
                      </a>
                      <a
                        href={founder.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full border-2 border-black hover:bg-[#c0ff00] transition-colors"
                      >
                        <Linkedin size={16} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* CTA Section */}
          <section className="bg-[#0039C6] rounded-3xl p-8 md:p-12 text-white border-4 border-black relative overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 opacity-20">
              {Array(32)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="border border-blue-400"></div>
                ))}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  JOIN THE REVOLUTION
                </h2>
                <p className="text-lg md:text-xl mb-6 max-w-xl">
                  Ready to transform meme coins from jokes to digital nations?
                  Launch your token on Kensei today.
                </p>
              </div>
              <Link
                href="/launch"
                className="bg-[#c0ff00] text-black px-8 py-4 rounded-full font-bold text-lg border-4 border-black hover:bg-opacity-90 transition-colors flex items-center gap-2"
              >
                Launch a Token <ArrowRight size={20} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
