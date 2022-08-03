import type { AccountId, Balance } from '@polkadot/types/interfaces';
import type { Struct } from '@polkadot/types-codec';
import type { BN } from '@polkadot/util';

export type CrossChainDestination =
  | 'Crab'
  | 'Darwinia'
  | 'Pangolin'
  | 'Pangoro'
  | 'CrabParachain'
  | 'PangolinParachain'
  | 'Default';

export interface PalletFeeMarketRelayer extends Struct {
  id: AccountId;
  collateral: Balance;
  fee: Balance;
}

export enum SegmentedType {
  ALL,
  L7D,
  L30D,
}

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
  IN_PROGRESS = 'In Progress',
  OUT_OF_SLOT = 'Out of Slot',
}

export enum SubqlOrderStatus {
  FINISHED = 'Finished',
  IN_PROGRESS = 'InProgress',
  OUT_OF_SLOT = 'OutOfSlot',
}

export enum FinishedOrNot {
  FINISHED = 'Finished',
  IN_PROGRESS = 'In Progress',
}

export interface RelayerRewardsAndSlashsData {
  relayerEntity?: {
    slashs?: {
      nodes: {
        amount: string;
        slashTime: string;
      }[];
    } | null;
    assignedRewards?: {
      nodes: {
        rewardTime: string;
        assignedAmount: string;
      }[];
    } | null;
    deliveredRewards?: {
      nodes: {
        rewardTime: string;
        deliveredAmount: string;
      }[];
    } | null;
    confirmedRewards?: {
      nodes: {
        rewardTime: string;
        confirmedAmount: string;
      }[];
    } | null;
  } | null;
}

export type RewardsAndSlashsState = {
  dates: string[];
  rewards: string[];
  slashs: string[];
};

export interface RelayerFeeHistoryData {
  relayerEntity?: {
    feeHistory?: {
      nodes: {
        fee: string;
        newfeeTime: string;
      }[];
    } | null;
  } | null;
}

export type FeeHistoryState = {
  dates: string[];
  values: string[];
};

export interface RelayerOrdersData {
  relayerEntity?: {
    assignedOrders?: {
      nodes: {
        id: string;
        createTime: string;
        rewards?: {
          nodes: {
            assignedAmount: string;
          }[];
        } | null;
      }[];
    } | null;
    deliveredOrders?: {
      nodes: {
        id: string;
        createTime: string;
        rewards?: {
          nodes: {
            deliveredAmount: string;
          }[];
        } | null;
      }[];
    } | null;
    confirmedOrders?: {
      nodes: {
        id: string;
        createTime: string;
        rewards?: {
          nodes: {
            confirmedAmount: string;
          }[];
        } | null;
      }[];
    } | null;
    slashs?: {
      nodes: {
        amount: string;
        order: {
          id: string;
          createTime: string;
        };
      }[];
    } | null;
  } | null;
}

export type RelayerOrdersState = {
  orderId: string;
  createTime: string;
  reward: BN;
  slash: BN;
  relayerRoles: RelayerRole[];
};

interface OrderDetailBase {
  id: string;
  fee: string;
  sender: string;
  sourceTxHash: string;
  slotTime: number; // number of blocks
  outOfSlot: number; // block number
  confirmedSlotIndex?: number | null; // -1: out of slot / 0: #1 / 1: #2 / 2: #3
  status: SubqlOrderStatus;
  createLaneId: string;
  createTime: string;
  finishTime?: string | null;
  createBlock: number;
  finishBlock?: number | null;
  assignedRelayers: string[];
}

interface OrderDetailSlash {
  amount: string;
  relayerId: string;
  delayTime: number; // number of blocks
  slashBlock: number;
  slashExtrinsic: number;
}

interface OrderDetailReward {
  rewardBlock: number;
  rewardExtrinsic: number;
  assignedRelayerId?: string | null;
  deliveredRelayerId: string;
  confirmedRelayerId: string;
  assignedAmount?: string | null;
  deliveredAmount: string;
  confirmedAmount: string;
  treasuryAmount?: string | null;
}

export interface OrderDetailData {
  orderEntity?:
    | (OrderDetailBase & {
        slashs?: {
          nodes: OrderDetailSlash[];
        } | null;
        rewards?: {
          nodes: OrderDetailReward[];
        } | null;
      })
    | null;
}

export interface OrderDetailState extends OrderDetailBase {
  slashs: OrderDetailSlash[];
  rewards: OrderDetailReward[];
}

export interface OverviewStatisticsData {
  feeMarketEntity?: {
    averageSpeed?: number | null;
    totalRewards?: string | null;
    totalOrders: number;
  } | null;
}

export interface OverviewStatisticsState {
  averageSpeed: number;
  totalRewards: string;
  totalOrders: number;
}

export interface FeeMarketFeeAndOderHistoryData {
  orderEntities?: {
    nodes: {
      fee: string;
      createTime: string;
    }[];
  } | null;
}

export interface FeeMarketFeeAndOrderHistortState {
  dates: string[];
  values: string[];
}

export interface OrdersStatisticsData {
  feeMarketEntity?: {
    totalFinished?: number;
    totalInProgress?: number;
    totalOutOfSlot?: number;
  } | null;
}

export interface FeeMarketOrders {
  orderEntities?: {
    nodes: {
      id: string;
      deliveredRelayerId?: string;
      confirmedRelayerId?: string;
      createBlock: number;
      finishBlock?: number;
      createTime: string;
      finishTime?: string;
      sender: string;
      status: SubqlOrderStatus;
      confirmedSlotIndex: number | null;
    }[];
  } | null;
}
