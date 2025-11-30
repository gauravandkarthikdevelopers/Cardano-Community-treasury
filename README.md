# 🏛️ Cardano Community Treasury (CCT)

## Welcome to the Cardano Community Treasury (CCT)

**Cardano Community Treasury (CCT)** is a decentralized DAO platform built on the Cardano Preprod testnet. It empowers communities to create transparent, multi-signature treasuries with real on-chain transactions. This guide will walk you through the app's key features and demonstrate how to use it effectively.

---

## Quick Start Guide for Judges

This guide assumes you are familiar with Cardano wallets, testnets, and blockchain concepts. Follow the steps below to explore the app's functionality.

---

### 1. **Access the App**

1. Open the app in your browser (URL provided during the hackathon).
2. Ensure you are connected to the **Cardano Preprod testnet**.

---

### 2. **Connect Your Wallet**

1. Supported wallets: **Nami**, **Eternl**, and other CIP-30 compatible wallets.
2. Click the **Connect Wallet** button in the top-right corner.
3. Select your wallet and ensure it is funded with **Preprod Test ADA** (use the [Cardano Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/) if needed).

---

### 3. **Create a Community Treasury**

1. Navigate to the **Create Community** page.
2. Enter the following details:
   - **Community Name**: e.g., "Hackathon Judges Treasury"
   - **Description**: e.g., "A demo treasury for the Cardano Hackathon."
   - **Treasury Wallet Address**: Provide a wallet address to hold the treasury funds.
3. Click **Create Community**. The transaction will be signed and submitted on-chain.

---

### 4. **Add Leaders and Members**

1. Open the **Manage Community** page for your newly created treasury.
2. **Add Leaders**:
   - Leaders are responsible for approving proposals.
   - Enter wallet addresses of the leaders (e.g., your own or other test wallets).
   - Set the **approval threshold** (e.g., 2 of 3 leaders must approve).
3. **Add Members**:
   - Members can create proposals but cannot approve them.
   - Enter wallet addresses of the members.

---

### 5. **Create a Proposal**

1. Navigate to the **Proposals** page.
2. Click **Create Proposal** and fill in the details:
   - **Title**: e.g., "Purchase Hackathon Swag"
   - **Description**: e.g., "Requesting 100 ADA for swag purchases."
   - **Amount**: e.g., 100 ADA
   - **Recipient Wallet Address**: Provide the recipient's wallet address.
3. Submit the proposal. The transaction will be signed and submitted on-chain.

---

### 6. **Approve a Proposal**

1. Leaders can view pending proposals on the **Proposals** page.
2. Click **Approve** or **Reject** for the proposal.
3. Once the required number of approvals is met (e.g., 2 of 3), the proposal is executed, and funds are transferred.

---

### 7. **Explore the App**

- **Treasury Dashboard**: View real-time ADA balance and transaction history (powered by the Blockfrost API).
- **Transaction Explorer**: Click on any transaction to view it on the Cardano Explorer.
- **Wallet Integration**: Seamlessly switch between wallets and test multi-leader approval workflows.

---

## Key Features Recap

- **Multi-Leader Approval System**: Configurable threshold voting for proposal approvals.
- **Role-Based Access Control**: Leaders approve, members propose.
- **Real-Time Treasury Balance**: Live updates from the Cardano blockchain.
- **Transaction Explorer Integration**: Direct links to Cardano Explorer for transparency.
- **Wallet Integration**: Supports Nami, Eternl, and other CIP-30 wallets.

---


Thank you for exploring the **Cardano Community Treasury**! We hope you enjoy the demo and see the potential of this platform to empower decentralized communities.