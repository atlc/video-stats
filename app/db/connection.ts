import { MongoClient, ServerApiVersion } from "mongodb";

const url = process.env.MONGO_URL;

if (!url) {
    console.log("Missing mongo url");
    process.exit(1);
}

export const client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

await client.connect();
