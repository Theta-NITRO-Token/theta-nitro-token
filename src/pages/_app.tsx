import "@/styles/globals.css";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import Head from "next/head";
import Notification from "@/components/notification";
import {useGlobalState} from "@/hooks/globalState";

const theta = {
	id: 361,
	name: 'Theta Mainnet',
	network: 'theta',
	nativeCurrency: {
		decimals: 18,
		name: 'TFUEL',
		symbol: 'TFUEL',
	},
	rpcUrls: {
		public: { http: ['https://eth-rpc-api.thetatoken.org'] },
		default: { http: ['https://eth-rpc-api.thetatoken.org'] },
	},
	blockExplorers: {
		etherscan: { name: 'Theta Explorer', url: 'https://explorer.thetatoken.org/' },
		default: { name: 'Theta Explorer', url: 'https://explorer.thetatoken.org/' },
	},
};

const chains = [
	theta
];

// 1. Get projectID at https://cloud.walletconnect.com

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || "";

const metadata = {
	name: "Theta Nitro Token",
	description: "Theta Nitro Token (TNT) is the first TFuel backed Meme coin!",
	url: "https://nitro.meme",
	icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const mainnet = {
	chainId: 361,
	name: 'Theta Mainnet',
	currency: 'TFUEL',
	explorerUrl: 'https://explorer.thetatoken.org',
	rpcUrl: 'https://eth-rpc-api.thetatoken.org'
}

const testnet = {
	chainId: 365,
	name: 'Theta Testnet',
	currency: 'TFUEL',
	explorerUrl: 'https://testnet-explorer.thetatoken.org',
	rpcUrl: 'https://eth-rpc-api-testnet.thetatoken.org/rpc'
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
	/*Required*/
	metadata,
	/*Optional*/
	enableEIP6963: true, // true by default
	enableInjected: true, // true by default
	enableCoinbase: true, // true by default
	rpcUrl: '...', // used for the Coinbase SDK
	defaultChainId: 365, // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
	ethersConfig,
	chains: [testnet,mainnet],
	projectId,
	enableAnalytics: true, // Optional - defaults to your Cloud configuration
	tokens: {
		365: {
			address: '0x9950e7c7e2ff63fea95bfcc17e1f4916ef9e7917',
			image: '/theta_token.svg' //optional
		}
	},
	chainImages: {
		365: 'theta_token.svg',
		361: 'theta_token.svg',
	},
	themeVariables: {
		'--w3m-color-mix': 'rgb(112,0,133)',
		'--w3m-accent': 'rgb(127,0,196)',
		'--w3m-color-mix-strength': 10
	}
})

export default function App({ Component, pageProps }: AppProps) {
	const [ready, setReady] = useState(false);
	const [showNotification, setShowNotification] = useGlobalState('notification')


	useEffect(() => {
		setReady(true);
	}, []);
	return (
		<>
			{ready ? (
				// <WagmiConfig config={wagmiConfig}>
				<>
					<Head>
						<meta charSet="utf-8"/>
						<meta content="width=device-width, initial-scale=1.0, shrink-to-fit=no" name="viewport"/>
						<title>Theta Nitro Token</title>
						<link href="https://nitro.meme/" rel="canonical"/>
						<meta content="https://nitro.meme/" property="og:url"/>
						<meta content="Theta Nitro Token" property="og:title"/>
						<meta content="Theta Nitro Token" name="twitter:title"/>
						<meta content="Theta Nitro Token is the first TFuel backed meme coin on the Theta Network!"
							  name="description"/>
						<meta content="summary" name="twitter:card"/>
						<meta content="Theta Nitro Token is the first TFuel backed meme coin on the Theta Network!"
							  name="twitter:description"/>
						<link rel="icon" href="/favicon/favicon.ico"/>
						<link rel="icon" sizes="16x16" href="/favicon/favicon-16x16.png"/>
						<link rel="icon" sizes="32x32" href="/favicon/favicon-32x32.png"/>
						<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png"/>
					</Head>
					{showNotification.show && <Notification/>}
					<Component {...pageProps} />
				</>
				// </WagmiConfig>
			) : null}
		</>
	);
}