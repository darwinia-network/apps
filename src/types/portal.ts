export type PortalTag =
  | "Defi"
  | "Wallet"
  | "Explorer"
  | "Infrastructure"
  | "Bridge"
  | "Governance"
  | "Gaming"
  | "NFT"
  | "DAO"
  | "Tool";

export interface PortalMeta {
  name: string;
  logo: string;
  description: string;
  link: string;
  tags: PortalTag[];
}
