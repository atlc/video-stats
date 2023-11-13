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
    const [loaderText, setLoaderText] = useState("Loading video stats, this may take up to 1 minute to scrape");
    const [intervalID, setIntervalID] = useState<NodeJS.Timeout>();

    function getStats() {
        fetch("/api/stats")
            .then((res) => res.json())
            .then((data) => {
                if ("total" in data) {
                    localStorage.setItem("data", JSON.stringify(data));
                    setData(data);
                    setLoaderText("");
                } else {
                    setLoaderText(data.message);
                }
            });
    }

    function loaderTimer() {
        let timer = 45;

        const interval = setInterval(() => {
            if (timer > 0) {
                setLoaderText(`Loading video stats, ETA ${timer--} seconds...`);
            } else {
                clearInterval(interval);
            }
        }, 1000);
        setIntervalID(interval);
    }

    function refresh() {
        localStorage.removeItem("data");
        if (intervalID) {
            clearInterval(intervalID);
        }
        setData(undefined);
        loaderTimer();
    }

    useEffect(() => {
        document.body.className = "bg-slate-900";
        const lsData = localStorage.getItem("data");
        // if (lsData) {
        //     setData(JSON.parse(lsData));
        //     setLoaderText("");
        //     return;
        // }

        loaderTimer();
        getStats();

        return () => {
            clearInterval(intervalID);
        };
    }, []);

    return (
        <main className="flex flex-col items-center justify-between min-h-screen p-6 p-sm-12 p-md-24">
            {loaderText && (
                <div>
                    <h1 className="my-3 text-3xl text-center text-red-400">{loaderText}</h1>
                    <div className="flex items-center justify-center">
                        <img src="https://i.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.webp" />
                    </div>
                </div>
            )}
            {data && (
                <>
                    <h1 className="text-4xl text-center text-cyan-700">
                        Total Views: {data.total.views} | Runtime: {data.total.runtime.formatted}
                    </h1>

                    <h2 className="my-2 text-3xl text-cyan-900">
                        Data pulled from cache.{" "}
                        <span onClick={refresh} className="p-2 rounded-md bg-slate-700 text-cyan-600">
                            Manually reload?
                        </span>
                    </h2>

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
