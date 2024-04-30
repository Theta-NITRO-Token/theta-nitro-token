import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/MintBox.module.css'
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {BrowserProvider, ethers} from "ethers";
import blockchainInteraction from "@/hooks/contractInteractions";
import {useWeb3ModalAccount, useSwitchNetwork, useWeb3ModalProvider} from '@web3modal/ethers/react';
import {mainnetChainId, useGlobalState} from "@/hooks/globalState";
import LoadingIndicator from "@/components/loadingIndicator";

export default function MintBox() {

    const router = useRouter();
    const { address, chainId, isConnected } = useWeb3ModalAccount()
    const { walletProvider } = useWeb3ModalProvider()
    const { switchNetwork } = useSwitchNetwork()

    const [tokenAmounts, setTokenAmounts] = useGlobalState('tokenAmounts')
    const [isActiveTime, setIsActiveTime] = useGlobalState('isActiveTime');
    const [userBalance, setUserBalance] =  useState(0);
    const [fee, setFee] = useState(0)
    const [isLoading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState<number | ''>('');
    const [showNotification, setShowNotification] = useGlobalState('notification')
    const [userNitroBalance, setUserNitroBalance] = useGlobalState('userNitroBalance');

    const togglePopup = (message: string, success: boolean) => {
        setShowNotification({show: true, message:message, isSuccess: success});
        // Automatically hide the popup after 3 seconds
        setTimeout(() => {
            setShowNotification({show: false, message: message, isSuccess: success});
        }, 3000);
    };

    // Get the referral ID from the URL query parameters
    const referralId = router.query.referralId as string;

    // Use useEffect to handle the asynchronous operation
    useEffect(() => {
        const fetchAmounts = async () => {
            try {
                // Assuming 'blockchainInteraction' is imported and getNitroTotalSupply is an async function
                // const nitro = parseFloat(ethers.formatEther(await blockchainInteraction.getNitroTotalSupply()));
                // setNitroAmount(nitro);
                // const tfuel = parseFloat(ethers.formatEther(await blockchainInteraction.getTFuelBackingAmount()));
                // setTFuelAmount(tfuel);
                console.log("New Request")
                const resIsActiveTime = await blockchainInteraction.getMintingActive();
                setIsActiveTime(resIsActiveTime)
                const fee = parseFloat(await blockchainInteraction.getMintingFee())/100;
                setFee(fee);
            } catch (error) {
                console.error("Failed to fetch fee and isActive", error);
                // Optionally handle errors, e.g., by setting an error state
            }
        };

        fetchAmounts();
    }, []);

    useEffect(() => {
        // Check if connected and chainId is mainnet, if not, switch network
        if (isConnected && chainId !== mainnetChainId) {
            switchNetwork(mainnetChainId);
        }
    }, [isConnected, chainId, switchNetwork]);

    useEffect(() => {
        const fetchBalance = async () => {
            if(address) {
                try {
                    const balance =  parseFloat(ethers.formatEther(await blockchainInteraction.getBalance(address)));
                    setUserBalance(balance)
                } catch (error) {
                    console.error("Failed to fetch fee and isActive", error);
                    // Optionally handle errors, e.g., by setting an error state
                }
            }
        };

        fetchBalance();
    }, [address]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue == '' ? '' : parseFloat(newValue)); // Update the state with the new value
    };

    const mint = async () => {
        if(address && walletProvider &&  inputValue && inputValue > 0) {
            setLoading(true)
            const ethersProvider = new BrowserProvider(walletProvider)
            let res
            if(parseInt(referralId) >= 0 && parseInt(referralId) <100) {
                res = await blockchainInteraction.mintReferral(inputValue, parseInt(referralId), ethersProvider)
            } else {
                res = await blockchainInteraction.mint(inputValue, ethersProvider)
            }
            togglePopup(res ? 'NITRO Minted' : 'Error Minting', res)
            setInputValue('')
            setLoading(false)
            if(res) {
                const nitro = parseFloat(ethers.formatEther(await blockchainInteraction.getNitroTotalSupply()));
                const tfuel = parseFloat(ethers.formatEther(await blockchainInteraction.getTFuelBackingAmount()));
                setTokenAmounts({nitro, tfuel});
                const nitroBalance = parseFloat(ethers.formatEther(await blockchainInteraction.getNitroBalance(address)));
                setUserNitroBalance(nitroBalance)
                const balance =  parseFloat(ethers.formatEther(await blockchainInteraction.getBalance(address)));
                setUserBalance(balance)
            }
        }
    }

    let buttonElement: undefined | React.ReactElement;
    if(!isConnected) {
        buttonElement = <div style={{paddingBottom: '20px'}}><w3m-button balance={'hide'} size={'md'}/></div>
    } else if(isActiveTime.isActive) {
        buttonElement = <>{isLoading ? (
                // If loading is true, render a loading indicator
                <LoadingIndicator/>
            ) : (
                // If loading is false, render the mint button
                <button className={`${styles.button} btn btn-primary`} onClick={mint} type="button">
                    Mint
                </button>
            )}</>
    } else {
        buttonElement = <h2 className={styles.countdown}>{formatTime(isActiveTime.time)}</h2>
    }

    return (
        <div className="d-flex justify-content-center">
            <div className={styles.textBoxContainer}>
                <h1 style={{textAlign: 'center', color: '#8e24aa', marginTop: '20px'}}>MINT NITRO</h1>
                {isActiveTime.isActive || !isConnected ? <h6 className={styles.infoText}>Mint
                    Day {isActiveTime.isActive ? 'starts' : 'ends'} in {formatTime(isActiveTime.time)}</h6> : ''}
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 d-flex justify-content-center align-items-center">
                            <input
                                max={userBalance.toFixed(3)}
                                min="0"
                                name="InputNitroAmountMint"
                                placeholder="TFuel"
                                className={styles.inputField}
                                type="number"
                                value={inputValue} // Set the input value to the state variable
                                onChange={handleInputChange}
                            />
                            <p className={styles.maxText} onClick={() => {
                                setInputValue(parseFloat((userBalance - 1).toFixed(3)))
                            }}>Max</p>
                        </div>
                    </div>
                </div>
                <p className={styles.infoText}>You get
                    ~{typeof inputValue === "number" ? ((inputValue / tokenAmounts.tfuel * tokenAmounts.nitro) * (100 - fee) / 100).toFixed(2) : 0} Nitro
                    ({fee}% Fee)</p>
                <p className={styles.infoText}>(1 TFuel
                    = {tokenAmounts.nitro > 0 ? (tokenAmounts.nitro / tokenAmounts.tfuel).toFixed(2) : 0} Nitro)</p>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 d-flex justify-content-center">
                            {buttonElement}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatTime(seconds : number) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;

    let res = ''
    if(days) {
        res += `${days} d ${hours} h ${minutes} min ${sec} sec`;
    } else if (hours) {
        res += `${hours} h ${minutes} min ${sec} sec`;
    } else {
        res += `${minutes} min ${sec} sec`
    }

    if(days < 0 || hours < 0 || minutes < 0 || sec < 0 ) res = `0 d 0 h 0 min 0 sec`;
    return res;
}