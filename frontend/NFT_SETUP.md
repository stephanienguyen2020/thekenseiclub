# NFT Voting Feature Setup

This document explains how to set up the NFT minting feature for governance voting.

## Overview

When users successfully vote on a proposal, they will automatically receive a soulbound NFT as proof of their participation. The NFT contains:

- Token information (name, symbol)
- Proposal title they voted on
- Token logo as the NFT image
- Governance participation proof

## Environment Variables

Add the following environment variable to your `.env.local` file in the frontend directory:

```bash
# NFT Package ID for governance voting NFTs
NEXT_PUBLIC_NFT_PACKAGE_ID=0x_your_deployed_nft_package_id_here
```

## Smart Contract Deployment

1. Deploy the soulbound NFT contract from `move/nft-soulbound/sources/soulbound_nft.move`
2. Copy the deployed package ID
3. Set the `NEXT_PUBLIC_NFT_PACKAGE_ID` environment variable

## How It Works

1. User votes on a proposal
2. Vote is recorded in the database
3. NFT is minted using the `mint_to_sender` function from the soulbound NFT contract
4. NFT contains:
   - Name: "{TOKEN_SYMBOL} Governance Vote"
   - Description: "Voted on proposal '{PROPOSAL_TITLE}' for {TOKEN_NAME} ({TOKEN_SYMBOL}) token governance."
   - URL: Token's logo image
5. A popup displays the minted NFT with its details
6. User can view the transaction on the Sui explorer

## Components Added

- `services/nftService.ts` - Handles NFT minting logic and fetching user NFTs
- `components/nft-popup.tsx` - Displays NFT information after minting
- `app/dashboard/nfts/page.tsx` - Lists all user's NFTs in a collection view
- Updated `app/marketplace/[id]/page.tsx` - Integrated NFT minting into voting flow
- Updated `app/components/dashboard/sidebar.tsx` - Added "My NFT" menu item

## Features

- ✅ Automatic NFT minting after successful vote
- ✅ Beautiful popup showing NFT details
- ✅ Link to view transaction on Sui explorer
- ✅ Error handling (voting continues even if NFT minting fails)
- ✅ Soulbound NFTs (cannot be transferred unless contract allows it)
- ✅ **NEW:** My NFT collection page in dashboard
- ✅ **NEW:** Grid view of all user's governance NFTs
- ✅ **NEW:** Direct links to view NFTs on Sui explorer

## My NFT Collection Features

The new "My NFT" menu in the dashboard sidebar provides:

1. **Collection Overview:** See all your governance NFTs in one place
2. **Beautiful Grid Layout:** Cards showing NFT images, names, and descriptions
3. **NFT Details:** Object IDs and descriptions for each NFT
4. **Explorer Links:** Click to view any NFT on the Sui blockchain explorer
5. **Empty State:** Helpful guidance when you don't have any NFTs yet
6. **Responsive Design:** Works on desktop and mobile devices

## Navigation

Access your NFT collection through:

- Dashboard → My NFT (in the sidebar)
- Direct URL: `/dashboard/nfts`

## Troubleshooting

If NFT minting fails:

1. Check that `NEXT_PUBLIC_NFT_PACKAGE_ID` is set correctly
2. Ensure the NFT contract is deployed on the correct network
3. Check browser console for error messages
4. Verify user has sufficient gas for the NFT minting transaction

The voting functionality will continue to work even if NFT minting fails.
