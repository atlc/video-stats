"use client";
import { useState, useEffect } from "react";

interface AggregatedData {
    results: {
        title: string;
        url: string;
        views: number;
        runtime: {
            ms: number;
            formatted: string;
        };
    }[];
    total: {
        views: string;
        runtime: {
            ms: number;
            formatted: string;
        };
    };
}

export default function Home() {
    const [data, setData] = useState<AggregatedData>();

    function getStats() {
        fetch("/api/stats/cache")
            .then((res) => res.json())
            .then((data) => {
                if ("total" in data) {
                    localStorage.setItem("data", JSON.stringify(data));
                    setData(data);
                }
                fetch("/api/stats")
                    .then((res) => res.json())
                    .then((data) => {
                        if ("total" in data) {
                            localStorage.setItem("data", JSON.stringify(data));
                            setData(data);
                        }
                    });
            });
    }

    useEffect(() => {
        document.body.className = "bg-slate-900";
        getStats();
    }, []);

    return (
        <main className="flex flex-col items-center justify-between min-h-screen p-6 p-sm-12 p-md-24">
            {!data && <h1 className="text-center text-red-500">Loading</h1>}
            {data && (
                <>
                    <h1 className="text-4xl text-center text-cyan-700">
                        Total Views: {data.total.views} | Runtime: {data.total.runtime.formatted}
                    </h1>

                    <ul className="mt-10 list-disc list-inside">
                        {data.results.map((r) => (
                            <li key={r.title} className="sm:text-sm md:text-lg lg:text-2xl">
                                <a className="text-cyan-500" href={r.url}>
                                    {r.title.replace(" - YouTube", "")}
                                </a>
                                <span className="">
                                    {" "}
                                    <span className="text-yellow-500">{r.views.toLocaleString()}</span> views,{" "}
                                    <span className="text-green-200">{r.runtime.formatted}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </main>
    );
}
