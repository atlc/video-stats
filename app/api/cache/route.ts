import db from "@/app/db";
import { FullResults } from "@/app/types";
import time from "@/app/utils/time";

export async function GET() {
    const videos = await db.videos.get.all();
    const [{ views, ms }] = await db.videos.get.stats();

    const aggregated: FullResults = {
        results: videos,
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
