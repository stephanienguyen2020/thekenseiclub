import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import LiquidityPoolABI from "@/abi/NativeLiquidityPool.json";
import { getTokenDetails } from "@/services/memecoin-launchpad";
import { getContractConfig, createContractInstance } from '@/app/lib/contract_load';

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
        const amountInWei = ethers.parseEther(amount.toString());
        const liquidityPoolContract = createContractInstance<LiquidityPoolContract>(
            liquidityPoolAddress, 
            LiquidityPoolABI, 
            provider
        );

        let txData;
        if (swapType === 'SONIC_TO_TOKEN') {
            // Encode the function data for swapEthForToken
            const data = liquidityPoolInterface.encodeFunctionData('swapEthForToken', [
                tokenAddress
            ]);

            // Get estimated tokens out
            const estimatedTokens = await liquidityPoolContract.getEstimatedTokensForEth(tokenAddress, amountInWei);

            txData = {
                to: liquidityPoolAddress,
                data: data,
                value: amountInWei.toString(),
                estimatedOutput: estimatedTokens.toString()
            };
        } else if (swapType === 'TOKEN_TO_SONIC') {
            // Encode the function data for swapTokenForEth
            const data = liquidityPoolInterface.encodeFunctionData('swapTokenForEth', [
                tokenAddress,
                amountInWei
            ]);

            // Get estimated ETH out
            const estimatedEth = await liquidityPoolContract.getEstimatedEthForTokens(tokenAddress, amountInWei);
            console.log(estimatedEth);

            txData = {
                to: liquidityPoolAddress,
                data: data,
                value: '0', // No ETH needed for token to ETH swap
                estimatedOutput: estimatedEth.toString()
            };
        } else {
            return NextResponse.json(
                { error: 'Invalid swap type. Must be ETH_TO_TOKEN or TOKEN_TO_ETH' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            transaction: txData
        });

    } catch (error) {
        console.error('Error preparing swap transaction:', error);
        return NextResponse.json(
            { error: 'Failed to prepare swap transaction' },
            { status: 500 }
        );
    }
}
