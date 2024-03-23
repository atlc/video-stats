import db from "@/app/db";
import { FullResults } from "@/app/types";
import time from "@/app/utils/time";
import { NextResponse } from "next/server";

export async function GET() {
    const videos = await db.videos.get.all();
    if (!videos) return NextResponse.json(null, { status: 500 });

    const [results] = await db.videos.get.stats();
    if (!results) return NextResponse.json(null, { status: 500 });

    const { views, ms } = results;
    if (!views || !ms) return NextResponse.json(null, { status: 500 });

    const aggregated: FullResults | any = {
        results: videos.reverse(),
        total: {
            views: views.toLocaleString(),
            runtime: {
                ms,
                formatted: time.milliseconds.to.HHMMSS(ms),
            },
        },
    };

    return Response.json(aggregated);
}
