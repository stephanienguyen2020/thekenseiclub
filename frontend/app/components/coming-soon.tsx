"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RocketIcon as RocketLaunch, ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "./site-header";
import { Footer } from "./Footer";
import Image from "next/image";

interface ComingSoonPageProps {
  message: string;
  image?: string;
}

export default function ComingSoonPage({
  message,
  image = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/rocket-to-moon-9CtIVDwF31CgvHZCL8GwzySvDqZBkk.webp", // Default rocket image
}: ComingSoonPageProps) {
  const [dots, setDots] = useState(".");
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prevDots) => (prevDots.length >= 3 ? "." : prevDots + "."));
    }, 500);

    setProgressWidth(Math.random() * 100);
    const progressInterval = setInterval(() => {
      setProgressWidth(Math.random() * 100);
    }, 2000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="container max-w-[800px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            {/* Back Button */}
            <div className="flex justify-start mb-8">
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <RocketLaunch className="h-16 w-16 mx-auto text-sky-400" />
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
                Coming Soon
              </h1>
              <div className="relative w-80 h-80 mx-auto">
                <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt="Feature preview"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent rounded-xl" />
              </div>
              <p className="text-xl text-muted-foreground">
                {message}
                {dots}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-[#00ff00]"
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Notification Form */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-md mx-auto space-y-4 mt-12"
            >
              <p className="text-muted-foreground">
                Want to be notified when this feature launches?
              </p>
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button className="gap-2 bg-gradient-to-r from-green-400 to-[#00ff00]">
                  <Bell className="h-4 w-4" />
                  Notify Me
                </Button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
