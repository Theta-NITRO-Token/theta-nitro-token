// pages/NFT.tsx
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import styles from "./../styles/NFT.module.css"
import Image from "next/image";
import {useEffect, useState} from "react";
import contractInteractions from "@/hooks/contractInteractions";
import {useWeb3ModalAccount, useWeb3ModalProvider} from '@web3modal/ethers/react';
import LoadingIndicator from "@/components/loadingIndicator";
import {BrowserProvider, ethers} from "ethers";
import blockchainInteraction from "@/hooks/contractInteractions";
import {useGlobalState} from "@/hooks/globalState";

const NFTPage = () => {
    const { address, chainId, isConnected } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();
    const [userTokens, setUserTokens] = useState<number[]>([]);
    const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [isApproved, setIsApproved] = useState<boolean>(false);
    const [showNotification, setShowNotification] = useGlobalState('notification');


    useEffect(() => {
        const getUserTokens = async () => {
            if(address) {
                setLoading(true);
                let tokenIds : number[] = await contractInteractions.getUserNitroNFTs(address, 'redeem')
                setUserTokens(tokenIds)
                setLoading(false);
            }
        }
        if(address) {
            getUserTokens()
        }
    }, [address]);

    const togglePopup = (message: string, success: boolean) => {
        setShowNotification({show: true, message:message, isSuccess: success});
        // Automatically hide the popup after 3 seconds
        setTimeout(() => {
            setShowNotification({show: false, message: message, isSuccess: success});
        }, 3000);
    };

    const handleOptionClick = (token: string) => {
        if(selectedTokens.length <50) {
            const index = selectedTokens.indexOf(token);
            if (index > -1) {
                setSelectedTokens(selectedTokens.filter(t => t !== token));
                if(isApproved) setIsApproved(false)
            } else {
                setSelectedTokens([...selectedTokens, token]);
            }
        }
    };

    const redeemNFTs = async () => {
        if(isApproved && address && walletProvider &&  selectedTokens.length > 0) {
            setLoading(true)
            const ethersProvider = new BrowserProvider(walletProvider)
            const res = await blockchainInteraction.redeemNFTs(selectedTokens, ethersProvider)
            if(res) {
                let tokenIds : number[] = await contractInteractions.getUserNitroNFTs(address, 'redeem')
                setUserTokens(tokenIds)
            }
            togglePopup(res ? 'NFTs Redeemed' : 'Error Redeeming', res)
            setLoading(false)
        }
    }

    const approve = async () => {
        if(address && walletProvider &&  selectedTokens.length > 0) {
            setLoading(true)
            const ethersProvider = new BrowserProvider(walletProvider)
            const res = await blockchainInteraction.approveNFTs(selectedTokens, ethersProvider)
            setIsApproved(res)
            togglePopup(res ? 'NFTs Approved' : 'Error Approving', res)
            setLoading(false)
        }
    }

    let buttonElement: undefined | React.ReactElement;
    if(!isConnected) {
        buttonElement = <div style={{paddingBottom: '20px'}}><w3m-button balance={'hide'} size={'md'}/></div>
    } else if(userTokens.length == 0) {
        buttonElement = <>{isLoading ? (
            // If loading is true, render a loading indicator
            <LoadingIndicator/>
        ) : (
            // If loading is false, render the mint button
            <button className={`${styles.button} btn btn-primary`} type="button" onClick={() => window.open('https://opentheta.io', '_blank')}>Buy NFT on OpenTheta</button>
        )}</>
    } else if(isApproved) {
        buttonElement = <>{isLoading ? (
            // If loading is true, render a loading indicator
            <LoadingIndicator/>
        ) : (
            // If loading is false, render the mint button
            <button className={`btn btn-primary ${styles.button}`} type="button"
                    onClick={redeemNFTs}>
                Redeem NFTs
            </button>
        )}</>
    } else {
        buttonElement = <>{isLoading ? (
            // If loading is true, render a loading indicator
            <LoadingIndicator/>
        ) : (
            // If loading is false, render the mint button
            <button className={`btn btn-primary ${styles.button}`} type="button"
                    onClick={approve}>
                Approve NFTs
            </button>
        )}</>
    }


    return <>
        <Navbar/>
        <section className={`${styles.container} d-flex flex-column`}>
            <h1 className={styles.heading}>
                Burn your NITRO NFT <br/> in exchange for 5000 NITRO tokens!
            </h1>
            <div className="d-flex justify-content-center">
                <div className={`d-flex flex-column ${styles.nftBurnContainer}`}>
                    <h1 className={styles.subHeading}>Burn NFTs</h1>
                    <select className={styles.mySelect} multiple value={selectedTokens} onChange={() => {
                    }}>
                        <optgroup label="Your NFT Token IDs">
                            {userTokens.map((token) => (
                                <option key={token} value={token} onClick={() => handleOptionClick(token.toString())}>
                                    Token ID: {token}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                    <p className={styles.info}>
                        You will receive {selectedTokens.length*5000} NITRO for burning {selectedTokens.length} NFTs
                    </p>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12 d-flex justify-content-center">
                                {buttonElement}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <Footer/>
    </>;
};

export default NFTPage;