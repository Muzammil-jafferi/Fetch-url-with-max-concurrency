// Given an array of URLs and a MAX_CONCURRENCY integer, implement a 
// function that will asynchronously fetch each URL, not requesting 
// more than MAX_CONCURRENCY URLs at the same time. The URLs should be 
// fetched as soon as possible. The function should return an array of
// responses for each URL. 

// How would you write a test for such a function?

export async function fetchWithConcurrency<T>(
    urls: string[],
    maxConcurrency: number,
    fetchFn: (url: string) => Promise<T>,
) {
    const results: Array<T | Error> = [];
    let i = 0;

    const worker = async () => {
        while (i < urls.length) {
            const idx = i++;
            try {
                results[idx] = await fetchFn(urls[idx]);
            } catch (err) {
                results[idx] = err as Error;
            }
        }
    };

    const workers: Promise<void>[] = [];
    for (let j = 0; j < Math.min(maxConcurrency, urls.length); j++) {
        workers.push(worker());
    }

    await Promise.all(workers);
    return results;
}
