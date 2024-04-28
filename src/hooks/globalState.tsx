import { createGlobalState } from "react-hooks-global-state";
import { ethers } from "ethers";

interface TokenAmountState {
    nitro: number;
    tfuel: number;
}

interface ActiveTimeState {
    isActive: boolean;
    time: number;
}

interface GlobalState {
    tokenAmounts: TokenAmountState;
    isActiveTime: ActiveTimeState;
}

const { useGlobalState, setGlobalState, getGlobalState } = createGlobalState<GlobalState>({
    tokenAmounts: {nitro:0,tfuel:0},
    isActiveTime: {isActive: false, time: 0}
});


const mainnetChainId = 365
export { useGlobalState, setGlobalState, getGlobalState, mainnetChainId };