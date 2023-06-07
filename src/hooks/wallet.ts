import { useContext } from "react";
import { WalletContext } from "../providers/wallet";

export const useWallet = () => useContext(WalletContext);
