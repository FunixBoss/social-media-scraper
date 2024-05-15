export type CrawlConfig = {
    profile: {
        min_follower: number
        timeout: number;
    },
    friendships: {
        batchSize: number,
        timeBetweenBatch: number,
    },
    posts: {
        get_detail: boolean;
    },
    reels: {
        get_detail: boolean
    }

}

export const crawlConfig: CrawlConfig = {
    profile: {
        min_follower: 50000,
        timeout: 10000
    },
    friendships: {
        batchSize: 1,
        timeBetweenBatch: 10,
    },
    posts: {
        get_detail: false
    },
    reels: {
        get_detail: false
    }
}