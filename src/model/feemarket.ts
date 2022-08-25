import type { AccountId, Balance } from '@polkadot/types/interfaces';
import type { Struct } from '@polkadot/types-codec';
import type { BN } from '@polkadot/util';

export enum FeeMarketTab {
  OVERVIEW = 'overview',
  RELAYERS = 'relayers',
  OREDERS = 'oreders',
}

export enum RelayerRole {
  ASSIGNED = 'Assigned Relayer',
  DELIVERY = 'Delivery Relayer',
  CONFIRMATION = 'Confirmation Relayer',
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
  nonce: number;
  createBlockTime: string;
  reward: BN;
  slash: BN;
  relayerRoles: RelayerRole[];
};

export interface TFeeMarketOverview {
  market?: {
    averageSpeed: number | null; // milliseconds
    totalReward: string | null;
    finishedOrders: number | null;
    inProgressInSlotOrders: number | null;
    inProgressOutOfSlotOrders: number | null;
  } | null;
}

export interface TTotalOrderOverview {
  orders?: {
    nodes: {
      createBlockTime: string;
    }[];
  } | null;
}

export interface TMarketFeeOverview {
  marketFees?: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
    };
    nodes: {
      fee: string;
      timestamp: string;
    }[];
  } | null;
}

export interface TRelayerOverview {
  relayer?: {
    totalSlashs: string | null;
    totalRewards: string | null;
    slashs: {
      nodes: {
        orderId: string;
      }[];
    } | null;
    assignedRelayerOrdersId: string[] | null;
    deliveredRelayerOrdersId: string[] | null;
    confirmedRelayerOrdersId: string[] | null;
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
      sender?: string | null;
      deliveredRelayersId?: string[] | null;
      confirmedRelayersId?: string[] | null;
      createBlockNumber: number;
      finishBlockNumber: number | null;
      createBlockTime: string;
      finishBlockTime?: string | null;
      status: OrderStatus;
      confirmedSlotIndex?: number | null;
    }[];
  } | null;
}

export interface TOrderDetail {
  order?: {
    id: string;
    fee: string;
    sender?: string | null;
    sourceTxHash?: string | null;
    slotTime?: number | null;
    outOfSlotBlock?: number | null;
    confirmedSlotIndex?: number | null;
    status: OrderStatus;
    createBlockTime: string;
    finishBlockTime?: string | null;
    createBlockNumber: number;
    finishBlockNumber?: number | null;
    assignedRelayersId: string[];

    slashs?: {
      nodes: {
        amount: string;
        relayerId: string;
        delayTime?: number | null;
        blockNumber: number;
        extrinsicIndex?: number | null;
      }[];
    } | null;

    rewards?: {
      nodes: {
        blockTime: string;
        blockNumber: number;
        extrinsicIndex?: number | null;
        assignedRelayersId?: string[] | null;
        deliveredRelayersId?: string[] | null;
        confirmedRelayersId?: string[] | null;
        assignedAmounts?: string[] | null;
        deliveredAmounts?: string[] | null;
        confirmedAmounts?: string[] | null;
        treasuryAmount?: string | null;
      }[];
    } | null;
  } | null;
}

export interface TRelayerRewardSlash {
  relayer?: {
    slashs?: {
      nodes: {
        amount: string;
        blockTime: string;
      }[];
    } | null;
    assignedRelayerRewardsId: string[] | null;
    deliveredRelayerRewardsId: string[] | null;
    confirmedRelayerRewardsId: string[] | null;
  } | null;
}

export interface TRewardSimple {
  reward?: {
    blockTime: string;
    assignedAmounts?: string[] | null;
    deliveredAmounts?: string[] | null;
    confirmedAmounts?: string[] | null;
    assignedRelayersId?: string[] | null;
    deliveredRelayersId?: string[] | null;
    confirmedRelayersId?: string[] | null;
  } | null;
}

export interface TRelayerQuotes {
  relayer?: {
    quoteHistory?: {
      nodes: {
        amount: string;
        blockTime: string;
      }[];
    } | null;
  } | null;
}

export interface TRelayerOrders {
  relayer?: {
    id: string;
    assignedRelayerOrdersId?: string[] | null;
    deliveredRelayerOrdersId?: string[] | null;
    confirmedRelayerOrdersId?: string[] | null;
    slashs?: {
      nodes: {
        amount: string;
        blockTime: string;
        orderId: string;
        order: {
          createBlockTime: string;
        };
      }[];
    } | null;
  } | null;
}

export interface TOrderSimple {
  order?: {
    id: string;
    createBlockTime: string;
    slashs?: {
      nodes: {
        amount: string;
        relayerId: string;
      }[];
    } | null;
    rewards?: {
      nodes: {
        assignedAmounts?: string[] | null;
        deliveredAmounts?: string[] | null;
        confirmedAmounts?: string[] | null;
        assignedRelayersId?: string[] | null;
        deliveredRelayersId?: string[] | null;
        confirmedRelayersId?: string[] | null;
      }[];
    } | null;
  } | null;
}
