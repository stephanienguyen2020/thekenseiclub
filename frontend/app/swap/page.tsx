"use client";
import WormholeConnect, {
  DEFAULT_ROUTES,
  MayanRouteSWIFT,
  WormholeConnectConfig,
  WormholeConnectTheme,
} from "@wormhole-foundation/wormhole-connect";
import Navbar from "@/components/navbar";

const config: WormholeConnectConfig = {
  network: "Testnet",
  routes: [...DEFAULT_ROUTES, MayanRouteSWIFT],
  eventHandler: (event) => {
    console.log("eventt", event);
  },
};

const theme: WormholeConnectTheme = { mode: "light" };

export default () => {
  return (
    <div className="min-h-screen bg-[#0039C6]">
      <Navbar isAuthenticated={true} />
      <div className="pt-20">
        <WormholeConnect config={config} theme={theme} />
      </div>
    </div>
  );
};
