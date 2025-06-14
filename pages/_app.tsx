// pages/_app.tsx
import { ThirdwebProvider, Chain } from "@thirdweb-dev/react";
import "../styles/globals.css";

// PulseChain Mainnet config
const pulseChain: Chain = {
  chainId: 369,
  name: "PulseChain Mainnet",
  rpc: ["https://rpc.pulsechain.com"],
  slug: "pulsechain",
  nativeCurrency: { name: "Pulse", symbol: "PLS", decimals: 18 },
  blockExplorers: { default: { name: "PulseScan", url: "https://scan.pulsechain.com" } },
  testnet: false,
};

export default function App({ Component, pageProps }) {
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!}
      activeChain={pulseChain}
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}
