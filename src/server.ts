import express from 'express';
import cors from 'cors';
import { getAggregatedVideoStats, getVideoStats } from './utils';
import videoUrls from '../urls.json';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/stats', async (req, res) => {
    try {
        const videos = await getVideoStats(videoUrls);
        const totals = getAggregatedVideoStats(videos);

        res.json({ totals, videos });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`)); 