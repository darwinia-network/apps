import type { AccountId, Balance } from '@polkadot/types/interfaces';
import type { Struct } from '@polkadot/types-codec';
import type { BN } from '@polkadot/util';

export enum FeeMarketTab {
  OVERVIEW = 'overview',
  RELAYERS = 'relayers',
  OREDERS = 'oreders',
}

export enum RelayerRole {
  ASSIGNED = 'Assigned',
  DELIVERY = 'Delivery',
  CONFIRMATION = 'Confirmation',
}

export enum SlotState {
  SLOT_1 = 'Slot 1',
  SLOT_2 = 'Slot 2',
  SLOT_3 = 'Slot 3',
  OUT_OF_SLOT = 'Out of Slot',
}

export enum OrderStatus {
  FINISHED = 'Finished',
  IN_PROGRESS = 'InProgress',
}

// The value is the specName
export type DarwiniaChain =
  | 'Crab'
  | 'Darwinia'
  | 'Pangolin'
  | 'Pangoro'
  | 'Crab Parachain'
  | 'Darwinia Parachain'
  | 'Pangolin Parachain';

export type FeeMarketApiSection =
  | 'feeMarket'
  | 'crabFeeMarket'
  | 'darwiniaFeeMarket'
  | 'pangolinFeeMarket'
  | 'pangoroFeeMarket'
  | 'crabParachainFeeMarket'
  | 'pangolinParachainFeeMarket';

export interface PalletFeeMarketRelayer extends Struct {
  id: AccountId;
  collateral: Balance;
  fee: Balance;
}

export type RelayerOrdersDataSource = {
  lane: string;
  nonce: string;
  createBlockTime: string;
  reward: BN;
  slash: BN;
  relayerRoles: RelayerRole[];
};

export interface TFeeMarketOverview {
  market?: {
    averageSpeed: number | null; // milliseconds
    totalReward: string | null;
    totalOrders: number | null;
  } | null;
}

export interface TTotalOrderOverview {
  orders?: {
    nodes: {
      createBlockTime: string;
    }[];
  } | null;
}

export interface TRelayerOverview {
  relayer?: {
    totalOrders: number | null;
    totalSlashes: string | null;
    totalRewards: string | null;
  } | null;
}

export interface TOrdersStatistics {
  market?: {
    finishedOrders: number | null;
    inProgressInSlotOrders: number | null;
    inProgressOutOfSlotOrders: number | null;
  } | null;
}

export interface TOrdersOverview {
  orders?: {
    nodes: {
      id: string;
      lane: string;
      nonce: string;
      sender?: string | null;
      deliveryRelayers?: {
        nodes: {
          deliveryRelayerId: string;
        }[];
      };
      confirmationRelayers?: {
        nodes: {
          confirmationRelayerId: string;
        }[];
      };
      createBlockNumber: number;
      finishBlockNumber: number | null;
      createBlockTime: string;
      finishBlockTime?: string | null;
      status: OrderStatus;
      slotIndex?: number | null;
    }[];
  } | null;
}

export interface TOrderDetail {
  order?: {
    lane: string;
    nonce: string;
    fee: string;
    sender?: string | null;
    sourceTxHash?: string | null;
    slotTime?: number | null;
    outOfSlotBlock?: number | null;
    slotIndex?: number | null;
    status: OrderStatus;
    createBlockTime: string;
    finishBlockTime?: string | null;
    createBlockNumber: number;
    finishBlockNumber?: number | null;
    assignedRelayersAddress: string[];
    treasuryAmount?: string | null;

    slashes?: {
      nodes: {
        amount: string;
        relayer?: {
          address: string;
        } | null;
        relayerRole: RelayerRole;
        blockNumber: number;
        extrinsicIndex?: number | null;
      }[];
    } | null;

    rewards?: {
      nodes: {
        amount: string;
        relayer?: {
          address: string;
        } | null;
        relayerRole: RelayerRole;
        blockNumber: number;
        extrinsicIndex?: number | null;
      }[];
    } | null;
  } | null;
}

export interface TRelayerRewardSlash {
  relayer?: {
    slashes?: {
      nodes: {
        amount: string;
        blockTime: string;
      }[];
    } | null;
    rewards?: {
      nodes: {
        amount: string;
        blockTime: string;
      }[];
    } | null;
  } | null;
}

export interface TQuoteHistory {
  quoteHistory?: {
    data: {
      amount: string;
      blockTime: string;
    }[];
  } | null;
}

export interface SlashReward {
  order?: {
    lane: string;
    nonce: string;
    createBlockTime: string;
  };
  amount: string;
  relayerRole: RelayerRole;
}

export interface TRelayerOrders {
  relayer?: {
    address: string;
    slashes?: { nodes: SlashReward[] } | null;
    rewards?: { nodes: SlashReward[] } | null;
  } | null;
}

export interface TFeeHistory {
  feeHistory?: {
    data: {
      amount: string;
      blockTime: string;
    }[];
  } | null;
}
