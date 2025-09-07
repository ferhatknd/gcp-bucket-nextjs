import { NextRequest, NextResponse } from "next/server";
import { sqliteCache } from "@/lib/sqliteCache";

// Get all toggle states
export async function GET() {
  try {
    const toggleStates = sqliteCache.getAllToggleStates();
    
    return NextResponse.json({
      success: true,
      toggleStates,
      total: Object.keys(toggleStates).length
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
    const { fullPath, isToggled } = await request.json();
    
    if (!fullPath || typeof isToggled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid request data. fullPath and isToggled are required." },
        { status: 400 }
      );
    }
    
    if (isToggled) {
      sqliteCache.setToggleState(fullPath, true);
    } else {
      sqliteCache.removeToggleState(fullPath);
    }
    
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