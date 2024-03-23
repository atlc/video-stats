"use client";
import { useState, useEffect } from "react";
import { FullResults } from "./types";
import time from "./utils/time";

type SORT_KEY = "index" | "views" | "runtime";

const CACHE_KEY = "video_cache";

export default function Home() {
    const [data, setData] = useState<FullResults>();
    const [sorter, setSorter] = useState<SORT_KEY>("index");
    const [showInput, setShowInput] = useState(false);
    const [newUrl, setNewUrl] = useState("");

    function addURL() {
        fetch("/api/urls", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: newUrl }),
        })
            .then((res) => res.json())
            .then(console.log)
            .catch(console.error)
            .finally(() => setNewUrl(""));
    }

    function getStats() {
        fetch("/api/stats/cache")
            .then((res) => {
                console.log("Fetching from file cache");
                return res.json();
            })
            .then((data: FullResults) => {
                if (data && "total" in data) {
                    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                    setData(data);
                }
                console.log("Fetching live data");

                fetch(`/api/stats`)
                    .then((res) => res.json())
                    .then((data) => {
                        if (!data.status || data.status !== 202) return;
                        setTimeout(() => {
                            fetch("/api/stats/cache")
                                .then((res) => {
                                    console.log("Fetching from updated cache");
                                    return res.json();
                                })
                                .then((data) => {
                                    console.log("Retrieved newest data");
                                    console.log({ data });
                                    if (data && "total" in data) {
                                        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                                        setData(data);
                                    }
                                });
                        }, 20 * 1000);
                    });
            });
    }

    function handleSort(name: SORT_KEY) {
        if (name === sorter) {
            const reversed = data!.results.reverse();
            setData({ ...data!, results: reversed });
        } else {
            console.log(`Sorting by ${name}`);
            const resorted: FullResults["results"] = data!.results
                .map((r) => ({ ...r, runtime: r.runtime.ms }))
                .sort((a, b) => a[name] - b[name])
                .map((r) => ({ ...r, runtime: { ms: r.runtime, formatted: time.milliseconds.to.HHMMSS(r.runtime) } }));
            setData({ ...data!, results: resorted });
        }
        setSorter(name);
    }

    useEffect(() => {
        const cachedData = localStorage.getItem(CACHE_KEY);

        if (cachedData) {
            setData(JSON.parse(cachedData));
            console.log("Video stats set from localStorage");
        }

        document.body.className = "bg-slate-900";
        getStats();
    }, []);

    return (
        <main className="flex flex-col items-center justify-between min-h-screen p-6 p-sm-12 p-md-24">
            {showInput && (
                <div className="p-10 mt-10 bg-red-800 rounded-lg">
                    <input className="p-2 rounded-md text-slate-900" type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                    <div>
                        <button className="p-2 mx-2 mt-4 bg-red-400 rounded-lg" onClick={addURL}>
                            Add URL
                        </button>
                        <button className="p-2 mx-2 mt-4 bg-red-400 rounded-lg" onClick={() => setShowInput(false)}>
                            Hide Panel
                        </button>
                    </div>
                    <p className="p-1 mt-4">
                        Adding <span className="text-sky-300">"{newUrl}"</span>
                    </p>
                </div>
            )}

            <h1 className="text-3xl text-center text-sky-300">About this app:</h1>
            <h2 className="mt-5 text-lg text-center text-sky-300">
                This is a Next.js + Typescript app compiling stats for a few of the public videos I've done for work. I typically prefer relational DBs but this
                app is taking advantage of MongoDB to store a collection of URLs and a collection of the videos' stats. Upon loading the app, it will first
                check if the video stats are cached in localStorage while fetching the more up-to-date cached data from Mongo. While those are happening, the
                process of scraping all the live stats is kicking off in the background, after which it'll update Mongo and localStorage.
            </h2>

            {!data && <h1 className="text-center text-red-500">Loading</h1>}
            {data && (
                <>
                    <div className="flex items-center justify-between mt-8">
                        <button
                            onClick={() => handleSort("index")}
                            className={`p-2 rounded-lg mx-2 text-3xl text-center ${sorter === "index" ? "bg-sky-600" : "bg-sky-900"}`}
                        >
                            Latest
                        </button>
                        <button
                            onClick={() => handleSort("views")}
                            className={`p-2 rounded-lg mx-2 text-3xl text-center ${sorter === "views" ? "bg-sky-600" : "bg-sky-900"}`}
                        >
                            Popular
                        </button>
                        <button
                            onClick={() => handleSort("runtime")}
                            className={`p-2 rounded-lg mx-2 text-3xl text-center ${sorter === "runtime" ? "bg-sky-600" : "bg-sky-900"}`}
                        >
                            Longest
                        </button>
                    </div>

                    <ul className="mt-10 list-disc list-inside">
                        <li className="flex my-5 sm:text-sm md:text-lg lg:text-2xl md:my-1">
                            <span className="flex-auto text-3xl text-center w-90 text-sky-500">Video</span>
                            <span>
                                <span className="flex-auto w-5 text-green-300 ">Views</span>
                                <span className="mx-2 text-sky-500">|</span>
                                <span className="flex-auto w-5 text-yellow-500 ">Runtime</span>
                            </span>
                        </li>
                        <li className="flex my-5 sm:text-sm md:text-lg lg:text-2xl md:my-1">
                            <span className="flex-auto text-center underline w-90 text-sky-500">Total</span>

                            <span>
                                <span className="flex-auto w-5 text-green-300 underline">{data.total.views.toLocaleString()}</span>
                                <span className="mx-2 text-sky-500 ">|</span>
                                <span className="flex-auto w-5 text-yellow-500 underline">{data.total.runtime.formatted}</span>
                            </span>
                        </li>
                        <div className="mt-10">
                            {data.results.map((r) => (
                                <li key={r.title} className="flex my-5 sm:text-sm md:text-lg lg:text-2xl md:my-1">
                                    <a target="_blank" rel="noreferrer" className="flex-auto w-90 text-sky-500" href={r.url}>
                                        [{r.date}] {r.title.replace(" - YouTube", "")}
                                    </a>
                                    <span>
                                        <span className="flex-auto w-5 text-green-300">{r.views.toLocaleString()}</span>
                                        <span className="mx-2 text-sky-500">|</span>
                                        <span className="flex-auto w-5 text-yellow-500">{r.runtime.formatted}</span>
                                    </span>
                                </li>
                            ))}
                        </div>
                    </ul>
                </>
            )}
        </main>
    );
}
