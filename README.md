# Cardano Community Treasury (CCT)

A decentralized platform that allows any group to instantly create a community wallet, powered by Cardano + Midnight. Each "Treasury" acts as a mini-DAO with community wallet, funding proposals, voting + approvals, DAO rules, ZK-verified proof of expenses, stablecoin-based payouts, and automated accounting.

## Features

- **One-Click DAO Creation**: Create a community treasury in seconds, no coding required
- **Multi-Leader Approval**: Set custom approval thresholds - all leaders must approve transactions
- **Privacy + Transparency**: ZK-verified proof of expenses with Midnight, immutable on-chain audit trails
- **Secure & Decentralized**: Built on Cardano blockchain
- **Real-World Ready**: Stablecoin-based payouts, easy real-world payments
- **Easy Wallet Integration**: Connect with Eternal, Nami, Flint, or any Cardano wallet

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Vercel serverless functions)
- **Database**: SQLite with better-sqlite3 (in-memory for Vercel, file-based for local)
- **Wallet Integration**: Cardano wallet API (Eternal, Nami, Flint, Gero, Typhon)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Cardano wallet extension (Eternal, Nami, or Flint) installed in your browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Cardano-hackathon
```

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Using the App

1. **Connect Your Wallet**: Click "Connect Wallet" and select your Cardano wallet
2. **Create a Community**: Click "Create Treasury" and fill in the details
   - Set the number of leaders
   - Set the initial balance
   - Add leader wallet addresses
3. **Create Proposals**: Members can create funding proposals
4. **Approve Proposals**: Leaders must approve proposals (all leaders must approve)
5. **Execute Transactions**: Once all leaders approve, execute the transaction

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (serverless functions)
│   ├── dashboard/         # Dashboard page
│   ├── community/         # Community pages
│   └── proposal/          # Proposal pages
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and database
└── styles/                # Global styles
```

## Database Schema

The app uses SQLite with the following tables:
- `communities` - Community/treasury information
- `community_leaders` - Leader addresses for each community
- `community_members` - Member addresses for each community
- `proposals` - Funding proposals
- `proposal_approvals` - Leader approvals for proposals
- `transactions` - Executed transactions
- `activities` - Activity log

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Vercel will automatically detect Next.js and deploy

**Note**: For production, consider using Vercel Postgres instead of SQLite, as serverless functions reset and in-memory databases lose data.

## Development Notes

- The database uses in-memory SQLite on Vercel (data is lost on function restart)
- For production, migrate to Vercel Postgres or another persistent database
- Wallet connection requires a Cardano wallet browser extension
- All transactions are currently simulated (no actual blockchain transactions)

## Future Enhancements

- Real blockchain transaction execution
- Midnight ZK proof integration
- Stablecoin integration
- Advanced analytics and reporting
- Mobile app support

## License

MIT

## Built for

Cardano Hackathon

