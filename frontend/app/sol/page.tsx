"use client"
import WormholeConnect, {
  DEFAULT_ROUTES, MayanRouteSWIFT,
  WormholeConnectConfig,
  WormholeConnectTheme
} from '@wormhole-foundation/wormhole-connect';

const config: WormholeConnectConfig =  {
  // You can use Connect with testnet chains by specifying "network":
  network: 'Mainnet',
  routes: [...DEFAULT_ROUTES,  MayanRouteSWIFT],
  eventHandler: event => {
    console.log("eventt", event);
  }
};

const theme: WormholeConnectTheme = {"mode":"light"};

export default () => {
  return <WormholeConnect config={config} theme={theme} />;
}