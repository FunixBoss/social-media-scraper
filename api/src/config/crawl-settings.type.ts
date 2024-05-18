export type CrawlSettings = {
    channel: ChannelCrawlConfig,
    download: DownloadConfig,
    proxy: ProxyConfig
}


export type ChannelCrawlConfig = {
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

export type DownloadConfig = {
    batchSize: number;
}

export type ProxyConfig = {
    time_after_rotate: number
}