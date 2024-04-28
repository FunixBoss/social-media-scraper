drop database if exists `instagram-scraper`;
create database `instagram-scraper`;
use `instagram-scraper`;

create table `priority`(
	name varchar(50) primary key,
    description varchar(200)
);

create table `keyword`(
    name varchar(200) primary key,
    priority varchar(200) default 'MEDIUM',
    foreign key (priority) references `priority`(name)
);
create table `channel`(
	`username` varchar(200) primary key,
    `category` VARCHAR(200) DEFAULT NULL,
	-- priority varchar(200) default 'MEDIUM',
    bio_link_url varchar(1000),
    biography varchar(2000),
	external_url varchar(1000),
    follower_count int,
    following_count int,
    full_name varchar(200),
    profile_pic_url varchar(1000),
    hd_profile_pic_url_info varchar(1000),
    id varchar(200),
    total_posts int,
    total_reels int,
    total_friendships int,
    pk varchar(200),
	is_self_adding bool default false,
    is_bot_scanning bool default false,
    priority varchar(200) default 'MEDIUM',
    foreign key (priority) references `priority`(name)
);

create table `crawling_type`(
	name varchar(200) primary key
);

create table `channel_crawling_history`(
	channel_username varchar(200),
    crawling_type_name varchar(200),
    date datetime,
    primary key(channel_username, crawling_type_name),
    foreign key(channel_username) references `channel`(username),
    foreign key(crawling_type_name) references `crawling_type`(name)
);

create table `channel_friendship`(
	username varchar(200) primary key,
	id varchar(200),
    friendship_status varchar(200),
    full_name varchar(200),
    pk varchar(200),
    profile_pic_url varchar(1000),
    supervision_info varchar(200),
    social_context varchar(200),
    channel_username varchar(200),
	foreign key(channel_username) references `channel`(username)
);

CREATE TABLE `channel_post` (
    code VARCHAR(200) PRIMARY KEY,
	channel_post_numerical_order int,
    caption_text VARCHAR(10000),
    carousel_media_count INT,
    original_height INT,
    original_width INT,
    video_height INT,
    video_width INT,
    video_url VARCHAR(1000),
    video_type INT,
    comment_count INT,
    product_type NVARCHAR(200),
	channel_username varchar(200),
	foreign key(channel_username) references `channel`(username)
);

CREATE TABLE `channel_post_image` (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    channel_post_code VARCHAR(200),
    image_height INT,
    image_width INT,
    image_url VARCHAR(1000),
    FOREIGN KEY (channel_post_code) REFERENCES `channel_post`(code) ON DELETE CASCADE
);

create table `channel_reel`(
	code varchar(200) primary key,
    channel_reel_numerical_order int,
    audience varchar(200),
    comment_count int,
    id varchar(200),
    image_height int,
    image_width int,
    image_url varchar(1000),
    like_count int,
    media_type int,
    pk varchar(200),
    play_count int,
    product_type varchar(200),
    video_url varchar(1000),
	channel_username varchar(200),
	foreign key(channel_username) references `channel`(username)
);

create table `keyword_channel` (
	keyword_name varchar(200),
    channel_username varchar(200),
    status varchar(200),
    primary key (keyword_name, channel_username),
	foreign key (keyword_name) references `keyword`(name),
    foreign key (channel_username) references `channel`(username)
);

create table `hashtag`(
	id bigint auto_increment primary key,
    code varchar(200),
    media_count bigint,
    category varchar(200),
	is_self_adding bool default false,
    is_bot_scanning bool default false,
    keyword_name varchar(200),
    priority varchar(200) default 'MEDIUM',
    foreign key (priority) references `priority`(name),
    foreign key (keyword_name) references `keyword`(name)
);

create table `channel_reel_hashtag`(
	channel_reel_code varchar(200),
    hashtag_id bigint,
    primary key(channel_reel_code, hashtag_id),
	foreign key (channel_reel_code) references `channel_reel`(code),
    foreign key (hashtag_id) references `hashtag`(id)
);

insert into `priority`(name) values
('HIGH'),
('MEDIUM'),
('LOW');
insert into `crawling_type`(name) values
('CHANNEL_PROFILE'),
('CHANNEL_FRIENDSHIP'),
('CHANNEL_HIGHLIGHTS'),
('CHANNEL_POSTS'),
('CHANNEL_REELS'),
('CHANNEL_TAGGED'),
('EXPLORE_HASHTAG'),
('EXPORE_KEYWORD')
;



