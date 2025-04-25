import type { TFunction } from "i18next";
import { PortalMeta } from "../types";

import metamask from "../assets/projects/metamask.png";
import gnosisSafeFork from "../assets/projects/gnosis-safe-fork.png";
import subscan from "../assets/projects/subscan.png";
import helix from "../assets/projects/helix.png";
import snapshot from "../assets/projects/snapshot.png";
import mathwallet from "../assets/projects/mathwallet.png";
import talisman from "../assets/projects/talisman.png";
import subsquare from "../assets/projects/subsquare.png";
import dwellir from "../assets/projects/dwellir.png";
import snowswap from "../assets/projects/snowswap.png";
import evolutionLand from "../assets/projects/evolution-land.png";
import subwallet from "../assets/projects/subwallet.png";
import polkadotJs from "../assets/projects/polkadot.js.png";
import subquery from "../assets/projects/subquery.png";
import darwiniaCommunityDao from "../assets/projects/darwinia-community-dao.png";
import novawallet from "../assets/projects/novawallet.png";
// import raregems from "../assets/projects/raregems.png";
// import ringoNft from "../assets/projects/ringo-nft.png";
import accountMigrationDapp from "../assets/projects/account-migration-dapp.png";
import stakingDapp from "../assets/projects/staking-dapp.png";
import tokenMigrationDapp from "../assets/projects/token-migration-dapp.png";
import localSubkeyMigration from "../assets/projects/local-subkey-migration.png";
import darwiniaPolkadotParachainAuction from "../assets/projects/darwinia-polkadot-parachain-auction.png";
import crabKusamaParachainAuction from "../assets/projects/crab-kusama-parachain-auction.png";
import openzeppelin from "../assets/projects/openzeppelin.png";
import remix from "../assets/projects/remix.png";
import ethSign from "../assets/projects/eth-sign.png";
import truffle from "../assets/projects/truffle.png";
import mars from "../assets/projects/mars.png";
import waffle from "../assets/projects/waffle.png";
import bwareLabs from "../assets/projects/bware-labs.png";
import subsquid from "../assets/projects/subsquid.png";
import hardhat from "../assets/projects/hardhat.png";
import web3Py from "../assets/projects/web3-py.png";
import web3Js from "../assets/projects/web3-js.png";
import ethersJs from "../assets/projects/ethers-js.png";
import foundry from "../assets/projects/foundry.png";
import brownie from "../assets/projects/brownie.png";
import scaffoldEth from "../assets/projects/scaffold-eth.png";
import walletconnect from "../assets/projects/walletconnect.png";
import gnosisMultisigWallet from "../assets/projects/gnosis-multisig-wallet.svg";
import immunefi from "../assets/projects/immunefi.png";
import ktonStaking from "../assets/projects/kton-staking.png";
import envio from "../assets/projects/Envio_logo_sqaure.png";
import mimir from "../assets/projects/mimir.png";
import blockscout from "../assets/projects/blockscout.png";
import paralink from "../assets/projects/paralink.png";
import degov from "../assets/projects/degov.png";
import ringdao from "../assets/projects/ringdao.png";
import ktondao from "../assets/projects/ktondao.png";
import darwiniaName from "../assets/projects/darwiniaName.png";

