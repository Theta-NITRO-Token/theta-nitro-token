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

interface NotificationState {
    show: boolean;
    message: string;
    isSuccess: boolean;
}

interface GlobalState {
    tokenAmounts: TokenAmountState;
    isActiveTime: ActiveTimeState;
    notification: NotificationState;
    userNitroBalance: number;
}

const { useGlobalState, setGlobalState, getGlobalState } = createGlobalState<GlobalState>({
    tokenAmounts: {nitro:0,tfuel:0},
    isActiveTime: {isActive: false, time: 0},
    notification: {show: false, message:'', isSuccess: false},
    userNitroBalance: 0,
});


const mainnetChainId = 365
export { useGlobalState, setGlobalState, getGlobalState, mainnetChainId };