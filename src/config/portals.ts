import type { TFunction } from "i18next";
import { PortalMeta } from "../types";

import metamask from "../assets/portals/metamask.png";
import gnosisSafeFork from "../assets/portals/gnosis-safe-fork.png";
import multichain from "../assets/portals/multichain.png";
import celerNetwork from "../assets/portals/celer-network.png";
import moonbeam from "../assets/portals/moonbeam.png";
import subscan from "../assets/portals/subscan.png";
import helix from "../assets/portals/helix.png";
import snapshot from "../assets/portals/snapshot.png";
import mathwallet from "../assets/portals/mathwallet.png";
import talisman from "../assets/portals/talisman.png";
import onfinality from "../assets/portals/onfinality.png";
import subview from "../assets/portals/subview.png";
import subsquare from "../assets/portals/subsquare.png";
import astar from "../assets/portals/astar.png";
import dwellir from "../assets/portals/dwellir.png";
import snowswap from "../assets/portals/snowswap.png";
import evolutionLand from "../assets/portals/evolution-land.png";
import subwallet from "../assets/portals/subwallet.png";
import polkadotJs from "../assets/portals/polkadot.js.png";
import subquery from "../assets/portals/subquery.png";
import darwiniaCommunityDao from "../assets/portals/darwinia-community-dao.png";
import phala from "../assets/portals/phala.png";
import bifrost from "../assets/portals/bifrost.png";
import parallel from "../assets/portals/parallel.png";
import novawallet from "../assets/portals/novawallet.png";
import raregems from "../assets/portals/raregems.png";
import ringoNft from "../assets/portals/ringo-nft.png";
import accountMigrationDapp from "../assets/portals/account-migration-dapp.png";
import stakingDapp from "../assets/portals/staking-dapp.png";
import feeMarketDapp from "../assets/portals/fee-market-dapp.png";
import tokenMigrationDapp from "../assets/portals/token-migration-dapp.png";
import localSubkeyMigration from "../assets/portals/local-subkey-migration.png";
import darwiniaPolkadotParachainAuction from "../assets/portals/darwinia-polkadot-parachain-auction.png";
import crabKusamaParachainAuction from "../assets/portals/crab-kusama-parachain-auction.png";
import openzeppelin from "../assets/portals/openzeppelin.png";
import theGraph from "../assets/portals/the-graph.png";
import remix from "../assets/portals/remix.png";
import ethSign from "../assets/portals/eth-sign.png";
import truffle from "../assets/portals/truffle.png";
import mars from "../assets/portals/mars.png";
import waffle from "../assets/portals/waffle.png";
import bwareLabs from "../assets/portals/bware-labs.png";
import subsquid from "../assets/portals/subsquid.png";
import hardhat from "../assets/portals/hardhat.png";
import web3Py from "../assets/portals/web3-py.png";
import web3Js from "../assets/portals/web3-js.png";
import ethersJs from "../assets/portals/ethers-js.png";