export const projects = (t: TFunction): PortalMeta[] => [
  {
    logo: ktonStaking,
    name: t("KTON Staking"),
    link: t("https://staking.ktondao.xyz"),
    description: t("Stake KTON to earn rewards."),
    tags: ["Defi", "Tool"],
  },
  {
    logo: metamask,
    name: t("MetaMask"),
    link: t("https://metamask.io/"),
    description: t("A crypto wallet & gateway to blockchain apps."),
    tags: ["Wallet"],
  },
  {
    logo: gnosisSafeFork,
    name: t("DSafe (Fork Gnosis Safe)"),
    link: t("https://dsafe.darwinia.network"),
    description: t(
      "Gnosis Safe is the most trusted decentralized custody protocol and collective asset management platform on Ethereum and the EVM."
    ),
    tags: ["Wallet"],
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
    name: t("Helixbox"),
    link: t("https://app.helix.box/"),
    description: t(
      "Helixbox integrates the best asset bridging projects in the industry, providing users with a filtered list of asset bridges and a cross-chain portal."
    ),
    tags: ["Defi"],
  },
  {
    logo: snapshot,
    name: t("Snapshot"),
    link: t("https://snapshot.org/#/"),
    description: t(
      "Snapshot is a free and flexible voting framework that allows DAOs to make decisions transparently."
    ),
    tags: ["Governance"],
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
    logo: blockscout,
    name: t("Blockscout"),
    link: t("https://explorer.darwinia.network"),
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
    logo: envio,
    name: t("Envio"),
    link: t("https://envio.dev/"),
    description: t(
      "Envio is a modern, multi-chain EVM blockchain indexing framework speed-optimized for querying real-time and historical data."
    ),
    tags: ["Infrastructure", "Tool"],
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
    link: t("https://guild-gov.ringdao.com/"),
    description: t(
      "Darwinia Community DAO(DCDAO) is a community self-organized workgroup(WG) contributing to the growth of the Darwinia community."
    ),
    tags: ["Governance"],
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
    logo: accountMigrationDapp,
    name: t("Account Migration Dapp"),
    link: t("https://migration.darwinia.network/"),
    description: t("A tool to migrate your Darwinia 1.0 account to Darwinia."),
    tags: ["Tool"],
  },
  {
    logo: stakingDapp,
    name: t("Darwinia Staking"),
    link: t("https://collator-staking.ringdao.com/"),
    description: t("The easiest way to stake on Darwinia chain."),
    tags: ["Defi", "Tool"],
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
      "Here are the Darwinia 1.0 accounts you generated on the Darwinia Apps of the old version. You can restore them in the polkadot.js by importing the JSON files."
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
    tags: ["Tool"],
  },
  {
    logo: remix,
    name: t("Remix"),
    link: t("https://remix.ethereum.org/"),
    description: t(
      "Remix Project is a platform for development tools that use a plugin architecture. It encompasses sub-projects including Remix Plugin Engine, Remix Libs, and Remix-IDE."
    ),
    tags: ["Tool"],
  },
  {
    logo: ethSign,
    name: t("EthSign"),
    link: t("https://www.ethsign.xyz/"),
    description: t(
      "EthSign is a decentralized, versioned electronic agreement signing DApp built with Web3 technologies."
    ),
    tags: ["Tool"],
  },
  {
    logo: truffle,
    name: t("Truffle"),
    link: t("https://trufflesuite.com/"),
    description: t(
      "Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot easier."
    ),
    tags: ["Tool"],
  },
  {
    logo: mars,
    name: t("Mars"),
    link: t("https://getmars.io/"),
    description: t(
      "Mars is a deployment manager for Ethereum smart contracts. Mars provides a simple, TypeScript compatible framework for creating advanced deployment scripts and staying in sync with state changes."
    ),
    tags: ["Tool"],
  },
  {
    logo: waffle,
    name: t("Waffle"),
    link: t("https://getwaffle.io/"),
    description: t(
      "Waffle is a framework for testing smart contracts that uses minimal dependencies, has syntax that is easy to learn and extend, and provides fast execution times when compiling and testing smart contracts."
    ),
    tags: ["Tool"],
  },
  {
    logo: bwareLabs,
    name: t("Bware Labs"),
    link: t("https://bwarelabs.com/"),
    description: t(
      "Bware Labs provides an interface between Blockchain APIs consumers and node providers with integrated payment options and verified reliability, all embedded within their platform and protocol service."
    ),
    tags: ["Tool"],
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
    tags: ["Tool"],
  },
  {
    logo: web3Py,
    name: t("web3.py"),
    link: t("https://web3py.readthedocs.io/"),
    description: t("web3.py is a Python library for interacting with Ethereum."),
    tags: ["Tool"],
  },
  {
    logo: web3Js,
    name: t("web3.js"),
    link: t("https://web3js.readthedocs.io/"),
    description: t(
      "web3.js is a collection of libraries that allow you to interact with a local or remote ethereum node using HTTP, IPC or WebSocket."
    ),
    tags: ["Tool"],
  },
  {
    logo: ethersJs,
    name: t("ethers.js"),
    link: t("https://docs.ethers.org/"),
    description: t(
      "The ethers.js library aims to be a complete and compact library for interacting with the Ethereum Blockchain and its ecosystem."
    ),
    tags: ["Tool"],
  },
  {
    logo: foundry,
    name: t("Foundry"),
    link: t("https://book.getfoundry.sh"),
    description: t(
      "Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust."
    ),
    tags: ["Tool"],
  },
  {
    logo: brownie,
    name: t("Brownie"),
    link: t("https://eth-brownie.readthedocs.io/en/stable/"),
    description: t(
      "A Python-based development and testing framework for smart contracts targeting the Ethereum Virtual Machine."
    ),
    tags: ["Tool"],
  },
  {
    logo: scaffoldEth,
    name: t("scaffold-eth"),
    link: t("https://github.com/scaffold-eth/scaffold-eth#-scaffold-eth"),
    description: t("Forkable Ethereum dev stack focused on fast product iterations."),
    tags: ["Tool"],
  },
  {
    logo: walletconnect,
    name: t("Walletconnect"),
    link: t("https://walletconnect.network"),
    description: t(
      "WalletConnect is the Web3 messaging layer and a standard to connect blockchain wallets to Dapps. Our mission continues to expand the interoperability of the Web3 space by providing the best tooling and infrastructure for Wallets to deliver an outstanding user experience."
    ),
    tags: ["Wallet"],
  },
  {
    logo: gnosisMultisigWallet,
    name: t("Gnosis MultiSigWallet(Classic)"),
    link: t("https://ipfs.io/ipfs/QmfRD4GuqZobNi2NT2C77a3UTQ452ffwstr4fjEJixUgjf/#/wallets"),
    description: t(
      "Gnosis Safe is the most trusted decentralized custody protocol and collective asset management platform on Ethereum and the EVM."
    ),
    tags: ["Wallet"],
  },
  {
    logo: immunefi,
    name: "Immunefi",
    link: "https://immunefi.com/",
    description:
      "The leading bug bounty platform for blockchain with the world's largest bug bounties. More than $90m paid out to Whitehats and $156m in rewards available.",
    tags: ["Infrastructure", "Tool"],
  },
  {
    logo: mimir,
    name: t("Mimir"),
    link: t("https://safe.mimir.global/?chainid=46"),
    description: t("Mimir is your ultimate multisig wallet, engineered to deliver an exceptional multisig experience."),
    tags: ["Wallet"],
  },
  {
    logo: paralink,
    name: t("Paralink"),
    link: t("https://para.link"),
    description: t("ParaLink is the decentralized token exchange hub in the Polkadot ecosystem."),
    tags: ["Defi"],
  },
  {
    logo: degov,
    name: t("DeGov.AI"),
    link: t("https://degov.ai/"),
    description: t("An AI-powered governance platform for DAOs."),
    tags: ["Governance"],
  },
  {
    logo: ringdao,
    name: t("RingDAO"),
    link: t("https://gov.ringdao.com/"),
    description: t(
      "RingDAO is a Venture DAO dedicated to DeFi and DAO Applications, driven by AI and Chain Abstraction Technologies."
    ),
    tags: ["Governance"],
  },
  {
    logo: ktondao,
    name: t("KtonDAO"),
    link: t("https://gov.ktondao.xyz/"),
    description: t("The DAO governed by KTON token holders."),
    tags: ["Governance"],
  },
  {
    logo: darwiniaName,
    name: t("Darwinia Names"),
    link: t("https://names.darwinia.network/"),
    description: t("The first decentralized domain name service for the Darwinia network."),
    tags: ["Infrastructure"],
  },
];
