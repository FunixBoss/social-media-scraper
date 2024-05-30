export type ChannelScraperInfo = {
    crawl?: CrawlOptions,
    export?: ExportOptions,
    download?: DownloadOptions
}

export type CrawlOptions = {
    profile?: boolean,
    friendships?: boolean,
    posts?: boolean,
    reels?: boolean
}

export type ExportOptions = {
    json?: boolean,
    excel?: boolean
}

export type DownloadOptions = {
    posts?: PostNReelDownloadOptions,
    reels?: PostNReelDownloadOptions
}

export type PostNReelDownloadOptions = {
    all?: boolean,
    from_order?: number,
    to_order?: number
}