export const portals = (t: TFunction): PortalMeta[] => [
  {
    logo: metamask,
    name: t("MetaMask"),
    link: t("https://metamask.io/"),
    description: t("A crypto wallet & gateway to blockchain apps."),
    tags: ["Wallet"],
  },
  {
    logo: gnosisSafeFork,
    name: t("Gnosis Safe (Fork)"),
    link: t("https://multisig.darwiniacommunitydao.xyz/"),
    description: t(
      "Gnosis Safe is the most trusted decentralized custody protocol and collective asset management platform on Ethereum and the EVM."
    ),
    tags: ["Wallet", "Infrastructure"],
  },
  {
    logo: multichain,
    name: t("Multichain"),
    link: t("https://multichain.org/"),
    description: t(
      "Multichain is the ultimate Router for web3. It is an infrastructure developed for arbitrary cross-chain interactions."
    ),
    tags: ["Bridge"],
  },
  {
    logo: celerNetwork,
    name: t("Celer Network"),
    link: t("https://celer.network/"),
    description: t(
      "Celer is a blockchain interoperability protocol enabling a one-click user experience accessing tokens, DeFi, GameFi, NFTs, governance, and more across multiple chains."
    ),
    tags: ["Bridge"],
  },
  {
    logo: moonbeam,
    name: t("Moonbeam"),
    link: t("https://moonbeam.network/"),
    description: t(
      "Moonbeam is a smart contract platform for building cross-chain connected applications that can access users, assets, and services on any chain."
    ),
    tags: ["Infrastructure"],
  },
  {
    logo: subscan,
    name: t("Subscan"),
    link: t("https://www.subscan.io/"),
    description: t("Subscan is a high-precision multi-chain explorer built for Substrate-based blockchains."),
    tags: ["Explorer"],
  },
  {
    logo: helix,
    name: t("Helix"),
    link: t("https://helixbridge.app/"),
    description: t(
      "Helix integrates the best asset bridging projects in the industry, providing users with a filtered list of asset bridges and a cross-chain portal."
    ),
    tags: ["Bridge", "Infrastructure"],
  },
  {
    logo: snapshot,
    name: t("Snapshot"),
    link: t("https://snapshot.org/#/"),
    description: t(
      "Snapshot is a free and flexible voting framework that allows DAOs to make decisions transparently."
    ),
    tags: ["Governance", "DAO"],
  },
  {
    logo: mathwallet,
    name: t("MathWallet"),
    link: t("https://mathwallet.org/"),
    description: t("Web3 multichain crypto wallet for 2.5 million users, 100+ blockchains."),
    tags: ["Wallet"],
  },
  {
    logo: talisman,
    name: t("Talisman"),
    link: t("https://www.talisman.xyz/"),
    description: t(
      "Talisman is a Polkadot and Ethereum wallet that unlocks a new world of multichain web3 applications."
    ),
    tags: ["Wallet"],
  },
  {
    logo: onfinality,
    name: t("OnFinality"),
    link: t("https://onfinality.io/"),
    description: t(
      "OnFinality is a SaaS platform providing infrastructure services for the Kusama/Substrate community. Their mission is to support blockchain developers of all shapes and sizes by providing infrastructure services so they can focus on building the next dApp."
    ),
    tags: ["Infrastructure"],
  },
  {
    logo: subview,
    name: t("Subview"),
    link: t("https://darwinia.subview.xyz/"),
    description: t("A block explorer and analytics platform for EVM blockchains."),
    tags: ["Explorer"],
  },
  {
    logo: subsquare,
    name: t("SubSquare"),
    link: t("https://www.subsquare.io/"),
    description: t(
      "SubSquare provides a very clear visualization for the on-chain governance process and neat interfaces for community members to discuss proposals."
    ),
    tags: ["Governance"],
  },
  {
    logo: astar,
    name: t("Astar"),
    link: t("https://astar.network/"),
    description: t(
      "Astar Network supports the building of dApps with EVM and WASM smart contracts and offers developers true interoperability, with cross-consensus messaging (XCM)."
    ),
    tags: ["Infrastructure"],
  },
  {
    logo: dwellir,
    name: t("Dwellir"),
    link: t("https://dwellir.com/"),
    description: t(
      "Dwellir is a blockchain node infrastructure. They have deployed world-class RPC infrastructure for 30 blockchains and processed more than 50 million requests per day."
    ),
    tags: ["Infrastructure"],
  },
  {
    logo: snowswap,
    name: t("SnowSwap"),
    link: t("https://darwinia.snowswap.xyz/#/"),
    description: t(
      "SnowSwap is an automated market-making (AMM) decentralized exchange (DEX) that offers an integrated gateway to the DeFi world. Users can trade and earn without registration."
    ),
    tags: ["Defi"],
  },
  {
    logo: evolutionLand,
    name: t("Evolution Land"),
    link: t("https://www.evolution.land/"),
    description: t(
      "Evolution Land is the first Metaverse+Gamefi+cross-chain game with each continent built on different blockchain networks, such as the first Atlantis continent. The game will have up to 26 continents, each of which is deployed on a different public chain."
    ),
    tags: ["Gaming"],
  },
  {
    logo: subwallet,
    name: t("SubWallet"),
    link: t("https://subwallet.app/"),
    description: t(
      "SubWallet is a pioneering user-friendly Web3 Multiverse Gateway for the Polkadot and Kusama ecosystems."
    ),
    tags: ["Wallet"],
  },
  {
    logo: polkadotJs,
    name: t("Polkadot.js"),
    link: t("https://polkadot.js.org/"),
    description: t(
      "Polkadot.js is a very simple scaffolding browser extension that injects a Polkadot API Signer into a page, along with any associated accounts, allowing for use by any DApp."
    ),
    tags: ["Wallet"],
  },
  {
    logo: subquery,
    name: t("SubQuery"),
    link: t("https://subquery.network/"),
    description: t(
      "SubQuery is a data aggregation layer that operates between the layer-1 blockchains and DApps. This service unlocks blockchain data and transforms it to a queryable state so that it can be used in intuitive applications."
    ),
    tags: ["Infrastructure"],
  },
  {
    logo: darwiniaCommunityDao,
    name: t("Darwinia Community DAO"),
    link: t("https://twitter.com/realDCDAO2023"),
    description: t(
      "Darwinia Community DAO(DCDAO) is a community self-organized workgroup(WG) contributing to the growth of the Darwinia community."
    ),
    tags: ["DAO"],
  },
  {
    logo: phala,
    name: t("Phala"),
    link: t("https://www.phala.network/en/"),
    description: t(
      "Phala Network tackles the issue of trust in the computation cloud. Organizing a decentralized network of computation nodes around the world, it offers high-performance services without relying on any cloud vendor."
    ),
    tags: ["Infrastructure"],
  },
  {
    logo: bifrost,
    name: t("Bifrost"),
    link: t("https://bifrost.finance/"),
    description: t(
      "Bifrost is a web3 derivatives protocol that provides decentralized cross-chain liquidity for staked assets. By leveraging on the cross-consensus message (XCM), it can provide cross-chain liquid staking services for multiple chains."
    ),
    tags: ["Defi"],
  },
  {
    logo: parallel,
    name: t("Parallel"),
    link: t("https://parallel.fi/"),
    description: t(
      "Parallel Finance (with its Kusama-based Heiko network) is the Polkadot network-based DeFi super DApp protocol that features a composable and interoperable ecosystem of community-focused decentralized applications."
    ),
    tags: ["Defi"],
  },
  {
    logo: novawallet,
    name: t("NovaWallet"),
    link: t("https://novawallet.io/"),
    description: t(
      "Nova wallet is a universal cryptocurrency wallet that aims to provide exceptional blockchain experiences for users."
    ),
    tags: ["Wallet"],
  },
  {
    logo: raregems,
    name: t("RareGems"),
    link: t("https://raregems.io/"),
    description: t(
      "RareGems is a non-custodial multichain NFT marketplace, which has supported Crab2, Energy Web, Velas, Celo, Moonbeam, Moonriver, Oasis Emerald, Astar Network, and Avalanche. "
    ),
    tags: ["NFT"],
  },
  {
    logo: ringoNft,
    name: t("RINGO NFT"),
    link: t("https://ringonft.art/"),
    description: t("NFT Avatar Collection on Crab2."),
    tags: ["NFT"],
  },
  {
    logo: accountMigrationDapp,
    name: t("Account Migration Dapp"),
    link: t("https://migration.darwinia.network/"),
    description: t("A tool to migrate your Darwinia1 account to Darwinia2."),
    tags: ["Tool"],
  },
  {
    logo: stakingDapp,
    name: t("Staking Dapp"),
    link: t("https://staking.darwinia.network/"),
    description: t("The easiest way to stake on Darwinia2."),
    tags: ["Tool"],
  },
  {
    logo: feeMarketDapp,
    name: t("Fee Market Dapp"),
    link: t("https://feemarket.darwinia.network/"),
    description: t("To Provide data statistics and relayer operation functions for Darwinia2."),
    tags: ["Tool"],
  },
  {
    logo: tokenMigrationDapp,
    name: t("Token Migration Dapp"),
    link: t("https://token-migration.darwinia.network/"),
    description: t("A tool to migrate your Darwinia Tokens to the new contract."),
    tags: ["Tool"],
  },
  {
    logo: localSubkeyMigration,
    name: t("Local Subkey Migration"),
    link: t("/local_subkey_migration"),
    description: t(
      "Here are the Darwinia1 accounts you generated on the Darwinia Apps of the old version. You can restore them in the polkadot.js by importing the JSON files."
    ),
    tags: ["Tool"],
  },
  {
    logo: darwiniaPolkadotParachainAuction,
    name: t("Darwinia Polkadot Parachain Auction"),
    link: t("https://darwinia-network.github.io/home-v1/plo"),
    description: t("Do not contribute any more DOT at this time. Metaverse NFT Package rewards can be claimed now!"),
    tags: ["Tool"],
  },
  {
    logo: crabKusamaParachainAuction,
    name: t("Crab Kusama Parachain Auction"),
    link: t("https://darwinia-network.github.io/crab-home-v1/plo_contribute"),
    description: t("Do not contribute any more KSM at this time. Metaverse NFT Package rewards can be claimed now!"),
    tags: ["Tool"],
  },
  {
    logo: openzeppelin,
    name: t("Openzeppelin"),
    link: t("https://www.openzeppelin.com/"),
    description: t(
      "OpenZeppelin is an open-source framework to build secure smart contracts. OpenZeppelin provides a complete suite of security products and audit services to build, manage, and inspect all aspects of software development and operations for decentralized applications."
    ),
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: theGraph,
    name: t("The Graph"),
    link: t("https://thegraph.com/"),
    description: t(
      "The Graph is the indexing and query layer of the decentralized web. Developers build and publish open APIs, called subgraphs, that applications can query using GraphQL. The Graph currently supports indexing data from Ethereum, IPFS, and PoA, with more networks coming soon."
    ),
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: remix,
    name: t("Remix"),
    link: t("https://remix.ethereum.org/"),
    description: t(
      "Remix Project is a platform for development tools that use a plugin architecture. It encompasses sub-projects including Remix Plugin Engine, Remix Libs, and Remix-IDE."
    ),
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: ethSign,
    name: t("EthSign"),
    link: t("https://www.ethsign.xyz/"),
    description: t(
      "EthSign is a decentralized, versioned electronic agreement signing DApp built with Web3 technologies."
    ),
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: truffle,
    name: t("Truffle"),
    link: t("https://trufflesuite.com/"),
    description: t(
      "Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot easier."
    ),
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: mars,
    name: t("Mars"),
    link: t("https://getmars.io/"),
    description: t(
      "Mars is a deployment manager for Ethereum smart contracts. Mars provides a simple, TypeScript compatible framework for creating advanced deployment scripts and staying in sync with state changes."
    ),
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: waffle,
    name: t("Waffle"),
    link: t("https://getwaffle.io/"),
    description: t(
      "Waffle is a framework for testing smart contracts that uses minimal dependencies, has syntax that is easy to learn and extend, and provides fast execution times when compiling and testing smart contracts."
    ),
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: bwareLabs,
    name: t("Bware Labs"),
    link: t("https://bwarelabs.com/"),
    description: t(
      "Bware Labs provides an interface between Blockchain APIs consumers and node providers with integrated payment options and verified reliability, all embedded within their platform and protocol service."
    ),
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: subsquid,
    name: t("Subsquid"),
    link: t("https://www.subsquid.io/"),
    description: t(
      "Subsquid is an on-chain data processing solution that enables Web3 builders to gain access to on-chain data on their own terms."
    ),
    tags: ["Infrastructure"],
  },
  {
    logo: hardhat,
    name: t("Hardhat"),
    link: t("https://hardhat.org/"),
    description: t("Hardhat is a development environment to compile, deploy, test, and debug your Ethereum software."),
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: web3Py,
    name: t("web3.py"),
    link: t("https://web3py.readthedocs.io/"),
    description: t("web3.py is a Python library for interacting with Ethereum."),
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: web3Js,
    name: t("web3.js"),
    link: t("https://web3js.readthedocs.io/"),
    description: t(
      "web3.js is a collection of libraries that allow you to interact with a local or remote ethereum node using HTTP, IPC or WebSocket."
    ),
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: ethersJs,
    name: t("ethers.js"),
    link: t("https://docs.ethers.org/"),
    description: t(
      "The ethers.js library aims to be a complete and compact library for interacting with the Ethereum Blockchain and its ecosystem."
    ),
    tags: ["Infrastructure", "Tool"],
  },
];
