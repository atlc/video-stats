import * as fs from "fs";
import * as path from "path";

const cachePath = path.join(__dirname, "../cache.json");

export async function GET() {
    if (!fs.existsSync(cachePath)) return Response.json({});

    const cache = JSON.parse(fs.readFileSync(cachePath).toString());
    return Response.json(cache);
}
