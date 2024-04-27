// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

interface ITNT721 {
    function safeMint(address to, string memory uri) external;
    function ownerOf(uint256 tokenId) external view returns (address);
    function getApproved(uint256 tokenId) external view returns (address);
    function redeemNFTs(uint[] memory tokenId, address owner) external;
}

contract Nitro is ERC20, ERC20Burnable, AccessControl {

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    uint public transactionFeeBasisPoints = 0;
    address public ReferralNFT;
    address public NFT;
    mapping(address => bool) public whitelistedWallets;
    mapping(uint => address) public referralIdToAddress;
    uint256[] public FeeBasisPoints = [100, 130, 160, 190, 220, 250, 280, 310, 340, 370, 400, 430, 460, 490];
    uint256[] public  MintDays = [0, 3, 8, 15, 24, 35, 48, 63, 80, 99, 120, 143, 168, 195, 224];
    uint public StartTimestamp;
    uint256 public constant day = 86400; // 86400 seconds in a day

    // Event called when new Nitro is Minted
    event NitroMinted(uint256 indexed amountNitro, address indexed receiver, uint256 indexed fee);

    // Event called when new Nitro is Minted with Referral ID
    event NitroMintedReferral(uint256 indexed amountNitro, address indexed receiver, uint256 indexed fee, uint256 referralReward, address referralAddress, uint256 referralId);

    // Event called when Nitro is Burned
    event NitroBurned(uint256 indexed amountNitro, address indexed receiver, uint256 indexed fee, uint256 payedOutTFuel);

    // Event called when Referral Address set or updated
    event ReferralAddressSet(uint256 indexed referralId, address indexed referralAddress);

    constructor(address defaultAdmin, address manager, address nft, address referralNFT, uint256 startTimestamp)
    ERC20("Theta Nitro Token", "TNT")
    {
        NFT = nft;
        ReferralNFT = referralNFT;
        StartTimestamp = startTimestamp;
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MANAGER_ROLE, manager);
    }

    // Set Whitelisted wallet addresses, if Nitro is send to a Whitelisted wallet there is no transaction fee charged
    function setWhitelistedWallet(address wallet, bool whitelist) public onlyRole(MANAGER_ROLE) {
        whitelistedWallets[wallet] = whitelist;
    }

    // Manager of the contract can set the Transaction fee, it can be between 0% and 5%
    function setTransactionFeeBasisPoints(uint basisPoints) public onlyRole(MANAGER_ROLE) {
        require(basisPoints <= 500, "Not allowed, to high fee");
        transactionFeeBasisPoints = basisPoints;
    }

    // Owners of an Referral NFT can set their wallet to receive 20% of the minting fee when the referral ID is used.
    function setReferralIdToAddress(uint tokenId, address wallet) public payable {
        require(ITNT721(ReferralNFT).ownerOf(tokenId) == msg.sender, "Not holding NFT");
        referralIdToAddress[tokenId] = wallet;

        emit ReferralAddressSet(tokenId, wallet);
    }

    // Simple minting is only possible when it is mint day. Fee for minting is between 1% and 5%
    function mint(address to) public payable {
        require(mintingIsActive(), "Minting is not active");
        uint256 amount;
        uint256 oldBalance = address(this).balance - msg.value;
        if(oldBalance != 0 && totalSupply() != 0) {
            amount = (totalSupply() * msg.value) / oldBalance;
        } else {
            amount = 10 * msg.value;
        }
        // Calculate transaction fee
        uint256 fee = (amount * getMintFeeBasisPoints()) / 10000;
        // Deduct the fee from the transferred amount
        amount = amount - fee;

        _mint(to, amount);

        emit NitroMinted(amount, to, fee);
    }

    // Minting with Referral ID, when minting with this function the person referring earns 20% of the Fee payed.
    function mintWithReferral(address to, uint referralId) public payable {
        require(mintingIsActive(), "Minting is not active");
        address referrer = referralIdToAddress[referralId];
        require(referrer != address(0), "Zero Address is not valid");
        uint256 amount = msg.value;
        uint256 oldBalance = address(this).balance - amount;
        if(oldBalance != 0 && totalSupply() != 0) {
            amount = (totalSupply() * amount) / oldBalance;
        } else {
            amount = 10 * amount;
        }
        // Calculate transaction fee
        uint256 fee = (amount * getMintFeeBasisPoints()) / 10000;
        // Deduct the fee from the transferred amount
        amount -= fee;
        _mint(to, amount);

        // split fee and transfer
        uint referralReward = fee / 5;
        fee -= referralReward;
        _mint(referrer, referralReward);

        emit NitroMintedReferral(amount, to, fee, referralReward, referrer, referralId);
    }

    // This function is used to burn the Nitro NFTs and in return get 5000 Nitro which will be backed by at least 500 TFuel
    function redeemNFTs(uint[] memory tokenIds) public {
        uint amount = 0;
        for (uint i = 0; i < tokenIds.length; i++) {
            amount += 5000 ether;
        }
        ITNT721(NFT).redeemNFTs(tokenIds, msg.sender);

        _mint(msg.sender, amount);

        emit NitroMinted(amount, msg.sender, 0);
    }

    // This function lets you burn your NitroTokens and get the backed TFuel in return. On mint Days there is no fee charged
    function redeemNitroTokens(uint256 amount) public {
        uint fee;
        uint tfuel;
        if(mintingIsActive()) {
            uint256 supply = totalSupply();
            super.burn(amount);
            tfuel = (amount * address(this).balance) / supply;
            payable(msg.sender).transfer(tfuel);
        } else {
            uint256 supply = totalSupply();
            super.burn(amount);
            tfuel = (amount * address(this).balance) / supply;
            fee = tfuel * transactionFeeBasisPoints / 10000;
            tfuel -= fee;
            payable(msg.sender).transfer(tfuel);
        }
        emit NitroBurned(amount, msg.sender, fee, tfuel);
    }

    // override of the update function to properly charge the transaction fee on:
    // 1. Transferring Nitro (if not to a whitelisted wallet)
    function _update(address from, address to, uint256 value) internal virtual override {
        if(from == address(0) || to == address(0) || whitelistedWallets[to]) {
            super._update(from, to, value);
        } else {
            // apply transaction fee
            uint256 fee = (value * transactionFeeBasisPoints) / 10000;
            uint256 newValue = value - fee;
            super._update(from, to, newValue);
            // burn
            super._update(from, address(0), fee);
        }

    }

    // Returns the current Minting Fee base points
    function getMintFeeBasisPoints() public view returns(uint256) {
        uint timeElapsed = block.timestamp - StartTimestamp;
        if(timeElapsed < 16934400) { // 196 days
            uint daysElapsed = timeElapsed / day;
            for(uint i = 0; i < 14; i++) {
                if(daysElapsed <= MintDays[i]) {
                    return FeeBasisPoints[i];
                }
            }
        } else {
            return 500;
        }
        return 500;
    }

    // Returns true if minting is active
    function mintingIsActive() public view returns(bool) {
        uint256 currentTime = block.timestamp;
        if(StartTimestamp > currentTime) return false;
        uint timeElapsed = currentTime - StartTimestamp;
        uint daysElapsed = timeElapsed / day;
        if(daysElapsed < 225) { // 225 days
            for(uint i = 0; i < 15; i++) {
                if(daysElapsed == MintDays[i]) {
                    return true;
                }
                if(daysElapsed < MintDays[i]) {
                    return false;
                }
            }
        } else {
            return (daysElapsed - 224) % 31 < 1;
        }
        return false;
    }

    // Returns true or false and either seconds until inactive or seconds until active.
    function mintingActiveTime() public view returns (bool, uint256) {
        uint256 currentTime = block.timestamp;
        if (StartTimestamp > currentTime) {
            return (false, StartTimestamp - currentTime);
        }

        uint256 timeElapsed = currentTime - StartTimestamp;
        uint256 daysElapsed = timeElapsed / day;

        if (daysElapsed < 225) { // 225 days
            for (uint i = 0; i < MintDays.length; i++) {
                uint256 nextActiveDay = MintDays[i] * day;
                if (daysElapsed < MintDays[i]) {
                    return (false, nextActiveDay - timeElapsed);
                }
                if (daysElapsed == MintDays[i]) {
                    uint256 nextInactiveDay = (MintDays[i] + 1) * day;
                    return (true, nextInactiveDay - timeElapsed);
                }
            }
        } else {
            // Calculate post 225-day period dynamics
            uint256 post225TimeElapsed = timeElapsed - 224 * day;
            uint256 cycleTime = 31 * day;
            bool isActive = (daysElapsed - 224) % 31 < 1;

            uint256 nextChange;
            if (isActive) {
                // Active for one day
                nextChange = day - (post225TimeElapsed % day);
            } else {
                // Inactive for the remainder of the 31-day cycle less the first day
                nextChange = cycleTime - (post225TimeElapsed % cycleTime);
            }

            return (isActive, nextChange);
        }

        // Default return, should never hit this
        return (false, 0);
    }

    // Function to check if minting is active at a certain timestamp
    function getActiveCheck(uint timestamp) public view returns(bool) {
        if(timestamp < StartTimestamp) return false;
        uint timeElapsed = timestamp - StartTimestamp;
        uint daysElapsed = timeElapsed / day;
        if(timeElapsed < 19440000) { // 225 days
            for(uint i = 0; i < 15; i++) {
                if(daysElapsed == MintDays[i]) {
                    return true;
                }
                if(daysElapsed < MintDays[i]) {
                    return false;
                }
            }
        } else {
            return (daysElapsed - 224) % 31 < 1;
        }
        return false;
    }

    // Returns the Nitro amount you would get if you mint with tfuelAmount. (changes when the TFuel / Nitro ration changes)
    function getMintAmount(uint256 tfuelAmount) public view returns(uint256) {
        uint256 amount;
        uint256 oldBalance = address(this).balance - tfuelAmount;
        if(oldBalance != 0 && totalSupply() != 0) {
            amount = (totalSupply() * tfuelAmount) / oldBalance;
        } else {
            amount = 10 * tfuelAmount;
        }
        // Calculate transaction fee
        uint256 fee = (amount * getMintFeeBasisPoints()) / 10000;
        // Deduct the fee from the transferred amount
        amount = amount - fee;
        return amount;
    }

    // Returns the TFuel amount that is stored in the contract
    function getTFuelBackingAmount() public view returns(uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}