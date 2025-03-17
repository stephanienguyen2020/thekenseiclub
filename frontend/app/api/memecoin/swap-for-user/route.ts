import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import LiquidityPoolABI from "@/abi/NativeLiquidityPool.json";
import { getTokenDetails } from "@/services/memecoin-launchpad";
import { getContractConfig, createContractInstance } from '@/app/lib/contract_load';
import TokenABI from "@/abi/Token.json";

interface LiquidityPoolContract extends ethers.BaseContract {
    getEstimatedTokensForEth(tokenAddress: string, amount: bigint): Promise<bigint>;
    getEstimatedEthForTokens(tokenAddress: string, amount: bigint): Promise<bigint>;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tokenAddress, amount, swapType } = body;

        if (!tokenAddress || !amount || !swapType) {
            return NextResponse.json(
                { error: 'Token address, amount, and swap type are required' },
                { status: 400 }
            );
        }

        // Get contract configuration
        const { provider, chainConfig } = await getContractConfig();

        const tokenDetails = await getTokenDetails(tokenAddress);
        if (!tokenDetails) {
            return NextResponse.json(
                { error: 'Token not found' },
                { status: 404 }
            );
        }
        if (tokenDetails.token.isOpen === true) {
            return NextResponse.json(
                { error: 'Token is not open for trading' },
                { status: 400 }
            );
        }

        const liquidityPoolAddress = chainConfig.nativeLiquidityPool.address;
        const liquidityPoolInterface = new ethers.Interface(LiquidityPoolABI);
        const tokenInterface = new ethers.Interface(TokenABI);
        const amountInWei = ethers.parseEther(amount.toString());
        const liquidityPoolContract = createContractInstance<LiquidityPoolContract>(
            liquidityPoolAddress, 
            LiquidityPoolABI, 
            provider
        );

        if (swapType === 'SONIC_TO_TOKEN') {
            // For ETH to token swap, we only need one transaction
            // The contract will handle the token transfer internally
            const data = liquidityPoolInterface.encodeFunctionData('swapEthForToken', [
                tokenAddress
            ]);

            // Get estimated tokens out
            const estimatedTokens = await liquidityPoolContract.getEstimatedTokensForEth(tokenAddress, amountInWei);

            return NextResponse.json({
                success: true,
                transaction: [{
                    to: liquidityPoolAddress,
                    data: data,
                    value: amountInWei.toString(),
                    estimatedOutput: estimatedTokens.toString(),
                    transactionType: 'swap'
                }]
            });
        } else if (swapType === 'TOKEN_TO_SONIC') {
            // For token to ETH swap, we need two transactions in sequence:
            // 1. Approve the liquidity pool to spend tokens
            // 2. Call swapTokenForEth which will use transferFrom

            // Prepare approval transaction
            const approveData = tokenInterface.encodeFunctionData('approve', [
                liquidityPoolAddress,
                amountInWei
            ]);

            // Prepare swap transaction
            const swapData = liquidityPoolInterface.encodeFunctionData('swapTokenForEth', [
                tokenAddress,
                amountInWei
            ]);

            // Get estimated ETH out
            const estimatedEth = await liquidityPoolContract.getEstimatedEthForTokens(tokenAddress, amountInWei);

            // Return both transactions in sequence
            return NextResponse.json({
                success: true,
                transaction: [
                    {
                        to: tokenAddress,
                        data: approveData,
                        value: '0',
                        transactionType: 'approve',
                        description: 'Approve liquidity pool to spend tokens'
                    },
                    {
                        to: liquidityPoolAddress,
                        data: swapData,
                        value: '0',
                        estimatedOutput: estimatedEth.toString(),
                        transactionType: 'swap',
                        description: 'Swap tokens for ETH'
                    }
                ]
            });
        } else {
            return NextResponse.json(
                { error: 'Invalid swap type. Must be SONIC_TO_TOKEN or TOKEN_TO_SONIC' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Error preparing swap transaction:', error);
        return NextResponse.json(
            { error: 'Failed to prepare swap transaction' },
            { status: 500 }
        );
    }
}
