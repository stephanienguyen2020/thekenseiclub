import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import FactoryABI from "@/abi/Factory.json";
import { getContractConfig, createContractInstance } from '@/app/lib/contract_load';
import { getTokenDetails } from '@/services/memecoin-launchpad';

interface FactoryContract extends ethers.BaseContract {
    getPriceForTokens(tokenAddress: string, amount: bigint): Promise<bigint>;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tokenAddress, amount } = body;

        if (!tokenAddress || !amount) {
            return NextResponse.json(
                { error: 'Token address and amount are required' },
                { status: 400 }
            );
        }
        const tokenDetails = await getTokenDetails(tokenAddress);
        if (!tokenDetails) {
            return NextResponse.json(
                { error: 'Token not found' },
                { status: 404 }
            );
        }
        if (tokenDetails.token.isOpen === false) {
            return NextResponse.json(
                { error: 'Token is not open for buying' },
                { status: 400 }
            );
        }

        // Get contract configuration
        const { provider, chainConfig } = await getContractConfig();

        const factoryAddress = chainConfig.factory.address;
        const factoryInterface = new ethers.Interface(FactoryABI);
        const amountInWei = ethers.parseEther(amount.toString());

        // Create contract instance
        const factoryContract = createContractInstance<FactoryContract>(
            factoryAddress,
            FactoryABI,
            provider
        );

        // Encode the function data for the buy function
        const data = factoryInterface.encodeFunctionData('buy', [
            tokenAddress,
            amountInWei
        ]);

        // Get the price for tokens
        const price = await factoryContract.getPriceForTokens(tokenAddress, amountInWei);

        // Prepare the transaction data
        const txData = {
            to: factoryAddress,
            data: data,
            value: price.toString()
        };

        return NextResponse.json({
            success: true,
            transaction: [txData]
        });

    } catch (error) {
        console.error('Error preparing buy transaction:', error);
        return NextResponse.json(
            { error: 'Failed to prepare buy transaction' },
            { status: 500 }
        );
    }
}
