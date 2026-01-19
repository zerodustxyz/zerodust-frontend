# ZeroDust Frontend

ZeroDust is a Web3 application that enables users to sweep 100% of their native gas tokens from one chain, leaving zero dust behind. Built with EIP-7702 technology.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Web3**: wagmi, viem, RainbowKit
- **Icons**: Lucide React

## Features

### Sweep Interface
- Chain selection with official chain logos (via LI.FI icons)
- Real-time balance fetching across multiple chains
- Fee estimation and breakdown display
- Destination address input with wallet auto-fill

### Network Support
- **Testnets**: Sepolia, Base Sepolia, OP Sepolia, Arbitrum Sepolia, Polygon Amoy, BSC Testnet
- **Mainnets**: Ethereum, Base, Optimism, Arbitrum, Polygon, BNB Chain, Gnosis (coming soon)
- Network mode toggle to switch between mainnet/testnet views

### Fee System
- Preview mode: See estimated fees without connecting wallet
- Warning system:
  - "Amount too low" when fees exceed balance
  - "High fee" warning when fees > 30% of amount
- Confirmation step required for high fee transactions

### UI/UX
- Premium glassmorphism design
- Dark/light mode support
- Animated gradient backgrounds
- Responsive design (mobile-first)
- Official chain logos from LI.FI (same as Jumper exchange)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_API_URL=your_backend_api_url
```

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles, design tokens, animations
│   ├── layout.tsx       # Root layout with providers
│   └── page.tsx         # Main landing page with sweep interface
├── components/
│   ├── layout/
│   │   ├── header.tsx   # Navigation header
│   │   └── footer.tsx   # Page footer
│   ├── sweep/
│   │   ├── balance-list.tsx      # Chain selection dropdown
│   │   ├── destination-form.tsx  # Destination address input
│   │   ├── fee-breakdown.tsx     # Fee estimation display
│   │   └── sweep-button.tsx      # Transaction execution
│   └── ui/
│       ├── chain-icon.tsx        # Chain logo component
│       └── theme-toggle.tsx      # Dark/light mode toggle
├── config/
│   └── wagmi.ts         # Chain configuration, RPC URLs
├── providers/
│   └── web3-provider.tsx # wagmi + RainbowKit setup
└── services/
    ├── api.ts           # Backend API client
    └── prices.ts        # Token price fetching
```

## Documentation

- [EIP-7702 Architecture](./docs/EIP-7702-TWO-STEP-SWEEP-ARCHITECTURE.md) - Technical architecture for the sweep mechanism

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## License

MIT
