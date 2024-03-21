import { client } from "../connection";
import { URL } from "@/app/types";

const urls = client.db("video_stats").collection("urls");

async function addUrl(url: string) {
    const results = await urls.insertOne({ url });
    return results;
}

async function all() {
    const URLs = await urls.find<URL>({}).toArray();
    return URLs;
}

export default {
    add: addUrl,
    get: { all },
};
