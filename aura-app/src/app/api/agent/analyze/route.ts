import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const { logs } = await request.json();

    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json(
        { error: "No attention logs provided" },
        { status: 400 }
      );
    }

    const HOURLY_RATE_USDC = 0.50; 
    let totalTimeMs = logs.reduce((acc, log) => acc + log.timeSpentMs, 0);

    if (totalTimeMs < 3000) {
      return NextResponse.json({
        success: false,
        message: `Total interaction time (${(totalTimeMs / 1000).toFixed(1)}s) below payment threshold.`,
        payouts: []
      });
    }

    // Check if API key is provided for real LLM reasoning
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const { object } = await generateObject({
          model: google("gemini-1.5-pro"),
          schema: z.object({
            message: z.string().describe("A professional log message explaining the reasoning behind the payouts."),
            payouts: z.array(z.object({
              creator: z.string(),
              title: z.string(),
              amount: z.number().describe("The calculated USDC amount to pay"),
            }))
          }),
          prompt: `You are Aura, an autonomous payment agent. You have an hourly budget of ${HOURLY_RATE_USDC} USDC to distribute to creators based on a user's attention.
          
          Here is the user's attention telemetry log (time spent in milliseconds):
          ${JSON.stringify(logs, null, 2)}
          
          Analyze this data. Highly technical content (like code or github repos) should receive a 1.5x multiplier on their payout compared to normal videos or articles. 
          Calculate the exact payouts in USDC and return the results.`,
        });

        return NextResponse.json({
          success: true,
          message: object.message,
          payouts: object.payouts,
        });

      } catch (llmError) {
        console.error("LLM Error, falling back to algorithmic distribution:", llmError);
      }
    }

    // Fallback: Algorithmic Distribution (if no API key or LLM fails)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const payouts = logs.map((log) => {
      const hoursSpent = log.timeSpentMs / (1000 * 60 * 60);
      const amount = Math.max(0.0001, hoursSpent * HOURLY_RATE_USDC);
      return { creator: log.creator, title: log.title, amount: amount };
    });

    return NextResponse.json({
      success: true,
      message: `(Fallback Mode) Identified ${logs.length} interactions. Calculated fair distribution based on strict time mechanics.`,
      payouts,
    });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
