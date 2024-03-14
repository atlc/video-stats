import * as fs from "fs";
import * as path from "path";
import * as cheerio from "cheerio";
import urls from "./urls.json";

const cachePath = path.join(__dirname, "./cache.json");

function format(time: number) {
    let toSeconds = Math.round(time / 1000);
    let hours: number | string = Math.floor(toSeconds / 3600);
    let minutes: number | string = (toSeconds % 3600) / 60;
    let seconds: number | string = Math.round((minutes - Math.floor(minutes)) * 60);
    minutes = Math.floor(minutes);

    hours = hours < 10 ? `0${hours}` : `${hours}`;
    minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${hours}:${minutes}:${seconds}`;
}

export async function GET() {
    try {
        const vids = [];

        for await (const vid of urls) {
            const res = await fetch(vid);
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

            vids.push({ title, url: vid, views, runtime: { ms: runtime, formatted: format(runtime) } });
        }

        const views = vids.reduce((a, b) => a + b.views, 0);
        const runtime = vids.reduce((a, b) => a + b.runtime.ms, 0);

        const aggregated = {
            results: vids,
            total: {
                views: views.toLocaleString(),
                runtime: {
                    ms: runtime,
                    formatted: format(runtime),
                },
            },
        };

        fs.writeFile(cachePath, JSON.stringify(aggregated), (err) => {
            if (err) {
                console.log(`Couldn't write posts to cache - ` + err.message);
            } else {
                console.log("Wrote to cache successfully");
            }
        });
        return Response.json(aggregated);
    } catch (error) {
        return Response.json(error);
    }
}
