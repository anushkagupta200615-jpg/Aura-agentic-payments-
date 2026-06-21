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

    // Simulate Lightning Network (L402) Invoice Generation latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate a mock L402 invoice and macaroon
    const mockInvoice = "lnbc" + Math.floor(payout.amount * 100000) + "n1p..." + Math.random().toString(36).slice(2, 10);
    const mockMacaroon = "AgEDb2" + Math.random().toString(36).slice(2, 12);

    return NextResponse.json({
      success: true,
      isL402: true,
      message: `Payment Required: generated Lightning invoice for ${payout.amount} USDC (approx ${(payout.amount * 1000000).toFixed(0)} sats) to ${payout.creator}`,
      invoice: mockInvoice,
      macaroon: mockMacaroon
    }, { status: 402 });
    
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
