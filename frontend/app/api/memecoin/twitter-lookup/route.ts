import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import LaunchpadAgentABI from '@/abi/LaunchpadAgent.json';
import { config } from '@/app/config/contract_addresses';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const twitterHandle = searchParams.get('handle');
    const address = searchParams.get('address');

    // Validate input - require either handle or address
    if (!twitterHandle && !address) {
      return NextResponse.json(
        { error: 'Either Twitter handle or address is required' },
        { status: 400 }
      );
    }

    // Get contract address based on the current chain
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
    const contractAddress = config[chainId as keyof typeof config]?.LaunchpadAgent?.address;
    
    if (!contractAddress) {
      return NextResponse.json(
        { error: `LaunchpadAgent contract address not found for chain ID ${chainId}` },
        { status: 500 }
      );
    }

    // Create a provider
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'
    );

    // Create contract instance
    const launchpadAgent = new ethers.Contract(
      contractAddress,
      LaunchpadAgentABI,
      provider
    );

    // If Twitter handle is provided, look up the address
    if (twitterHandle) {
      const userAddress = await launchpadAgent.getTwitterHandleAddress(twitterHandle);
      
      // Check if the address is valid (not zero address)
      if (userAddress === ethers.ZeroAddress) {
        return NextResponse.json(
          { error: 'Twitter handle not registered' },
          { status: 404 }
        );
      }
      
      // Get user token credits
      const tokenCredits = await launchpadAgent.getUserTokenCredits(userAddress);
      
      return NextResponse.json({ 
        twitterHandle, 
        userAddress,
        tokenCredits: tokenCredits.toString(),
        formattedTokenCredits: ethers.formatEther(tokenCredits)
      });
    }
    
    // If address is provided, look up the Twitter handle
    if (address) {
        // Validate the address format
        const validAddress = ethers.getAddress(address);
        
        // Get user token credits
        const tokenCredits = await launchpadAgent.getUserTokenCredits(validAddress);
        
        // Get all TwitterHandleRegistered events
        const filter = launchpadAgent.filters.TwitterHandleRegistered();
        const events = await launchpadAgent.queryFilter(filter);
        
        // Find the most recent event where the registered address matches our target
        const matchingEvent = events
          .reverse()
          .find(event => {
            const eventLog = event as ethers.EventLog;
            return eventLog.args && 
                  eventLog.args[1] && // userAddress is the second parameter
                  eventLog.args[1].toLowerCase() === validAddress.toLowerCase();
          });

        if (matchingEvent) {
          const eventLog = matchingEvent as ethers.EventLog;
          const handle = eventLog.args?.[0] as string; // twitterHandle is the first parameter
          
          return NextResponse.json({ 
            userAddress: validAddress,
            twitterHandle: handle,
            tokenCredits: tokenCredits.toString(),
            formattedTokenCredits: ethers.formatEther(tokenCredits)
          });
        } else {
          // Return just the address and token credits if no Twitter handle is found
          return NextResponse.json({ 
            userAddress: validAddress,
            twitterHandle: null,
            tokenCredits: tokenCredits.toString(),
            formattedTokenCredits: ethers.formatEther(tokenCredits)
          });
        }
    }
  } catch (error) {
    console.error('Error in Twitter lookup API:', error);
    return NextResponse.json(
      { error: 'Failed to perform lookup' },
      { status: 500 }
    );
  }
} 