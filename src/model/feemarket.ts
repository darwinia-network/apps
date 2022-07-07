import { AccountId, Balance } from '@polkadot/types/interfaces';
import { Struct } from '@polkadot/types-codec';

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
  CONFIRMED = 'Confirmed Relayer',
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
  Finished = 'Finished',
  InProgress = 'InProgress',
  OutOfSlot = 'OutOfSlot',
}

export enum FinishedStatus {
  FINISHED = 'Finished',
  UNFINISHED = 'Unfinished',
}

interface RelayerOrderData {
  id: string;
  finishTime: string;
  assignedRelayers: string[];
  rewards: {
    nodes: {
      assignedAmount?: string | null;
      deliveredAmount: string;
      confirmedAmount: string;
      assignedRelayerId?: string | null;
      deliveredRelayerId: string;
      confirmedRelayerId: string;
    }[];
  };
}

export interface RelayerOrders {
  relayerEntity?: {
    slashs?: {
      nodes: {
        amount: string;
        order: {
          id: string;
          finishTime: string;
        };
      }[];
    };
    assignedOrders?: {
      nodes: RelayerOrderData[];
    };
    deliveredOrders?: {
      nodes: RelayerOrderData[];
    };
    confirmedOrders?: {
      nodes: RelayerOrderData[];
    };
  };
}

export interface RelayerRewardsAndSlashs {
  relayerEntity?: {
    slashs?: {
      nodes: {
        amount: string;
        slashTime: string;
      }[];
    };
    assignedRewards?: {
      nodes: {
        rewardTime: string;
        assignedAmount: string;
      }[];
    };
    deliveredRewards?: {
      nodes: {
        rewardTime: string;
        deliveredAmount: string;
      }[];
    };
    confirmedRewards?: {
      nodes: {
        rewardTime: string;
        confirmedAmount: string;
      }[];
    };
  };
}

export interface RelayerFeeHistory {
  relayerEntity?: {
    feeHistory?: {
      nodes: {
        fee: string;
        newfeeTime: string;
      }[];
    };
  };
}

export interface InProgressOrdersAssignedRelayers {
  orderEntities?: {
    nodes: {
      assignedRelayers: string[];
    }[];
  };
}

export interface TotalOrdersAndFeeHistory {
  orderEntities?: {
    nodes: {
      fee: string;
      createTime: string;
    }[];
  };
}

export type ChartState = {
  dates: string[];
  data: string[];
};

export interface OrdersStatisticsData {
  feeMarketEntity?: {
    totalFinished?: number;
    totalInProgress?: number;
    totalOutOfSlot?: number;
  };
}

export interface OrdersTotalOrderData {
  orderEntities?: {
    nodes: {
      id: string;
      assignedRelayerId?: string;
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
  };
}

export interface OrderDetailData {
  orderEntity?: {
    id: string;
    fee: string;
    sender: string;
    sourceTxHash: string;
    confirmedSlotIndex?: number;
    status: SubqlOrderStatus;
    outOfSlot: number;
    createTime: string;
    finishTime?: string;
    createBlock: number;
    finishBlock?: number;
    createLaneId: string;
    slashs: {
      nodes: {
        confirmTime: number;
        sentTime: number;
        delayTime: number;
        amount: string;
        relayerId: string;
      }[];
    };
    rewards: {
      nodes: {
        assignedRelayerId?: string;
        deliveredRelayerId: string;
        confirmedRelayerId: string;
        assignedAmount?: string;
        deliveredAmount: string;
        confirmedAmount: string;
        treasuryAmount?: string;
      }[];
    };
  };
}
