import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { bufferToStream, getPostType, parseCookie, randInt, shortcodeFormatter } from './utils/index';
import { ProductType, MediaType, IChangedProfilePicture, ISearchFollow, IGPostMetadata, PostGraphQL } from './types';
import { IGUserMetadata, UserGraphQL } from './types/UserMetadata';
import { IGStoriesMetadata, ItemStories, StoriesGraphQL } from './types/StoriesMetadata';
import { highlight_ids_query, highlight_media_query, post_shortcode_query } from './helper/query';
import { HightlighGraphQL, ReelsIds } from './types/HighlightMetadata';
import { HMedia, IHighlightsMetadata, IReelsMetadata, ReelsMediaData } from './types/HighlightMediaMetadata';
import { IPostModels, IRawBody, MediaUrls } from './types/PostModels';
import { config } from './config';
import { UserGraphQlV2, Graphql } from './types/UserGraphQlV2';
import { FactoryProvider, Injectable } from '@nestjs/common';

export * from './utils'
export * as InstagramMetadata from './types'
export * from './helper/Session';

@Injectable()
export class InsScraperService {
	/**
	 * @param IgCookie
	 * @param storeCookie
	 * @param AxiosOpts
	 */
	private accountUserId: string;

	constructor(
		private IgCookie: string,
		public AxiosOpts: AxiosRequestConfig = {}) {
		this.IgCookie = IgCookie; 
		this.AxiosOpts = AxiosOpts;
	}

	private buildHeaders = (agent: string = config.android, options?: any) => {
		return {
			'user-agent': agent,
			'cookie': `${this.IgCookie}`,
			'authority': 'www.instagram.com',
			'content-type': 'application/x-www-form-urlencoded',
			'origin': 'https://www.instagram.com',
			'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
			'sec-fetch-site': 'same-origin',
			'sec-fetch-mode': 'cors',
			'sec-fetch-dest': 'empty',
			'x-ig-app-id': 936619743392459,
			'x-ig-www-claim': 'hmac.AR3W0DThY2Mu5Fag4sW5u3RhaR3qhFD_5wvYbOJOD9qaPjIf',
			'x-instagram-ajax': 1,
			'x-requested-with': 'XMLHttpRequest',
			...options
		};
	}

