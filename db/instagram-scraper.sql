drop database if exists `instagram-scraper`;
create database `instagram-scraper`;
use `instagram-scraper`;

create table `priority`(
	name varchar(50) primary key,
    description varchar(50)
);

create table `keyword`(
    name varchar(200) primary key,
    priority varchar(50) default 'MEDIUM',
    foreign key (priority) references `priority`(name)
);
create table `channel`(
	username varchar(200) primary key,
    category varchar(200)
);

create table `crawling_type`(
	name varchar(50) primary key
);

create table `channel_crawling_history`(
	channel_username varchar(200),
    crawling_type varchar(50),
    date datetime,
    primary key(channel_username, crawling_type),
    foreign key(channel_username) references `channel`(username),
    foreign key(crawling_type) references `crawling_type`(name)
);

create table `channel_profile`(
    username varchar(200),
    bio_link_url varchar(200),
	external_url varchar(200),
    follower_count int,
    following_count int,
    full_name varchar(200),
    hd_profile_pic_url_info varchar(200),
    id varchar(200),
    media_count int,
    pk varchar(200),
    profile_pic_url varchar(200),
    foreign key(username) references `channel`(username)
);

create table `channel_friendship`(
	username varchar(50) primary key,
	id varchar(50),
    friendship_status varchar(50),
    full_name varchar(50),
    pk varchar(50),
    profile_pic_url varchar(50),
    supervision_info varchar(50),
    social_context varchar(50),
    channel_username varchar(50),
	foreign key(channel_username) references `channel`(username)
);

create table `channel_reel`(
	code varchar(200) primary key,
    channel_reel_numerical_order int,
    audience varchar(200),
    comment_count int,
    id varchar(200),
    image_height int,
    image_width int,
    image_url varchar(200),
    like_count int,
    media_type int,
    pk varchar(200),
    play_count int,
    product_type varchar(200),
    video_url varchar(200),
	channel_username varchar(50),
	foreign key(channel_username) references `channel`(username)
);

create table `keyword_channel` (
	keyword_name varchar(200),
    channel_username varchar(200),
    status varchar(50),
    primary key (keyword_name, channel_username),
	foreign key (keyword_name) references `keyword`(name),
    foreign key (channel_username) references `channel`(username)
);

create table `hashtag`(
    code varchar(200) primary key,
    media_count bigint,
    category varchar(50),
    classify varchar(50), -- tự add/bot quét
    keyword varchar(200),
    priority varchar(50) default 'MEDIUM',
    foreign key (priority) references `priority`(name),
    foreign key (keyword) references `keyword`(name)
);

create table `channel_reel_hashtag`(
	channel_reel_code varchar(200),
    hashtag_code varchar(200),
    primary key(channel_reel_code, hashtag_code),
	foreign key (channel_reel_code) references `channel_reel`(code),
    foreign key (hashtag_code) references `hashtag`(code)
);




