import { Exposure } from '@darwinia/types';
import { StakingLedgerT as StakingLedger } from '@darwinia/types/interfaces';
import { TimeDepositItem } from '@darwinia/types/interfaces/darwiniaInject';
import { DeriveStakingKeys } from '@polkadot/api-derive/staking/types';
import type {
  AccountId,
  Balance,
  BlockNumber,
  EraIndex,
  Keys,
  RewardDestination,
  ValidatorPrefs,
} from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { Struct, Compact, Vec, u64 } from '@polkadot/types';

export interface DeriveStakerReward {
  era: EraIndex;
  eraReward: Balance;
  isStakerPayout?: boolean;
  isEmpty: boolean;
  isValidator: boolean;
  nominating: DeriveEraExposureNominating[];
  validators: Record<string, DeriveStakerRewardValidator>;
  total: Balance;
}

interface DeriveEraExposureNominating {
  validatorId: string;
  validatorIndex: number;
}

interface DeriveStakerRewardValidator {
  total: Balance;
  value: Balance;
}

export interface DeriveStakerExposure {
  era: EraIndex;
  isEmpty: boolean;
  isValidator: boolean;
  nominating: DeriveEraExposureNominating[];
  validators: DeriveEraValidatorExposure;
}

type DeriveEraValidatorExposure = Record<string, Exposure>;

export type StakingLock = {
  stakingAmount: Balance;
  unbondings: StakingLockUnbonding[];
};

type StakingLockUnbonding = {
  amount: Balance;
  until: BlockNumber;
};

export interface DeriveStakingQuery extends DeriveStakingStash {
  accountId: AccountId;
  nextSessionIds: AccountId[];
  sessionIds: AccountId[];
  stakingLedger: StakingLedger;
}

interface DeriveStakingStash {
  controllerId: AccountId | null;
  exposure?: Exposure;
  nominators: AccountId[];
  nominateAt?: EraIndex;
  rewardDestination: RewardDestination;
  nextKeys?: Keys;
  stashId: AccountId;
  validatorPrefs: ValidatorPrefs;
}

export interface DeriveStakingAccount extends DeriveStakingQuery, DeriveStakingKeys {
  redeemable?: Balance;
  redeemableRing?: Balance;
  redeemableKton?: Balance;
  unlocking?: DeriveUnlocking[];
  activeDepositItems?: TimeDepositItem[];
  unlockingTotalValue: Balance;
  unlockingKton?: DeriveUnlocking[];
  unlockingKtonTotalValue: Balance;
  activeDepositAmount?: Balance;
}

type DeriveUnlocking = {
  remainingEras: BN;
  value: Balance;
};

export type TsInMs = u64;

export interface DarwiniaStakingStructsTimeDepositItem extends Struct {
  readonly value: Compact<Balance>;
  readonly startTime: Compact<TsInMs>;
  readonly expireTime: Compact<TsInMs>;
}

export interface DarwiniaSupportStructsUnbonding extends Struct {
  readonly amount: Balance;
  readonly until: BlockNumber;
}

export interface DarwiniaSupportStructsStakingLock extends Struct {
  readonly stakingAmount: Balance;
  readonly unbondings: Vec<DarwiniaSupportStructsUnbonding>;
}

export interface DarwiniaStakingStructsStakingLedger extends Struct {
  readonly stash: AccountId;
  readonly active: Compact<Balance>;
  readonly activeDepositRing: Compact<Balance>;
  readonly activeKton: Compact<Balance>;
  readonly depositItems: Vec<DarwiniaStakingStructsTimeDepositItem>;
  readonly ringStakingLock: DarwiniaSupportStructsStakingLock;
  readonly ktonStakingLock: DarwiniaSupportStructsStakingLock;
  readonly claimedRewards: Vec<EraIndex>;
}
