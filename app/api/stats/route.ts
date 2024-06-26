import * as cheerio from "cheerio";
import db from "@/app/db";
import { FullResults, Video } from "@/app/types";
import time from "@/app/utils/time";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET() {
    console.log(`Attemping to load stats live...`);
    reload_stats();
    return Response.json({ message: "Pending", status: 202 });
}

async function reload_stats() {
    console.time("RefreshStats");

    try {
        const urls = await db.urls.get.all();

        const vids: Video[] = [];

        for await (const [index, { _id, url }] of urls.entries()) {
            const res = await fetch(url);
            const videoHTML = await res.text();
            const selector = cheerio.load(videoHTML);

            const title = selector("title").text();
            const info = selector("body").text();

            const viewCountStrIndex = info.search(/{"viewCount":{"/g);
            const stripped = info.substring(viewCountStrIndex, viewCountStrIndex + 50);
            const parsed = stripped.match(/\d+/g);
            const views = parsed ? parseInt(parsed.join("")) : 0;

            const publishDateIndex = info.search(/"publishDate":"\d{4}-\d{2}-\d{2}/g);
            const strippedDate = info.substring(publishDateIndex, publishDateIndex + 50);
            const dateMatches = strippedDate.match(/\d{4}-\d{2}-\d{2}/g);
            const [parsedDate] = dateMatches || "";

            const runtimeRaw = info.split(/approxDurationMs/g)[1];
            const runtimeStripped = runtimeRaw.substring(0, 15);
            const runtimeParsed = runtimeStripped.replace(/[^0-9]/g, "");
            const runtime = runtimeParsed ? parseInt(runtimeParsed) : 0;

            const new_entry = { _id, index, title, url, views, date: parsedDate, runtime: { ms: runtime, formatted: time.milliseconds.to.HHMMSS(runtime) } };

            vids.push(new_entry);

            console.log(`(${index + 1}/${urls.length})\t[${parsedDate}]\t${views} views\t${title}`);
        }
        await db.videos.update(vids);

        console.timeEnd("RefreshStats");
    } catch (error) {
        console.log("Unable to gets stats live - an error occurred:");
        console.log(error);
    }
}
