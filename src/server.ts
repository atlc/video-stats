import { createServer } from 'node:http';
import { getAggregatedVideoStats, getVideoStats } from './utils';
import videoUrls from '../urls.json';

const port = process.env.PORT || 3000;

const server = createServer(async (req, res) => {   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/api/stats') {
        try {
            const videos = await getVideoStats(videoUrls);
            const totals = getAggregatedVideoStats(videos);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ totals, videos }));
        } catch (error) {
            console.error("Error fetching stats:", error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Failed to fetch stats" }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Not found" }));
    }
});

server.listen(port, () => console.log(`Server running on port ${port}`)); 