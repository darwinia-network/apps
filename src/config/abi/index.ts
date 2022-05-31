import { AbiItem } from 'web3-utils';
import bankABI from './bankABI.json';
import ktonABI from './ktonABI.json';

type keys = 'bankABI' | 'ktonABI';

export const abi = {
  bankABI,
  ktonABI,
} as {
  [key in keys]: AbiItem[];
};