	private fetchApi = (
		baseURL: string,
		url: string = '',
		agent: string = config.android,
		AxiosOptions: AxiosRequestConfig = {}
	): Promise<AxiosResponse> | undefined => {
		try {
			return axios({
				baseURL,
				url,
				headers: AxiosOptions.headers ? AxiosOptions.headers : this.buildHeaders(agent),
				method: AxiosOptions.method || 'GET',
				...AxiosOptions,
				...this.AxiosOpts
			});
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw error.response
			}
		}
	}

	async fetchUser(username: string): Promise<UserGraphQlV2> {
		const res = await this.fetchApi(
			config.instagram_api_v1,
			`/users/web_profile_info/?username=${username}`,
			config.iPhone,
		);
		const graphql: Graphql = res?.data;
		return graphql.data?.user as UserGraphQlV2;
	}

	async fetchPost(url: string): Promise<IPostModels> {
		const post = shortcodeFormatter(url);

		const metadata = await this.fetchPostByMediaId(post.media_id)

		const item = metadata.items[0]
		return {
			username: item.user.username,
			name: item.user.full_name,
			postType: getPostType(item.product_type),
			media_id: item.id,
			shortcode: item.code,
			taken_at_timestamp: item.taken_at,
			likes: item.like_count,
			caption: item.caption?.text || null,
			media_count: item.product_type == ProductType.CAROUSEL ? item.carousel_media_count : 1,
			comment_count: item.comment_count,
			video_duration: item?.video_duration || null,
			music: item?.clips_metadata || null,
			links: this._formatSidecar(metadata),
		}
	}

	async fetchUserPosts(username: string, end_cursor = ''): Promise<any> {
		const userId = await this.getIdByUsername(username);
		const params = {
			'query_hash': '69cba40317214236af40e7efa697781d',
			'variables': {
				"id": userId,
				"first": 12,
				"after": end_cursor
			}
		}
		const res = await this.fetchApi(config.instagram_base_url, '/graphql/query/', config.android, { params })
		return res.data
	}

	/**
	 * fetches highlight metadata
	 * @param {string} username username target to fetch the highlights, also work with private profile if you use cookie \w your account that follows target account
	 * @returns
	 */
	async fetchHighlights (username: string): Promise<IHighlightsMetadata> {
		try {
			const ids = await this._getReelsIds(username);
			const reels = await Promise.all(
				ids.map(async x => this.formatHighlight(await this._getReels(x.highlight_id))))

			let data: IReelsMetadata[] = [];
			for (let i = 0; i < reels.length; i++) {
				data.push({
					title: ids[i].title,
					cover: ids[i].cover,
					media_count: reels[i].length,
					highlights_id: ids[i].highlight_id,
					highlights: reels[i]
				})
			}
			let json: IHighlightsMetadata = {
				username,
				highlights_count: ids.length,
				data: data
			}

			return json;
		} catch (error) {
			throw error
		}
	}

	public getIdByUsername = async (username: string): Promise<string> => {
		const res = await this.fetchUser(username);
		return res?.id;
	}

	async searchFollower (userId: string, searchTerm: string): Promise<ISearchFollow> {
		const res = await this.fetchApi(
			config.instagram_api_v1,
			`/friendships/${userId}/followers/?count=12&query=${searchTerm}&search_surface=follow_list_page`,
			config.iPhone,
		);
		return res?.data || res
	}

	public searchFollowing = async (userId: string, seachTerm: string): Promise<ISearchFollow> => {
		const res = await this.fetchApi(
			config.instagram_api_v1,
			`/friendships/${userId}/following/?query=${seachTerm}`,
			config.iPhone,
		);
		return res?.data || res
	}

	private _formatSidecar = (data: IRawBody): Array<MediaUrls> => {
		const gql = data.items[0]
		let urls: MediaUrls[] = []
		if (gql.product_type == ProductType.CAROUSEL) {
			gql.carousel_media.forEach((v, i, a) => {
				urls.push({
					id: v.id,
					url: v.media_type == MediaType.IMAGE ? v.image_versions2.candidates[0].url : v.video_versions?.[0].url || '',
					type: v.media_type == MediaType.IMAGE ? 'image' : 'video',
					dimensions: {
						height: v.media_type == MediaType.IMAGE ? v.image_versions2.candidates[0].height : v.video_versions?.[0].height || 0,
						width: v.media_type == MediaType.IMAGE ? v.image_versions2.candidates[0].width : v.video_versions?.[0].width || 0
					}
				})
			})
		} else if (gql.product_type == ProductType.REEL) {
			urls.push({
				id: gql.id,
				url: gql.video_versions[0].url,
				type: 'video',
				dimensions: {
					height: gql.video_versions[0].height,
					width: gql.video_versions[0].width
				}
			})
		} else if (gql.product_type == ProductType.TV) {
			urls.push({
				id: gql.id,
				url: gql.video_versions[0].url,
				type: 'video',
				dimensions: {
					height: gql.video_versions[0].height,
					width: gql.video_versions[0].width
				}
			})
		} else if (gql.product_type == ProductType.SINGLE) {
			urls.push({
				id: gql.id,
				url: gql.media_type == MediaType.IMAGE ? gql.image_versions2.candidates[0].url : gql.video_versions?.[0].url || '',
				type: gql.media_type == MediaType.IMAGE ? 'image' : 'video',
				dimensions: {
					height: gql.media_type == MediaType.IMAGE ? gql.image_versions2.candidates[0].height : gql.video_versions?.[0].height || 0,
					width: gql.media_type == MediaType.IMAGE ? gql.image_versions2.candidates[0].width : gql.video_versions?.[0].width || 0
				}
			})
		}
		return urls
	}

	public fetchPostByMediaId = async (mediaId: string | number): Promise<IRawBody> => {
		try {
			const res = await this.fetchApi(
				config.instagram_api_v1,
				`/media/${mediaId.toString()}/info/`
			)
			return res?.data
		} catch (error) {
			throw error
		}
	}

	public fetchPostByShortcode = async (shortcode: string): Promise<PostGraphQL> => {
		const res = await this.fetchApi(
			config.instagram_base_url,
			'/graphql/query/',
			config.iPhone,
			{ params: post_shortcode_query(shortcode) }
		)
		const graphql = res?.data;
		return graphql;
	}

	public accountInfo = async (
		userID: string = this.accountUserId
	): Promise<UserGraphQL> => {
		try {
			const res = await this.fetchApi(
				config.instagram_api_v1,
				`/users/${userID}/info/`
			);
			const graphql: UserGraphQL = res?.data;
			return graphql
		} catch (error) {
			throw error
		}
	}


	/**
	 * 
	 * @param {StoriesGraphQL} metadata
	 * @returns {ItemStories[]}
	 */
	private _parseStories = (metadata: StoriesGraphQL): Array<ItemStories> => {
		const items = metadata.items;
		let storyList = []
		for (let i = 0; i < items.length; i++) {
			if (items[i].media_type == 1) {
				storyList.push({
					type: 'image',
					mimetype: 'image/jpeg',
					url: items[i].image_versions2.candidates[0].url,
					taken_at: items[i].taken_at,
					expiring_at: items[i].expiring_at,
					id: items[i].id,
					original_width: items[i].original_width,
					original_height: items[i].original_height,
					has_audio:
						items[i].has_audio !== undefined ? items[i].has_audio : null,
					video_duration:
						items[i].video_duration !== undefined
							? items[i].video_duration
							: null,
					caption: items[i].caption,
				});
			} else {
				storyList.push({
					type: 'video',
					mimetype: 'video/mp4',
					url: items[i].video_versions[0].url,
					taken_at: items[i].taken_at,
					expiring_at: items[i].expiring_at,
					id: items[i].id,
					original_width: items[i].original_width,
					original_height: items[i].original_height,
					has_audio:
						items[i].has_audio !== undefined ? items[i].has_audio : false,
					video_duration:
						items[i].video_duration !== undefined
							? items[i].video_duration
							: null,
					caption: items[i].caption,
				});
			}
		}
		return storyList;
	}

	/**
	 * fetches stories metadata 
	 * @param {string} username username target to fetch the stories, also work with private profile if you use cookie \w your account that follows target account
	 * @returns
	 */
	public fetchStories = async (username: string): Promise<IGStoriesMetadata> => {
		const userID = await this.getIdByUsername(username);
		const res = await this.fetchApi(
			config.instagram_api_v1,
			`/feed/user/${userID}/reel_media/`,
			config.iPhone
		);
		const graphql: StoriesGraphQL = res?.data;
		const isFollowing = typeof graphql.user?.friendship_status !== 'undefined';

		if (!isFollowing && graphql.user.is_private) {
			throw new Error('Private profile');
		} else {
			return {
				username: graphql.user.username,
				stories_count: graphql.media_count,
				stories: graphql.items.length == 0 ? null : this._parseStories(graphql),
				graphql,
			};
		}
	}

	/**
	 * Fetch all reels/highlight id
	 * @param {username} username
	 * @returns 
	 */
	public _getReelsIds = async (username: string): Promise<ReelsIds[]> => {
		const userID: string = await this.getIdByUsername(username);
		const res = await this.fetchApi(
			config.instagram_base_url,
			'/graphql/query/',
			config.iPhone,
			{ params: highlight_ids_query(userID) }
		)
		const graphql: HightlighGraphQL = res?.data;
		let items = [];
		graphql.data.user.edge_highlight_reels.edges.map((edge) => {
			items.push({
				highlight_id: edge.node.id,
				cover: edge.node.cover_media.thumbnail_src,
				title: edge.node.title
			})
		})
		return items;
	}

	/**
	 * get media urls from highlight id
	 * @param {ids} ids of highlight
	 * @returns 
	 */
	public _getReels = async (ids: string): Promise<HMedia> => {
		const res = await this.fetchApi(
			config.instagram_base_url,
			'/graphql/query/',
			config.iPhone,
			{ params: highlight_media_query(ids) }
		)
		const graphql = res?.data;
		return graphql;
	}

	private formatHighlight = async (graphql: HMedia): Promise<ReelsMediaData[]> => {
		return graphql.data.reels_media[0].items.map((item) => ({
			owner: graphql.data.reels_media[0].owner,
			media_id: item.id,
			mimetype: item.is_video ? 'video/mp4' || 'video/gif' : 'image/jpeg',
			taken_at: item.taken_at_timestamp,
			type: item.is_video ? 'video' : 'image',
			url: item.is_video ? item.video_resources[0].src : item.display_url,
			dimensions: item.dimensions,
		}))
	}
}

export const insScraperServiceFactory: FactoryProvider<InsScraperService> = {
	provide: InsScraperService,
	useFactory: (IgCookie: string, AxiosOpts?: AxiosRequestConfig) => {
		return new InsScraperService(IgCookie, AxiosOpts);
	},
	inject: ['IgCookie', 'AxiosOpts'], // Inject dependencies (IgCookie and AxiosOpts) here
};