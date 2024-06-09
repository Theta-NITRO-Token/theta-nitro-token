// pages/Referral.tsx
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import styles from "../styles/Referral.module.css"
import {useWeb3ModalAccount, useWeb3ModalProvider} from '@web3modal/ethers/react';
import React, {useEffect, useState} from "react";
import contractInteractions from "@/hooks/contractInteractions";
import LoadingIndicator from "@/components/loadingIndicator";
import {BrowserProvider, ethers} from "ethers";
import {useGlobalState} from "@/hooks/globalState";

const ReferralPage = () => {
    const { address, chainId, isConnected } = useWeb3ModalAccount();
    const { walletProvider } = useWeb3ModalProvider();
    const [userTokens, setUserTokens] = useState<number[]>([]);
    const [selectedToken, setSelectedToken] = useState<string>();
    const [currentReferralAddress, setCurrentReferralAddress] = useState('0x0000000000000000000000000000000000000000');
    const [isLoading, setLoading] = useState(false);
    const [referralAddress, setReferralAddress] = useState('');
    const [showNotification, setShowNotification] = useGlobalState('notification')


    useEffect(() => {
        const getUserTokens = async () => {
            if(address) {
                setLoading(true);
                let tokenIds : number[] = await contractInteractions.getUserNitroNFTs(address, 'referral');
                setUserTokens(tokenIds)
                if(tokenIds.length > 0) {
                    setSelectedToken(tokenIds[0].toString())
                    const referralAddress = await contractInteractions.getReferralAddress(tokenIds[0].toString());
                    setCurrentReferralAddress(referralAddress)
                }
                setLoading(false);
            }
        }
        if(address) {
            getUserTokens()
        }
    }, [address])

    const togglePopup = (message: string, success: boolean) => {
        setShowNotification({show: true, message:message, isSuccess: success});
        // Automatically hide the popup after 3 seconds
        setTimeout(() => {
            setShowNotification({show: false, message: message, isSuccess: success});
        }, 3000);
    };

    const handleOnChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const values = Array.from(event.target.selectedOptions, (option) => option.value);
        setSelectedToken(values[0])
        const referralAddress = await contractInteractions.getReferralAddress(values[0]);
        setCurrentReferralAddress(referralAddress)
    };

    const handleCopyClick = () => {
        navigator.clipboard.writeText("https://nitro.meme/?referralId=" + selectedToken)
            .then(() => alert('Referral link copied to clipboard!'))
            .catch(err => console.error('Failed to copy referral link: ', err));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReferralAddress(event.target.value);
    };

    const setReferral = async () => {
        setLoading(true)
        if(ethers.isAddress(referralAddress) && selectedToken && walletProvider) {
            const ethersProvider = new BrowserProvider(walletProvider)
            let res = await contractInteractions.setReferralAddress(selectedToken,referralAddress,ethersProvider);
            const ra = await contractInteractions.getReferralAddress(selectedToken);
            setCurrentReferralAddress(ra)
            togglePopup(res ? 'Success Setting Referral Address' : 'Error Setting Referral Address', res)
        }
        setLoading(false)
    };

    return <>
        <Navbar/>
        <section className={`d-flex flex-column ${styles.section}`}>
            <h1 className={styles.heading}>
                Set Your Referral Address<br/>&amp;<br/>Earn 20% of the paid minting Fee
            </h1>
            <div className="d-flex justify-content-center">
                <div className={`d-flex flex-column justify-content-between ${styles.container}`}>
                    <h1 className={styles.subHeading}>Set Referral</h1>
                    <select className={styles.select} value={selectedToken} onChange={handleOnChange}>
                        <optgroup label="Your NFT Token IDs">
                            {userTokens.map((token) => (
                                <option key={token} value={token}>
                                    Token ID: {token}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                    <p className={styles.address}>Current Address: {currentReferralAddress}</p>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12 d-flex justify-content-center">
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Wallet Address"
                                    value={referralAddress}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>
                <div className="container">
                <p onClick={handleCopyClick} className={styles.info}
                           style={{cursor: 'pointer', color: 'white', textDecoration: 'underline'}}>
                            Click to copy referral link
                        </p>
                        <div className="row">
                            <div className="col-md-12 d-flex justify-content-center">
                                {isConnected ? (userTokens.length ? (isLoading ? (
                                    // If loading is true, render a loading indicator
                                    <LoadingIndicator/>
                                ) : (
                                    // If loading is false, render the mint button
                                    <button className={`btn btn-primary ${styles.button}`} type="button"
                                            onClick={setReferral}>
                                        Set Referral Address
                                    </button>
                                )) : <button className={`${styles.button} btn btn-primary`} type="button" onClick={() => window.open('https://opentheta.io/collection/nitro-referral', '_blank')}>Buy NFT on OpenTheta</button>
                                ): <div style={{paddingBottom: '20px'}}>
                                    <w3m-button balance={'hide'} size={'md'}/>
                                </div>}
                            </div>
                        </div>
                </div>
                </div>
            </div>
        </section>
        <Footer/>
    </>;
};

export default ReferralPage;