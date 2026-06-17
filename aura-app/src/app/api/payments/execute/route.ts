import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { payout } = await request.json();

    if (!payout || !payout.amount || !payout.creator) {
      return NextResponse.json(
        { error: "Invalid payout payload" },
        { status: 400 }
      );
    }

    // Simulate Blockchain execution latency on Avalanche Testnet
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate a mock transaction hash
    const txHash = "0x" + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10) + "...";

    return NextResponse.json({
      success: true,
      message: `Successfully executed on-chain micro-payment of ${payout.amount} USDC to ${payout.creator}`,
      txHash: txHash
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
