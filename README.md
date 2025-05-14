You need to have [the urls.json file](./urls.json) populated with an array of your youtube videos' urls. The `/api/stats` endpoint will return data in the Results structure below, with `totals` representing the aggregated data across all videos, and `videos` being an array of statistics for each individual video.

```ts
interface Results {
    totals: {
        views: number;
        runtime: Runtime;
    },
    videos: Video[];
}

interface Video {
    index: number;
    title: string;
    url: string;
    views: number;
    date: string;
    runtime: Runtime;
}

interface Runtime {
    ms: number;
    formatted: string;
};
```