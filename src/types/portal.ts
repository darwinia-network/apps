export type PortalTag = "Defi" | "Wallet" | "Explorer" | "Infrastructure" | "Governance" | "Gaming" | "Tool";

export interface PortalMeta {
  name: string;
  logo: string;
  description: string;
  link: string;
  tags: PortalTag[];
}
