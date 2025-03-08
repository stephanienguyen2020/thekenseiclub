import localFont from "next/font/local";

export const monaSans = localFont({
  src: [
    {
      path: "./MonaSans-VariableFont_wdth,wght.ttf",
      style: "normal",
    },
    {
      path: "./MonaSans-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});
