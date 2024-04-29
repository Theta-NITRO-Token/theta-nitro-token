import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import styles from "@/styles/Home.module.css";
import TextBoxes from "@/components/textBoxes";
import MintBox from "@/components/mintBox";
import Image from 'next/image';
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import blockchainInteraction from "./../hooks/contractInteractions";
import {ethers} from "ethers";
import {useGlobalState} from "@/hooks/globalState";
import RedeemBox from "@/components/redeemBox";
import Notification from "@/components/notification";
import {useWeb3ModalAccount} from '@web3modal/ethers/react';

const TEXT_ROW1 = [
	{
		title: '1. NFT Drop',
		text: 'Launch 1000 NFTs @ 500 TFuel on OpenTheta. Each gives the owner the right to claim it for 5k Nitro token.\n-> Initial backing of nitro is 1 Nitro = 0.1 TFuel',
		marginTop: '0',
	},
	{
		title: '2. Token Launch',
		text: `On Launch Day everyone can mint new Nitro, in exchange for the current TFuel backing. For every mint there is a 1% Fee applied which gets redistributed to all Nitro holders`,
		marginTop: '120px',
	}
]

const TEXT_ROW2 = [
	{
		title: '3. Mint Days & Fee increase',
		text: `Algorithmic the contract allows new minting of Nitro. Each time the fee increases slightly (up to 5%)  and the days between two Mint Days increases by 2 days until it reaches 30 days.`,
		marginTop: '-50px',
	},
	{
		title: '4. V2 Contract',
		text: `The Theta Nitro Token V2 Contract will be released as soon EEN staking is possible from smart contract. This will increase the TFuel backing amount more consistently.`,
		marginTop: '70px',
	}
]

export default function Home() {

	const router = useRouter();
	const [tokenAmounts, setTokenAmounts] = useGlobalState('tokenAmounts');
	const [userBalance, setUserBalance] = useGlobalState('userNitroBalance');
	const { address, chainId, isConnected } = useWeb3ModalAccount()

	// Use useEffect to handle the asynchronous operation
	useEffect(() => {
		const fetchAmounts = async () => {
			try {
				// Assuming 'blockchainInteraction' is imported and getNitroTotalSupply is an async function
				const nitro = parseFloat(ethers.formatEther(await blockchainInteraction.getNitroTotalSupply()));
				const tfuel = parseFloat(ethers.formatEther(await blockchainInteraction.getTFuelBackingAmount()));
				setTokenAmounts({nitro, tfuel});
				console.log('TFuel:',tfuel,'NITRO:', nitro)
			} catch (error) {
				console.error("Failed to fetch nitro & tfuel amount:", error);
				// Optionally handle errors, e.g., by setting an error state
			}
		};

		fetchAmounts();
	}, []);

	useEffect(() => {
		const fetchBalance = async () => {
			try {
				if(address) {
					const balance = parseFloat(ethers.formatEther(await blockchainInteraction.getNitroBalance(address)));
					setUserBalance(balance);
				}
			} catch (error) {
				console.error("Failed to fetch nitro User balance", error);
				// Optionally handle errors, e.g., by setting an error state
			}
		};
		fetchBalance()
	}, [address]);

	const handleClick = (route: string) => {
		// Navigate to the about page
		router.push('/'+route);
	};


	return (
		<>
			<Navbar/>
			<section className={styles.heroSection}>
				<div className={`${styles.divHero} col d-flex flex-column`}>
					<div className="container">
						<div className="row">
							<div className="col-md-12">
								<h1 className={styles.title}>Theta NITRO Token</h1>
								<h1 className={styles.subtitle}>The First TFuel Backed Meme Coin!</h1>
							</div>
						</div>
					</div>
					<div className={`${styles.userBalance} container`}>
						<div className="row">
							<div className="col-md-12">
								<h4 className={styles.statsTitle}>Your Balance</h4>
								<div className={styles.statsValue}>
									<h1>{userBalance.toFixed(2)}</h1>
									<Image src="/nitro_token_background.png" alt="NITRO Token"
										   className={styles.tokenImage}
										   width={30} height={30}/>
								</div>
							</div>
						</div>
					</div>
					<div className="container">
						<div className="row">
							<div className="col-md-6">
								<h4 className={styles.statsTitle}>Current Nitro Supply</h4>
								<div className={styles.statsValue}>
									<h1>{tokenAmounts.nitro.toFixed(2)}</h1>
									<Image src="/nitro_token_background.png" alt="NITRO Token"
										   className={styles.tokenImage}
										   width={30} height={30}/>
								</div>
							</div>
							<div className="col-md-6">
								<h4 className={styles.statsTitle}>Currently Backed by</h4>
								<div className={styles.statsValue}>
									<h1>{tokenAmounts.tfuel.toFixed(2)}</h1>
									<Image src="tfuel_token.svg" alt="TFuel Token" className={styles.tokenImage}
										   width={30} height={30}/>
								</div>
							</div>
						</div>
					</div>
					<div className="container">
						<div className="row">
							<div className="col-md-12">
								<div className={styles.statsValue}>
									<h1>1</h1>
									<Image src="/nitro_token_background.png" alt="NITRO Token"
										   className={styles.tokenImageLarge}
										   width={35} height={35}/>
									<h1>= {tokenAmounts.nitro != 0 ? (tokenAmounts.tfuel / tokenAmounts.nitro).toFixed(2) : 0}</h1>
									<Image src="tfuel_token.svg" alt="TFuel Token" className={styles.tokenImageLarge}
										   width={35} height={35}/>
								</div>
							</div>
						</div>
					</div>
					<div className={`d-flex justify-content-center ${styles.buttonContainer}`}>
						<button className={`btn btn-primary ${styles.buyButton}`} type="button"
								onClick={() => handleClick('whitepaper')}>
							Why Buy NITRO
						</button>
					</div>
				</div>
			</section>
			<section className={styles.sectionContainer}>
				<h1 className={styles.sectionTitle}>Mint Theta Nitro Tokens</h1>
				<MintBox/>
				<h1 className={styles.sectionTitle}>Buy Nitro on ThetaSwap</h1>
				<p style={{textAlign: 'center', color: 'rgb(188,188,188)'}}>
					Keep in mind to set the slippage to 3% as there is an automatic transaction fee charged!
				</p>
				<div className="d-flex justify-content-center" style={{paddingBottom: '50px'}}>
					<div className={styles.textBoxContainer}>
						<div className="container">
							<div className="row">
							<div
									className="col-md-12 d-flex justify-content-center align-items-center align-content-center">
									<button className={`${styles.button} btn btn-primary`} type="button" onClick={() => window.open('https://swap.thetatoken.org/swap', '_blank')}>Go To ThetaSwap</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section className={styles.sectionRoadmap}>
				<div className={styles.containerRoadmap}>
					<h1 className={styles.titleRoadmap}>
						Roadmap</h1>
					<TextBoxes information={TEXT_ROW1}/>
					<TextBoxes information={TEXT_ROW2}/>
				</div>
				<h1 className={styles.titleRedeem}>Redeem Theta Nitro Tokens</h1>
				<div className={`d-flex justify-content-center ${styles.redeemContainer}`}>
					<RedeemBox/>
				</div>
			</section>
			<Footer/>
		</>
	);
}
