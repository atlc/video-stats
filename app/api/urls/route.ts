import db from "@/app/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { url } = await req.json();
    const results = await db.urls.add(url);
    return Response.json(results);
}
