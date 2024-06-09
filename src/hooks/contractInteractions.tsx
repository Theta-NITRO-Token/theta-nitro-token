import {ethers, parseUnits} from "ethers";
import UniversalProvider from '@walletconnect/universal-provider'

const NITRO_TOKEN_ADDRESS = '0xf1ba704e6483cede432bc1f7fc6082fdef8d3ac4';
const NITRO_NFT_ADDRESS = '0x0435f034c8e5f77f58548dce0ab8122bfd4530b7';
const REFERRAL_NFT_ADDRESS = '0x5eca41b572b1eb32b3917fff69b5025ea1876be7';
const RPC = 'https://eth-rpc-api.thetatoken.org/rpc';
const PROVIDER = new ethers.JsonRpcProvider(RPC);
const ABI_NITRO = [
    "function FeeBasisPoints(uint256) view returns (uint256)",
    "function MintDays(uint256) view returns (uint256)",
    "function NFT() view returns (address)",
    "function ReferralNFT() view returns (address)",
    "function StartTimestamp() view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function getTFuelBackingAmount() view returns (uint256)",
    "function redeemNitroTokens(uint256 amount)",
    "function burn(uint256 amount)",
    "function burnFrom(address account, uint256 value)",
    "function getActiveCheck(uint256 timestamp) view returns (bool)",
    "function getMintFeeBasisPoints() view returns (uint256)",
    "function mint(address to) payable",
    "function mintWithReferral(address to, uint256 referralId) payable",
    "function mintingIsActive() view returns (bool)",
    "function mintingActiveTime() view returns (bool, uint256)",
    "function redeemNFTs(uint256[] tokenIds)",
    "function referralIdToAddress(uint256) view returns (address)",
    "function setReferralIdToAddress(uint256 tokenId, address wallet) payable",
    "function setWhitelistedWallet(address wallet, bool whitelist)",
    "function totalSupply() view returns (uint256)",
    "function transactionFeeBasisPoints() view returns (uint256)",
    "function transfer(address to, uint256 value) returns (bool)",
    "function transferFrom(address from, address to, uint256 value) returns (bool)",
    "function whitelistedWallets(address) view returns (bool)",
]

const ABI_NFT = [
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
    "function approve(address to, uint256 tokenId)",
    "function balanceOf(address owner) view returns (uint256)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "function setApprovalForAll(address operator, bool approved)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
]


