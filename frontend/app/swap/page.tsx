"use client";
import Navbar from "@/components/navbar";
import WormholeConnect, {
  DEFAULT_ROUTES,
  MayanRouteSWIFT,
  WormholeConnectConfig,
  WormholeConnectTheme,
} from "@wormhole-foundation/wormhole-connect";

const config: WormholeConnectConfig = {
  network: "Testnet",
  routes: [...DEFAULT_ROUTES, MayanRouteSWIFT],
  eventHandler: (event) => {
    console.log("eventt", event);
  },
};

const customTheme: WormholeConnectTheme = {
  mode: "light",
};

export default () => {
  return (
    <div className="min-h-screen bg-[#0039C6]">
      <Navbar isAuthenticated={true} />
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 mt-10">
              Cross-Chain Bridge
            </h1>
            <p className="text-blue-200">
              Seamlessly transfer assets across different blockchains
            </p>
          </div>

          {/* Wormhole Connect Container */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="wormhole-connect-container">
                <WormholeConnect config={config} theme={customTheme} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
