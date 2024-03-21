"use client";
import { useState, useEffect } from "react";
import { FullResults } from "./types";
import time from "./utils/time";

type SORT_KEY = "_id" | "views" | "runtime";

const CACHE_KEY = "video_cache";

export default function Home() {
    const [data, setData] = useState<FullResults>();
    const [sorter, setSorter] = useState<SORT_KEY>("_id");
    const [showInput, setShowInput] = useState(false);
    const [newUrl, setNewUrl] = useState("");

    useEffect(() => {
        const cachedData = localStorage.getItem(CACHE_KEY);

        if (cachedData) {
            setData(JSON.parse(cachedData));
            console.log("Video stats set from localStorage");
        }

        document.body.className = "bg-slate-900";
        getStats();
    }, []);

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
            .then((data) => {
                if (data && "total" in data) {
                    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                    setData(data);
                }
                console.log("Fetching live data");
                fetch("/api/stats")
                    .then((res) => res.json())
                    .then((data) => {
                        console.log("Retrieved newest data");
                        console.log({ data });
                        if (data && "total" in data) {
                            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                            setData(data);
                        }
                    });
            });
    }

    function handleSort(name: SORT_KEY) {
        if (name === sorter) {
            const reversed = data!.results.reverse();
            setData({ ...data!, results: reversed });
        } else {
            const resorted: FullResults["results"] = data!.results
                .map((r) => ({ ...r, runtime: r.runtime.ms }))
                .sort((a, b) => {
                    const a_id = parseInt(a._id.toHexString().slice(-6), 16);
                    const b_id = parseInt(b._id.toHexString().slice(-6), 16);

                    return a_id - b_id;
                })
                .map((r) => ({ ...r, runtime: { ms: r.runtime, formatted: time.milliseconds.to.HHMMSS(r.runtime) } }));
            setData({ ...data!, results: resorted });
        }
        setSorter(name);
    }

    return (
        <main className="flex flex-col items-center justify-between min-h-screen p-6 p-sm-12 p-md-24">
            {showInput && (
                <div className="mt-10">
                    <input className="text-black-900" type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                    <div>
                        <button onClick={addURL}>Add URL</button>
                    </div>
                    <p>Adding {newUrl}</p>
                </div>
            )}

            {!data && <h1 className="text-center text-red-500">Loading</h1>}
            {data && (
                <>
                    <h1 className="text-4xl text-center text-cyan-700">
                        Total Views: {data.total.views} | Runtime: {data.total.runtime.formatted}
                    </h1>

                    <div className="flex items-center justify-between mt-8">
                        <button onClick={() => handleSort("_id")} className={`p-2 mx-2 text-3xl text-center bg-cyan-${sorter === "_id" ? "700" : "900"}`}>
                            Latest
                        </button>
                        <button onClick={() => handleSort("views")} className={`p-2 mx-2 text-3xl text-center bg-cyan-${sorter === "views" ? "700" : "900"}`}>
                            Popular
                        </button>
                        <button
                            onClick={() => handleSort("runtime")}
                            className={`p-2 mx-2 text-3xl text-center bg-cyan-${sorter === "runtime" ? "700" : "900"}`}
                        >
                            Longest
                        </button>
                    </div>

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
