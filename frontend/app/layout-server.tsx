import { metadata } from "./metadata";
// import RootLayout from "./layout";
import dynamic from "next/dynamic";

const RootLayout = dynamic(() => import("./layout"), { ssr: false });
export { metadata };

export default RootLayout;
