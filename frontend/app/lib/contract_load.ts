import { ethers } from 'ethers';
import { config } from "@/app/config/contract_addresses";

export interface ContractConfig {
    provider: ethers.JsonRpcProvider;
    chainConfig: {
        factory: { address: string };
        nativeLiquidityPool: { address: string };
        LaunchpadAgent: { address: string };
    };
    chainId: number;
}

export async function getContractConfig(): Promise<ContractConfig> {
    const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"
    );

    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
    const chainConfig = config[chainId as keyof typeof config];
    
    if (!chainConfig) {
        throw new Error(`Contract addresses not found for chain ID ${chainId}`);
    }

    return {
        provider,
        chainConfig,
        chainId
    };
}

export function createContractInstance<T extends ethers.BaseContract>(
    address: string, 
    abi: any, 
    provider: ethers.JsonRpcProvider
): T {
    return new ethers.Contract(address, abi, provider) as unknown as T;
}
