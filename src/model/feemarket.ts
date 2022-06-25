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

interface RelayerDetailOrdersData {
  id: string;
  assignedRelayerId: string;
  deliveredRelayerId: string;
  confirmedRelayerId: string;
  confirmedSlotIndex: string;
  createBlock: number;
  finishBlock: number;
  finishTime: string;
  rewards: {
    nodes: {
      assignedAmount: string;
      deliveredAmount: string;
      confirmedAmount: string;
    }[];
  };
}

export interface RelayerDetailData {
  relayerEntity?: {
    feeHistory?: {
      nodes: {
        fee: string;
        newfeeTime: string;
      }[];
    };
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
    assignedOrders?: {
      nodes: RelayerDetailOrdersData[];
    };
    deliveredOrders?: {
      nodes: RelayerDetailOrdersData[];
    };
    confirmedOrders?: {
      nodes: RelayerDetailOrdersData[];
    };
  };
}

export type ChartState = {
  date: string[];
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