const contractInteraction = {
    mint: async function (tfuelAmount: number, provider: ethers.BrowserProvider) {
        try {
            console.log(provider)
            const signer = await provider.getSigner();
            const contract  = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, signer);
            const signerAddress = await signer.getAddress();
            await Promise.all([
                waitForEventComplex(
                    provider,
                    NITRO_TOKEN_ADDRESS,
                    'NitroMinted(uint256,address,uint256)',
                    [
                        { index: 2, value: BigInt(signerAddress) },
                    ]
                ),
                contract.mint(
                    signerAddress,
                    { value: ethers.parseEther(tfuelAmount.toString()) }
                ),
            ]);
            return true;
        } catch (error: any) { // TODO Error handler
            console.log('error', error);
            return false;
        }
    },

    mintReferral: async function (tfuelAmount: number, referralId: number, provider: ethers.BrowserProvider) {
        try {
            const signer = await provider.getSigner();
            const contract  = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, signer);
            const signerAddress = await signer.getAddress();
            console.log(ethers.parseUnits(referralId.toString()))
            await Promise.all([
                waitForEventComplex(
                    provider,
                    NITRO_TOKEN_ADDRESS,
                    'NitroMintedReferral(uint256,address,uint256,uint256,address,uint256)',
                    [
                        { index: 2, value: BigInt(signerAddress) },
                    ]
                ),
                contract.mintWithReferral(
                    signerAddress,
                    ethers.parseUnits(referralId.toString()),
                    { value: ethers.parseEther(tfuelAmount.toString()) }
                ),
            ]);
            return true;
        } catch (error: any) { // TODO Error handler
            console.log('error', error);
            return false;
        }
    },

    redeem: async function (nitroAmount: number, provider: ethers.BrowserProvider) {
        try {
            const nitroWei =  ethers.parseEther(nitroAmount.toString())
            const signer = await provider.getSigner();
            const contract  = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, signer);
            const signerAddress = await signer.getAddress();
            await Promise.all([
                waitForEventComplex(
                    provider,
                    NITRO_TOKEN_ADDRESS,
                    'NitroBurned(uint256,address,uint256,uint256)',
                    [
                        { index: 1, value: nitroWei },
                        { index: 2, value: BigInt(signerAddress) },
                    ]
                ),
                contract.redeemNitroTokens(nitroWei),
            ]);
            return true;
        } catch (error: any) { // TODO Error handler
            console.log('error', error);
            return false;
        }
    },

    approveNitro: async function (nitroAmount: number, provider: ethers.BrowserProvider) {
        try {
            const nitroWei =  ethers.parseEther(nitroAmount.toString())
            const signer = await provider.getSigner();
            const contract  = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, signer);
            const signerAddress = await signer.getAddress();
            const allowance = await contract.allowance(signerAddress, NITRO_TOKEN_ADDRESS);
            if(allowance >= nitroWei) return true
            await Promise.all([
                waitForEventComplex(
                    provider,
                    NITRO_TOKEN_ADDRESS,
                    'Approval(address,address,uint256)',
                    [
                        { index: 1, value: BigInt(signerAddress) },
                        { index: 2, value: BigInt(NITRO_TOKEN_ADDRESS) },
                        // { index: 3, value: nitroWei },
                    ]
                ),
                contract.approve(NITRO_TOKEN_ADDRESS, nitroWei),
            ]);
            return true;
        } catch (error: any) { // TODO Error handler
            console.log('error', error);
            return false;
        }
    },

    redeemNFTs: async function (tokenIds: string[], provider: ethers.BrowserProvider) {
        try {
            const signer = await provider.getSigner();
            const contract  = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, signer);
            const signerAddress = await signer.getAddress();
            await Promise.all([
                waitForEventComplex(
                    provider,
                    NITRO_TOKEN_ADDRESS,
                    'NitroMinted(uint256,address,uint256)',
                    [
                        { index: 2, value: BigInt(signerAddress.toLowerCase()) },
                    ]
                ),
                contract.redeemNFTs(tokenIds),
            ]);
            return true;
        } catch (error: any) { // TODO Error handler
            console.log('error', error);
            return false;
        }
    },

    approveNFTs: async function (tokenIds: string[], provider: ethers.BrowserProvider) {
        try {
            const signer = await provider.getSigner();
            const contract  = new ethers.Contract(NITRO_NFT_ADDRESS, ABI_NFT, signer);
            const signerAddress = await signer.getAddress();
            console.log(tokenIds)
            if(tokenIds.length > 1) {
                const isApprovedForAll = await contract.isApprovedForAll(signerAddress, NITRO_TOKEN_ADDRESS);
                if(isApprovedForAll) return true
                await Promise.all([
                    waitForEventComplex(
                        provider,
                        NITRO_NFT_ADDRESS,
                        'ApprovalForAll(address,address,bool)',
                        [
                            { index: 1, value: BigInt(signerAddress) },
                            { index: 2, value: BigInt(NITRO_TOKEN_ADDRESS) },
                        ]
                    ),
                    contract.setApprovalForAll(NITRO_TOKEN_ADDRESS, true),
                ]);
                return true;
            } else {
                const address = await contract.getApproved(tokenIds[0]);
                if(address.toLowerCase() === NITRO_TOKEN_ADDRESS) return true;
                await Promise.all([
                    waitForEventComplex(
                        provider,
                        NITRO_NFT_ADDRESS,
                        'Approval(address,address,uint256)',
                        [
                            { index: 1, value: BigInt(signerAddress) },
                            { index: 2, value: BigInt(NITRO_TOKEN_ADDRESS) },
                        ]
                    ),
                    contract.approve(NITRO_TOKEN_ADDRESS, tokenIds[0]),
                ]);
                return true;
            }
        } catch (error: any) { // TODO Error handler
            console.log('error', error);
            return false;
        }
    },

    setReferralAddress: async function (tokenId: string, referralAddress: string, provider: ethers.BrowserProvider) {
        try {
            const signer = await provider.getSigner();
            const contract  = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, signer);
            await Promise.all([
                waitForEventComplex(
                    provider,
                    NITRO_TOKEN_ADDRESS,
                    'ReferralAddressSet(uint256,address)',
                    [
                        { index: 2, value: BigInt(referralAddress.toLowerCase()) },
                    ]
                ),
                contract.setReferralIdToAddress(tokenId, referralAddress),
            ]);
            return true;
        } catch (error: any) { // TODO Error handler
            console.log('error', error);
            return false;
        }
    },

    getReferralAddress: async function (tokenId: string) {
        const contract = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, PROVIDER);
        try {
            return await contract.referralIdToAddress(tokenId)
        } catch (error: any) {
            console.log('error', error)
            return []
        }
    },

    getUserNitroNFTs: async function (address: string, type: string) {
        const contractAddress = type == 'referral' ? REFERRAL_NFT_ADDRESS : NITRO_NFT_ADDRESS;
        const contract = new ethers.Contract(contractAddress, ABI_NFT, PROVIDER);
        try {
          let amount : number = await contract.balanceOf(address)
          let tokenIds = []
          for(let i=0; i<Number(amount); i++) {
              let tokenId = await contract.tokenOfOwnerByIndex(address,i);
              tokenIds.push(Number(tokenId))
          }
          return tokenIds
        } catch (error: any) {
          console.log('error', error)
          return []
        }
    },

    getNitroTotalSupply: async function () {
        const contract  = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, PROVIDER);
        return await contract.totalSupply();
    },

    getTFuelBackingAmount: async function () {
        const contract  = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, PROVIDER);
        return await contract.getTFuelBackingAmount();
    },

    getBalance: async function (address: string) {
        return await PROVIDER.getBalance(address)
    },

    getNitroBalance: async function (address: string) {
        const contract  = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, PROVIDER);
        return await contract.balanceOf(address)
    },

    getMintingFee: async function () {
        const contract  = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, PROVIDER);
        return await contract.getMintFeeBasisPoints();
    },

    getMintingActive: async function () {
        console.log("Request is active")
        const contract  = new ethers.Contract(NITRO_TOKEN_ADDRESS, ABI_NITRO, PROVIDER);
        const [isActive, time] : [boolean, bigint] = await contract.mintingActiveTime();
        console.log(isActive, time)
        return {isActive, time: Number(time)}
    }

}

function waitForEventComplex(provider: ethers.BrowserProvider, address: string, abiEvent: string, topics: Array<{ index: number; value: number|string|ethers.BigNumberish }>) {
    return new Promise<void>((resolve) => {
        const filter = {
            address,
            topics: [ethers.id(abiEvent)],
        };
        provider.on(
            filter,
            (log) => { // executed if event gets caught example loading ends
                for (const topic of topics) {
                    if (log.topics.length < topic.index) {
                        return;
                    }
                    const receivedValue = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], log.topics[topic.index]);
                    if (receivedValue.toString() !== topic.value.toString()) {
                        return;
                    }
                }
                provider.off(filter);
                resolve();
            }
        );
    })
}

export default contractInteraction;