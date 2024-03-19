import * as fs from "fs";
import * as path from "path";

const cachePath = path.join(__dirname, "../cache.json");

export async function GET() {
    console.log(`Attemping to read from file cache...`);

    if (!fs.existsSync(cachePath)) {
        console.log("Unable to read from file cache :(");
        return Response.json({});
    } else {
        const cache = JSON.parse(fs.readFileSync(cachePath).toString());
        console.log(`Successfully retrieved data from file cache`);
        console.log({ cache });
        return Response.json(cache);
    }
}
