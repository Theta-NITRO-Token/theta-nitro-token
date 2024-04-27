import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/MintBox.module.css'
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {BrowserProvider, ethers} from "ethers";
import blockchainInteraction from "@/hooks/contractInteractions";
import {useWeb3ModalAccount, useSwitchNetwork, useWeb3ModalProvider} from '@web3modal/ethers/react';
import {mainnetChainId, useGlobalState} from "@/hooks/globalState";
import LoadingIndicator from "@/components/loadingIndicator";

export default function RedeemBox() {

    const router = useRouter();
    const { address, chainId, isConnected } = useWeb3ModalAccount()
    const { walletProvider } = useWeb3ModalProvider()
    const { switchNetwork } = useSwitchNetwork()

    const [tokenAmounts, setTokenAmounts] = useGlobalState('tokenAmounts')
    const [userBalance, setUserBalance] = useState(0)
    const [fee, setFee] = useState(0)
    const [isLoading, setLoading] = useState(false);
    const [inputValue, setInputValue] = useState<number | ''>('');
    const [isActiveTime, setIsActiveTime] = useGlobalState('isActiveTime');
    const [isApproved, setIsApproved] = useState<boolean>(false);
    let isActiveRequestCounter = 0;

    // Use useEffect to handle the asynchronous operation
    useEffect(() => {
        const fetchAmounts = async () => {
            try {
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
                    const balance =  parseFloat(ethers.formatEther(await blockchainInteraction.getNitroBalance(address)));
                    setUserBalance(balance)
                } catch (error) {
                    console.error("Failed to fetch fee and isActive", error);
                    // Optionally handle errors, e.g., by setting an error state
                }
            }
        };

        fetchBalance();
    }, [address]);

    useEffect(() => {
        const getActive = async () => {
            try {
                const resIsActiveTime = await blockchainInteraction.getMintingActive();
                setIsActiveTime(resIsActiveTime)
            } catch (e) {
                console.log("Error:", e)
            }
        }
        if (isActiveTime.time == 0) {
            getActive()
        }
        const intervalId = setInterval(() => {
            setIsActiveTime({isActive:isActiveTime.isActive, time: isActiveTime.time - 1});
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isActiveTime.time]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(isApproved) setIsApproved(false)
        const newValue = e.target.value;
        setInputValue(newValue == '' ? '' : parseFloat(newValue)); // Update the state with the new value
    };

    const redeem = async () => {
        if(isApproved && address && walletProvider &&  inputValue && inputValue > 0) {
            setLoading(true)
            const ethersProvider = new BrowserProvider(walletProvider)
            const res = await blockchainInteraction.redeem(inputValue, ethersProvider)
            setLoading(false)
            setIsApproved(false)
            if(res) {
                const nitro = parseFloat(ethers.formatEther(await blockchainInteraction.getNitroTotalSupply()));
                const tfuel = parseFloat(ethers.formatEther(await blockchainInteraction.getTFuelBackingAmount()));
                setTokenAmounts({nitro, tfuel});
            }
        }

    }

    const approve = async () => {
        if(address && walletProvider &&  inputValue && inputValue > 0) {
            setLoading(true)
            const ethersProvider = new BrowserProvider(walletProvider)
            const res = await blockchainInteraction.approveNitro(inputValue, ethersProvider)
            setIsApproved(res)
            setLoading(false)
        }
    }

    let buttonElement: undefined | React.ReactElement = undefined;
    if(!isConnected) {
        console.log(isConnected, address)
        buttonElement = <div style={{paddingBottom: '20px'}}><w3m-button balance={'hide'} size={'md'}/></div>
    } else if(!isApproved) {
        buttonElement = <>{isLoading ? (
            // If loading is true, render a loading indicator
            <LoadingIndicator/>
        ) : (
            // If loading is false, render the mint button
            <button className={`${styles.button} btn btn-primary`} onClick={approve} type="button">
                Approve
            </button>
        )}</>
    } else {
        buttonElement = <>{isLoading ? (
            // If loading is true, render a loading indicator
            <LoadingIndicator/>
        ) : (
            // If loading is false, render the mint button
            <button className={`${styles.button} btn btn-primary`} onClick={redeem} type="button">
                Redeem
            </button>
        )}</>
    }

    return (
        <div className="d-flex justify-content-center">
            <div className={styles.textBoxContainer}>
                <h1 style={{textAlign: 'center', color: '#8e24aa', marginTop: '20px'}}>Redeem NITRO</h1>
                <h6 className={styles.infoText}>Mint Day {isActiveTime.isActive ? 'ends' : 'starts'} in {formatTime(isActiveTime.time)}</h6>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 d-flex justify-content-center align-items-center">
                            <input
                                max={userBalance.toFixed(3)}
                                min="0"
                                name="InputNitroAmountMint"
                                placeholder="NITRO"
                                className={styles.inputField}
                                type="number"
                                value={inputValue} // Set the input value to the state variable
                                onChange={handleInputChange}
                            />
                            <p className={styles.maxText} onClick={() => {
                                setInputValue(Math.floor(userBalance * 1000) / 1000);
                            }}>Max</p>
                        </div>
                    </div>
                </div>
                <p className={styles.infoText}>You get ~{typeof inputValue === "number" ? ((inputValue / tokenAmounts.nitro * tokenAmounts.tfuel) * (100-fee)/100).toFixed(2) : 0} TFuel ({isActiveTime.isActive ? 0 : 2}% Fee)</p>
                <p className={styles.infoText}>(1 Nitro
                    = {tokenAmounts.nitro > 0 ? (tokenAmounts.tfuel / tokenAmounts.nitro).toFixed(2) : 0} TFuel)</p>
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
    } else if (minutes) {
        res += `${minutes} min ${sec} sec`;
    } else {
        res += `${sec} sec`
    }
    return res;
}