import { NextRequest, NextResponse } from "next/server";

const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!ADMIN_API_KEY) {
      console.error("ADMIN_API_KEY is not set in environment variables");
      return new NextResponse(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const response = new NextResponse(
      JSON.stringify(
        apiKey === ADMIN_API_KEY
          ? { message: "Authentication successful" }
          : { error: "Invalid API key" },
      ),
      {
        status: apiKey === ADMIN_API_KEY ? 200 : 401,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Authentication failed" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export const runtime = "edge";
