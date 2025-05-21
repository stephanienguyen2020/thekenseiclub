"use client"
import WormholeConnect, {
  DEFAULT_ROUTES, MayanRouteSWIFT,
  WormholeConnectConfig,
  WormholeConnectTheme
} from '@wormhole-foundation/wormhole-connect';

const config: WormholeConnectConfig = {
  network: 'Testnet',
  routes: [...DEFAULT_ROUTES, MayanRouteSWIFT],
  eventHandler: event => {
    console.log("eventt", event);
  }
};

const theme: WormholeConnectTheme = { "mode": "light" };

export default () => {
  return <WormholeConnect config={config} theme={theme} />;
}