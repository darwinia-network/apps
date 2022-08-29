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
    unfinishedInSlotOrders: number | null;
    unfinishedOutOfSlotOrders: number | null;
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

type AmountIndex = {
  amount: string;
  blockTime: string;
  blockNumber: number;
  extrinsicIndex: string | null;
  eventIndex: string;
};

export interface QuoteEntity {
  id: string;

  relayerId: string;
  data: [AmountIndex] | null;
}

export interface FeeEntity {
  id: string;

  marketId: string;
  data: [AmountIndex];
  lastTime: number;
}

export interface RewardEntity {
  id: string;

  orderId: string;
  marketId: string;
  relayerId: string;

  blockTime: string;
  blockNumber: string;
  extrinsicIndex: number | null;
  eventIndex: string;

  amount: string;
  relayerRole: RelayerRole;
}

export interface SlashEntity {
  id: string;

  orderId: string;
  marketId: string;
  relayerId: string;

  blockTime: string;
  blockNumber: string;
  extrinsicIndex: number | null;
  eventIndex: string;

  amount: string;
  relayerRole: RelayerRole;

  sentTime: number;
  confirmTime: number;
  delayTime: number;
}

export interface MarketEntity {
  id: string;

  totalOrders: number;
  totalSlash: string;
  totalReward: string;

  averageSpeed: number;

  finishedOrders: number;
  unfinishedInSlotOrders: number;
  unfinishedOutOfSlotOrders: number;
}

export interface RelayerEntity {
  id: string;

  marketId: string;
  address: string;

  totalOrders: number;
  totalSlashes: string;
  totalRewards: string;
}

export interface OrderEntity {
  id: string;

  lane: string;
  nonce: string;
  marketId: string;

  sender: string | null;
  sourceTxHash: string | null;

  fee: string;
  status: OrderStatus;

  slotTime: number;
  outOfSlotBlock: number;
  slotIndex: number | null;

  createBlockTime: string;
  createBlockNumber: number;
  createExtrinsicIndex: number | null;
  createEventIndex: number;

  finishBlockTime: string;
  finishBlockNumber: number;
  finishExtrinsicIndex: number | null;
  finishEventIndex: number;

  treasuryAmount: string | null;
  assignedRelayersAddress: [string];
}

export interface OrderRelayerEntity {
  id: string;

  assignedOrderId: string; // will deprecate
  deliveryOrderId: string; // will deprecate
  confirmationOrderId: string; // will deprecate

  assignedRelayerId: string; // will deprecate
  deliveryRelayerId: string; // will deprecate
  confirmationRelayerId: string; // will deprecate

  // next version

  // orderId: string;
  // relayerId: string;

  // relayerRole: RelayerRole;
}
