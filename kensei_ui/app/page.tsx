"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import Navbar from "./components/navbar";

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0039C6] p-2 md:p-4 flex items-center justify-center">
      <div className="w-full max-w-7xl bg-[#0039C6] rounded-3xl overflow-hidden relative border border-blue-500">
        {/* Navigation */}
        <div className="px-6 py-4">
          <Navbar isAuthenticated={false} />
        </div>

        {/* Hero Section with Glassmorphism Cards */}
        <div className="relative px-6 py-12 md:py-24 overflow-hidden min-h-[600px]">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20">
            {Array(64)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border border-blue-400"></div>
              ))}
          </div>

          {/* Main Heading */}
          <div className="relative z-0 mx-auto text-center">
            <h1 className="text-white text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter">
              <span className="text-[#c0ff00]">#</span>KENSEI
              <br />
              SOCIAL<span className="text-[#c0ff00]">FI</span>
              <br />
              CULTURE
            </h1>
          </div>

          {/* Glassmorphism Cards */}
          <motion.div
            className="absolute top-[35%] right-[15%] z-20 transform rotate-12"
            initial={{ y: -100, opacity: 0, rotate: 20 }}
            animate={{ y: 0, opacity: 1, rotate: 12 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.2,
            }}
            whileHover={{
              y: -10,
              rotate: 8,
              transition: { duration: 0.3 },
            }}
          >
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl shadow-lg border border-white border-opacity-20 w-[180px] h-[180px] overflow-hidden">
              <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 border-2 border-white border-opacity-30 mb-3">
                  <Image
                    src="/pixel-pup.png"
                    alt="Profile"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div className="text-white text-center">
                  <p className="font-bold text-lg">norugz.sui</p>
                  <p className="text-sm opacity-80">233,582 votes</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-[20%] left-[15%] z-20 transform -rotate-12"
            initial={{ y: 100, opacity: 0, rotate: -20 }}
            animate={{ y: 0, opacity: 1, rotate: -12 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.4,
            }}
            whileHover={{
              y: 10,
              rotate: -8,
              transition: { duration: 0.3 },
            }}
          >
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl shadow-lg border border-white border-opacity-20 w-[180px] h-[180px] overflow-hidden">
              <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 border-2 border-white border-opacity-30 mb-3">
                  <Image
                    src="/happy-frog-on-a-lilypad.png"
                    alt="NFT"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div className="text-white text-center">
                  <p className="font-bold text-lg">pepe.sui</p>
                  <p className="text-sm opacity-80">23,422 votes</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Curved Arrows */}
          <motion.div
            className="absolute bottom-[10%] left-[4%] z-10"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 10,
              delay: 0.6,
            }}
            whileHover={{ y: -10 }}
          >
            <svg
              width="150"
              height="150"
              viewBox="0 0 150 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M30 120C30 80 80 50 120 30"
                stroke="#c0ff00"
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.7 }}
              />
              <motion.path
                d="M100 30L120 30L120 50"
                stroke="#c0ff00"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 1.9 }}
              />
            </svg>
          </motion.div>

          <motion.div
            className="absolute top-[10%] right-[10%] z-10"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 10,
              delay: 0.8,
            }}
            whileHover={{ x: -10 }}
          >
            <svg
              width="150"
              height="150"
              viewBox="0 0 150 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M120 30C80 30 50 80 30 120"
                stroke="#c0ff00"
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.9 }}
              />
              <motion.path
                d="M30 100L30 120L50 120"
                stroke="#c0ff00"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 2.1 }}
              />
            </svg>
          </motion.div>

          {/* Get Started Badge */}
          <motion.div
            className="absolute bottom-[5%] right-[15%] z-10"
            initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 360, scale: 1, opacity: 1 }}
            transition={{
              duration: 1.5,
              delay: 1,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.3 },
            }}
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <div className="absolute inset-0 rounded-full bg-[#c0ff00] flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <path
                      id="circlePath"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                      fill="none"
                    />
                    <text fontSize="8" fontWeight="bold" fill="black">
                      <textPath href="#circlePath" startOffset="0%">
                        LAUNCH A TOKEN IN SECONDS | START GOVERNING MEMES |
                      </textPath>
                    </text>
                  </svg>
                </motion.div>
                <div className="transform rotate-45">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 17L17 7M17 7H7M17 7V17"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-t-[48px] p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 relative">
            {/* Feature 1 */}
            <div className="relative p-8 bg-[#F5F5F5] rounded-[24px]">
              <h3 className="text-2xl font-black mb-2 text-center uppercase">
                VOTE ON
                <br />
                PROPOSALS
              </h3>
              <p className="text-sm text-gray-600 mb-8 text-center">
                Decide what happens next—use your tokens to vote on treasury
                spends, burns, liquidity changes, and more.
              </p>

              <div className="relative flex justify-center">
                <div className="bg-[#0039C6] rounded-2xl p-4 flex items-center gap-3 text-white">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                    <Image
                      src="/happy-frog-on-a-lilypad.png"
                      alt="Profile"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">chipz.sui</p>
                    <p className="text-xs opacity-80">23,422 votes</p>
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 bg-[#c0ff00] text-black px-4 py-2 rounded-full text-sm font-bold">
                  20.24 $KEN
                </div>
              </div>
            </div>

            {/* Arrow 1 */}
            <motion.div
              className="absolute left-[30%] top-1/2 transform -translate-y-1/2 z-10 md:block hidden"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{
                scale: 1.1,
                transition: {
                  duration: 0.2,
                  yoyo: Number.POSITIVE_INFINITY,
                  repeatDelay: 0.5,
                },
              }}
            >
              <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
                <motion.path
                  d="M5 30C20 10 40 50 95 30"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
                <motion.path
                  d="M80 20L95 30L80 40"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 1.4 }}
                />
              </svg>
            </motion.div>

            {/* Feature 2 */}
            <div className="relative p-8 bg-[#F5F5F5] rounded-[24px]">
              <h3 className="text-2xl font-black mb-2 text-center uppercase">
                INSTANT
                <br />
                LIQUIDITY
              </h3>
              <p className="text-sm text-gray-600 mb-8 text-center">
                Every token on Kensei launches with bonding curve liquidity—just
                buy or sell from second one.{" "}
              </p>

              <div className="flex justify-center">
                <div
                  className="bg-[#0039C6] rounded-full p-4 inline-block text-center"
                  style={{ borderRadius: "30px" }}
                >
                  <div className="text-xs font-medium text-white">
                    No LPs. No friction
                  </div>
                  <div className="text-3xl font-bold text-white">On-demand</div>
                </div>
              </div>
            </div>

            {/* Arrow 2 */}
            <motion.div
              className="absolute right-[30%] top-1/2 transform -translate-y-1/2 z-10 md:block hidden"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{
                scale: 1.1,
                transition: {
                  duration: 0.2,
                  yoyo: Number.POSITIVE_INFINITY,
                  repeatDelay: 0.5,
                },
              }}
            >
              <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
                <motion.path
                  d="M5 30C35 50 65 10 95 30"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
                <motion.path
                  d="M80 20L95 30L80 40"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 1.6 }}
                />
              </svg>
            </motion.div>

            {/* Feature 3 */}
            <div className="relative p-8 bg-[#F5F5F5] rounded-[24px]">
              <h3 className="text-2xl font-black mb-2 text-center uppercase">
                AI-POWERED
                <br />
                GROWTH
              </h3>
              <p className="text-sm text-gray-600 mb-8 text-center">
                AutoShill spreads your coin. Agents track trends and whales. You
                focus on memes—we handle hype.
              </p>

              <div className="flex justify-center">
                <div
                  className="bg-[#c0ff00] rounded-full p-4 inline-block text-center"
                  style={{ borderRadius: "30px" }}
                >
                  <div className="text-xs font-medium">EST. Daily Users</div>
                  <div className="text-3xl font-black">1.188.342</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
