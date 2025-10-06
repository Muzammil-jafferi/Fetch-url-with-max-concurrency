import { expect } from 'chai';
import { fetchWithConcurrency } from './ConcurrencyExercise';

describe('fetchWithConcurrency', () => {
    it('should fetch all URLs and return results in the original order', async () => {
        const urls: string[] = ['url1', 'url2', 'url3'];

        const mockFetch = (url: string) => Promise.resolve(`response-${url}`);

        const results = await fetchWithConcurrency<string>(urls, 2, mockFetch);

        expect(results).to.deep.equal(['response-url1', 'response-url2', 'response-url3']);
    });

    it('should not exceed the given maxConcurrency', async () => {
        const urls: string[] = ['url1', 'url2', 'url3', 'url4'];
        const maxConcurrency = 2;

        let activeRequests = 0;
        let maxActiveConcurrency = 0;

        const mockFetch = (url: string): Promise<string> => {
            activeRequests++;
            maxActiveConcurrency = Math.max(maxActiveConcurrency, activeRequests);

            return new Promise((resolve) =>
                setTimeout(() => {
                    activeRequests--;
                    resolve(`response-${url}`);
                }, 10),
            );
        };

        const results = await fetchWithConcurrency<string>(urls, maxConcurrency, mockFetch);

        expect(results).to.deep.equal(['response-url1', 'response-url2', 'response-url3', 'response-url4']);
        expect(maxActiveConcurrency).to.be.at.most(maxConcurrency);
    });

    it('should handle errors but continue fetching remaining URLs', async () => {
        const urls: string[] = ['url-ok1', 'url-fail', 'url-ok2'];

        const mockFetch = async (url: string): Promise<string> => {
            if (url === 'url-fail') {
                throw new Error('fetch failed');
            }
            return `response-${url}`;
        };

        const results = await fetchWithConcurrency<string>(urls, 2, mockFetch);

        expect(results[0]).to.equal('response-url-ok1');
        expect(results[1]).to.be.instanceOf(Error);
        expect(results[1]).to.have.property('message', 'fetch failed');
        expect(results[2]).to.equal('response-url-ok2');
    });
});