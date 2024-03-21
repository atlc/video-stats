import * as cheerio from "cheerio";
import db from "@/app/db";
import { FullResults, Video } from "@/app/types";
import time from "@/app/utils/time";

export async function GET() {
    console.log(`Attemping to load stats live...`);

    try {
        const urls = await db.urls.get.all();

        const vids: Video[] = [];

        for await (const { _id, url } of urls) {
            const res = await fetch(url);
            const videoHTML = await res.text();
            const selector = cheerio.load(videoHTML);

            const title = selector("title").text();

            const info = selector("body").text();

            const viewCountStrIndex = info.search(/{"viewCount":{"/g);
            const stripped = info.substring(viewCountStrIndex, viewCountStrIndex + 50);
            const parsed = stripped.match(/\d+/g);
            const views = parsed ? parseInt(parsed.join("")) : 0;

            const runtimeRaw = info.split(/approxDurationMs/g)[1];
            const runtimeStripped = runtimeRaw.substring(0, 15);
            const runtimeParsed = runtimeStripped.replace(/[^0-9]/g, "");
            const runtime = runtimeParsed ? parseInt(runtimeParsed) : 0;

            const new_entry = { _id, title, url, views, runtime: { ms: runtime, formatted: time.milliseconds.to.HHMMSS(runtime) } };

            vids.push(new_entry);
        }

        await db.videos.update(vids);

        const [{ views, ms }] = await db.videos.get.stats();

        const aggregated: FullResults = {
            results: vids,
            total: {
                views: views.toLocaleString(),
                runtime: {
                    ms,
                    formatted: time.milliseconds.to.HHMMSS(ms),
                },
            },
        };

        return Response.json(aggregated);
    } catch (error) {
        console.log("Unable to gets stats live - an error occurred:");
        console.log(error);

        return Response.json(error);
    }
}
