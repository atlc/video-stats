import { Total, Video } from "@/app/types";
import { client } from "../connection";

const videos = client.db("video_stats").collection("videos");

async function updateVideoData(data: Video[]) {
    await videos.deleteMany({});
    const results = await videos.insertMany(data);
    return results;
}

async function getVideoData() {
    const vids = await videos.find<Video>({}).toArray();
    return vids;
}

async function getVideoStats() {
    const total = await videos
        .aggregate<Total>([
            {
                _id: null,
                views: { $sum: "$views" },
                ms: { $sum: "$runtime.ms" },
            },
        ])
        .toArray();
    return total;
}

export default {
    get: {
        all: getVideoData,
        stats: getVideoStats,
    },
    update: updateVideoData,
};
