// source : https://github.com/dilame/instagram-private-api/blob/master/src/types/media.configure.options.ts

export interface MediaConfigureOptions {
	caption?: string | '';
	source_type?: string;
	disable_comments?: boolean;
	edits?: {
		crop_original_size?: [number, number];
		crop_center?: [number, number];
		crop_zoom?: number | string;
	};
	extra?: {
		source_width: number;
		source_height: number;
	};

	width?: number;
	height?: number;

	scene_capture_type?: string;
	media_folder?: string;
	software?: string;
	// location
	geotag_enabled?: '1' | '0';
	posting_latitude?: string;
	posting_longitude?: string;
	media_latitude?: string;
	media_longitude?: string;
	// string is only for internal use!
	location?: MediaLocation | string;
	// string is only for internal use!
	usertags?: PostingUsertags | string;
}

export interface PostingUsertags {
    in: Array<{ user_id: number | string; position: [number, number] }>;
}

export interface MediaLocation {
	name: string;
	lat: number;
	lng: number;
	address: string;
	external_source: string;
	external_id: string;
}
