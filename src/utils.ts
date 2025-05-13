import * as cheerio from 'cheerio';

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

export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
} 

export async function getVideoStats(urls: string[]): Promise<Video[]> {
    console.log('Fetching video stats...\n');
    const time = Date.now();
    
    const videos = urls.map(async (url, index) => {
        const res = await fetch(url);
        const videoHTML = await res.text();
        const selector = cheerio.load(videoHTML);
        const title = selector("title").text();
        const info = selector("body").text();

        const viewCountStrIndex = info.search(/{"viewCount":{"/g);
        const viewCountStripped = info.substring(viewCountStrIndex, viewCountStrIndex + 50);
        const viewCountParsed = viewCountStripped.match(/\d+/g);
        const views = viewCountParsed ? parseInt(viewCountParsed.join("")) : 0;

        const publishDateIndex = info.search(/"publishDate":"\d{4}-\d{2}-\d{2}/g);
        const strippedDate = info.substring(publishDateIndex, publishDateIndex + 50);
        const dateMatches = strippedDate.match(/\d{4}-\d{2}-\d{2}/g);
        const [parsedDate] = dateMatches || [""];

        const commentCountStringIndex = info.search(/"contextualInfo":{"/g);
        const commentCountStringStripped = info.substring(commentCountStringIndex, commentCountStringIndex + 50);
        const [commentCountParsed] = commentCountStringStripped.match(/\d+/g) || ["0"];
        const comments = parseInt(commentCountParsed);

        const runtimeRaw = info.split(/approxDurationMs/g)[1];
        const runtimeStripped = runtimeRaw.substring(0, 15);
        const runtimeParsed = runtimeStripped.replace(/[^0-9]/g, "");
        const runtime = runtimeParsed ? parseInt(runtimeParsed) : 0;

        console.log(`(${index + 1}/${urls.length})\t[${parsedDate}]\t${views} views\t${comments} comments\t${title}`);

        return {
            index,
            title,
            url,
            views,
            comments,
            date: parsedDate,
            runtime: {
                ms: runtime,
                formatted: formatDuration(runtime)
            }
        };
    });

    const results = await Promise.all(videos);

    const count = videos.length;
    const duration = (Date.now() - time)
    const seconds = duration / 1000;
    const average = Math.round(duration / count);

    console.log(`\n\nScraping ${count} videos took ${seconds}s [avg: ${average}ms]`)

    return results;
}

export function getAggregatedVideoStats(videos: Video[]) {
    const { runtime, views, comments } = videos.reduce((a, b) => ({ runtime: a.runtime + b.runtime.ms, views: a.views + b.views, comments: a.comments + b.comments  }), { runtime: 0, views: 0, comments: 0 });

    return {
        views,
        comments,
        runtime: formatDuration(runtime)
    }
}