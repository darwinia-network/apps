import type { KeyringJson } from "@polkadot/ui-keyring/types";

export interface Account {
  address: string;
  json: KeyringJson;
}
