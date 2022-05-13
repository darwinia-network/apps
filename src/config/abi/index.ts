import { AbiItem } from 'web3-utils';
import bankABI from './bankABI.json';

type keys = 'bankABI';

export const abi = {
  bankABI,
} as {
  [key in keys]: AbiItem[];
};
