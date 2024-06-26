import { ObjectId } from "mongodb";

export interface Video {
    _id: ObjectId;
    index: number;
    title: string;
    url: string;
    views: number;
    date: string;
    runtime: {
        ms: number;
        formatted: string;
    };
}

export interface Total {
    views: number;
    ms: number;
}

export interface ConsolidatedStats {
    views: string;
    runtime: {
        ms: number;
        formatted: string;
    };
}

export interface FullResults {
    results: Video[];
    total: {
        views: string;
        runtime: {
            ms: number;
            formatted: string;
        };
    };
}

export interface URL {
    _id: ObjectId;
    url: string;
}
