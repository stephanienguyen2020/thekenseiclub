import { ethers } from "ethers";
import { useWalletClient } from "wagmi";
import BettingABI from "@/abi/Betting.json";
const contractAddress = "0xe1C31E56De989192946f096eBA8Ed709C2Ec9003";

export const useBettingService = () => {
  const { data: walletClient } = useWalletClient();

  const createBet = async (
    title: string,
    description: string,
    category: string,
    twitterHandle: string,
    endDate: number,
    joinAmount: number,
    initialPoolAmount: number,
    imageURL: string
  ) => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    console.log("Creating bet with parameters:", {
      title,
      description,
      category,
      twitterHandle,
      endDate,
      joinAmount,
      initialPoolAmount,
      imageURL,
    });

    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      signer
    );
    const tx = await bettingContract.createBet(
      title,
      description,
      category,
      twitterHandle,
      endDate,
      ethers.parseEther(joinAmount.toString()),
      ethers.parseEther(initialPoolAmount.toString()),
      imageURL,
      {
        value:
          ethers.parseEther(joinAmount.toString()) +
          ethers.parseEther(initialPoolAmount.toString()),
      }
    );
    const receipt = await tx.wait();
    return receipt;
  };

  const joinBet = async (
    betId: number,
    support: boolean,
    betAmount: string = "1.0"
  ) => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    console.log("Joining bet with parameters:", {
      betId,
      support,
      betAmount,
    });
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      signer
    );

    const tx = await bettingContract.joinBet(betId, support, {
      value: ethers.parseEther(betAmount), // Use the provided bet amount
      gasLimit: 9000000,
    });
    const receipt = await tx.wait();
    return receipt;
  };

  const closeBet = async (betId: number, outcome: boolean) => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      signer
    );
    const tx = await bettingContract.closeBet(betId, outcome);
    const receipt = await tx.wait();
    return receipt;
  };

  const withdraw = async () => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      signer
    );
    const tx = await bettingContract.withdraw();
    const receipt = await tx.wait();
    return receipt;
  };

  const getAllBets = async () => {
    if (!walletClient) {
      console.warn("Wallet client not found, waiting for connection...");
      return []; // Return empty array if wallet is not connected
    }

    try {
      const provider = new ethers.BrowserProvider(walletClient);
      const bettingContract = new ethers.Contract(
        contractAddress,
        BettingABI,
        provider
      );
      const betCounter = await bettingContract.betCounter();
      console.log("Bet counter:", betCounter);
      const bets = [];
      for (let i = 0; i < betCounter; i++) {
        const betDetails = await bettingContract.getBetDetailsAsStruct(i);
        bets.push({
          id: betDetails[0],
          creator: betDetails[1],
          amount: betDetails[2],
          title: betDetails[3],
          description: betDetails[4],
          category: betDetails[5],
          twitterHandle: betDetails[6],
          endDate: betDetails[7],
          initialPoolAmount: betDetails[8],
          imageURL: betDetails[9],
          isClosed: betDetails[10],
          supportCount: betDetails[11],
          againstCount: betDetails[12],
          outcome: betDetails[13],
        });
      }
      console.log("All bets:", bets);
      return bets;
    } catch (error) {
      console.error("Error in getAllBets:", error);
      return []; // Return empty array on error
    }
  };

  const registerTwitterHandle = async (twitterHandle: string) => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    console.log("Registering Twitter handle:", twitterHandle);
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      signer
    );
    const tx = await bettingContract.registerTwitterHandle(twitterHandle);
    const receipt = await tx.wait();
    return receipt;
  };

  const buyBetCredits = async (amount: string) => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    if (parseFloat(amount) <= 0) {
      throw new Error("Must send some ether");
    }
    console.log("Buying bet credits with amount:", amount);
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      signer
    );
    const tx = await bettingContract.buyBetCredits({
      value: ethers.parseEther(amount),
    });
    const receipt = await tx.wait();
    return receipt;
  };

  const getUserBetCredits = async (user: string) => {
    if (!walletClient) {
      console.warn("Wallet client not found, waiting for connection...");
      return BigInt(0); // Return 0 credits if wallet is not connected
    }

    console.log("Getting bet credits for user:", user);
    const provider = new ethers.BrowserProvider(walletClient);
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      provider
    );
    const userBetCredits = await bettingContract.getUserBetCredits(user);
    console.log("User bet credits:", userBetCredits);
    return userBetCredits;
  };

  const getTwitterHandleAddress = async (twitterHandle: string) => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    console.log("Getting address for Twitter handle:", twitterHandle);
    const provider = new ethers.BrowserProvider(walletClient);
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      provider
    );
    const address = await bettingContract.getTwitterHandleAddress(
      twitterHandle
    );
    return address;
  };

  const withdrawCredits = async (amount: string) => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    const userBetCredits = await getUserBetCredits(
      walletClient.account.address
    );
    if (parseFloat(userBetCredits) < parseFloat(amount)) {
      throw new Error("Insufficient bet credits");
    }
    console.log("Withdrawing bet credits with amount:", amount);
    const provider = new ethers.BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      signer
    );
    const tx = await bettingContract.withdrawCredits(ethers.parseEther(amount));
    const receipt = await tx.wait();
    return receipt;
  };

  const getTwitterHandleByAddress = async (userAddress: string) => {
    if (!walletClient) {
      throw new Error("Wallet client not found");
    }
    const provider = new ethers.BrowserProvider(walletClient);
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      provider
    );
    const filter = bettingContract.filters.TwitterHandleRegistered();
    const events = await bettingContract.queryFilter(filter);
    const matchingEvent = events.reverse().find((event) => {
      const eventLog = event as ethers.EventLog;
      return (
        eventLog.args &&
        eventLog.args[1] && // userAddress is the second parameter
        eventLog.args[1].toLowerCase() === userAddress.toLowerCase()
      );
    });
    if (matchingEvent) {
      const eventLog = matchingEvent as ethers.EventLog;
      return eventLog.args?.[0] as string; // twitterHandle is the first parameter
    }
    return null;
  };

  return {
    createBet,
    joinBet,
    closeBet,
    withdraw,
    getAllBets,
    registerTwitterHandle,
    buyBetCredits,
    getUserBetCredits,
    getTwitterHandleAddress,
    withdrawCredits,
    getTwitterHandleByAddress,
  };
};
