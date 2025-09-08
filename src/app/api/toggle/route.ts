import { NextRequest, NextResponse } from "next/server";
import { sqliteCache } from "@/lib/sqliteCache";

// Get all toggle states
export async function GET() {
  try {
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );
    
    const togglePromise = Promise.resolve(sqliteCache.getAllToggleStates());
    
    const toggleStates = await Promise.race([togglePromise, timeoutPromise]);
    
    return NextResponse.json({
      success: true,
      toggleStates,
      total: Object.keys(toggleStates as Record<string, boolean>).length
    });
  } catch (error) {
    console.error("Error fetching toggle states:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch toggle states" },
      { status: 500 }
    );
  }
}

// Set toggle state for a file
export async function POST(request: NextRequest) {
  try {
    // Add timeout for request parsing
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request parsing timeout')), 5000)
    );
    
    const requestPromise = request.json();
    const { fullPath, isToggled } = await Promise.race([requestPromise, timeoutPromise]);
    
    if (!fullPath || typeof isToggled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid request data. fullPath and isToggled are required." },
        { status: 400 }
      );
    }
    
    // Add timeout for database operation
    const dbTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timeout')), 5000)
    );
    
    const dbOperation = Promise.resolve(
      isToggled 
        ? sqliteCache.setToggleState(fullPath, true)
        : sqliteCache.removeToggleState(fullPath)
    );
    
    await Promise.race([dbOperation, dbTimeoutPromise]);
    
    return NextResponse.json({
      success: true,
      message: `Toggle state ${isToggled ? 'enabled' : 'disabled'} for ${fullPath}`
    });
  } catch (error) {
    console.error("Error setting toggle state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set toggle state" },
      { status: 500 }
    );
  }
}

// Clear all toggle states
export async function DELETE() {
  try {
    sqliteCache.clearAllToggleStates();
    
    return NextResponse.json({
      success: true,
      message: "All toggle states cleared"
    });
  } catch (error) {
    console.error("Error clearing toggle states:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear toggle states" },
      { status: 500 }
    );
  }
}