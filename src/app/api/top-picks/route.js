import { NextResponse } from "next/server";
import { fetchTopPicksProjects } from "@/app/_global_components/masterFunction";


export async function GET() {
  try {
    const topProjects = await fetchTopPicksProjects();
    return NextResponse.json({
      success: true,
      topProject: topProjects[0] ?? null,
      topProjects,
      _meta: {
        rotationIntervalSeconds: 30,
      },
    });
  } catch (error) {
    console.error("Top picks API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch top picks",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
