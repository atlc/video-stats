You need to have [the urls.json file](./urls.json) populated with an array of your youtube videos' urls. The `/api/stats` endpoint will return data in the results structure below, with totals being the aggregated data across all videos, and videos being an array of statistics for each individual video.

```ts
interface Results {
    totals: {
        views: number;
        comments: number;
        runtime: string;
    },
    videos: Video[];
}

interface Video {
    index: number;
    title: string;
    url: string;
    views: number;
    comments: number;
    date: string;
    runtime: {
        ms: number;
        formatted: string;
    };
}
```