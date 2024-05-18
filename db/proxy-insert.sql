drop database if exists `social-media-scraper-proxy`;
create database `social-media-scraper-proxy`;
use `social-media-scraper-proxy`;

create table `proxy-ipv4`(
	id bigint auto_increment primary key,
    ip varchar(200),
    port int,
    username varchar(200),
    password varchar(200),
    country_code varchar(200),
    status enum('live', 'die'),
    import_date date,
    expiration_date date,
    last_checked datetime,
    last_used datetime
);

create table `rotating-proxy-ipv4`(
	id bigint auto_increment primary key,
    ip  varchar(200),
    port varchar(200),
    supplier varchar(200),
    api_key varchar(500),
    country_code varchar(200),
    status enum('live', 'die'),
    last_ip varchar(200),
    last_checked datetime
);

LOCK TABLES `proxy-ipv4` WRITE;
/*!40000 ALTER TABLE `proxy-ipv4` DISABLE KEYS */;
INSERT INTO `proxy-ipv4` VALUES 
(1,'198.46.137.153',6357,'ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:27:19','2024-05-11 08:27:19'),
(2,'147.185.217.112',6546,'ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:27:31','2024-05-11 08:27:31'),
(3,'142.147.245.225',5916,'ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:27:47','2024-05-11 08:27:47'),
(4,'207.244.218.65',5673,'ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:27:57','2024-05-11 08:27:57'),
(5,'104.238.38.58',6326,'ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:28:05','2024-05-11 08:28:05'),
(6,'173.211.8.171',6283,'ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:28:18','2024-05-11 08:28:18'),
(7,'184.174.28.204',5219,'ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:28:29','2024-05-11 08:28:29'),
(8,'104.239.124.196',6474,'ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:28:39','2024-05-11 08:28:39'),
(9,'38.154.204.122',8163,'ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:28:50','2024-05-11 08:28:50'),
(10,'66.78.32.225',5275,'ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:29:00','2024-05-11 08:29:00');
/*!40000 ALTER TABLE `proxy-ipv4` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `rotating-proxy-ipv4` WRITE;
/*!40000 ALTER TABLE `rotating-proxy-ipv4` DISABLE KEYS */;
INSERT INTO `rotating-proxy-ipv4` VALUES 
(1,'s3.cloudvpsviet.vn','8850','cloudvpsviet','1904b17fde3ca591313849f4508c0e2b',NULL,'die','116.103.250.62','2024-05-17 19:27:28'),
(2,'s3.cloudvpsviet.vn','8091','cloudvpsviet','1904b17fde3ca591313849f4508c0e2b',NULL,'live','27.79.164.11','2024-05-17 19:27:52'),
(3,'103.179.173.13','10001',NULL,NULL,NULL,'live','116.107.166.186','2024-05-17 22:35:15'),
(4,'103.179.173.13','10002',NULL,NULL,NULL,'live','27.73.47.61','2024-05-17 22:35:20'),
(5,'103.179.173.13','10003',NULL,NULL,NULL,'live','171.238.215.226','2024-05-17 22:35:22'),
(6,'103.179.173.13','10004',NULL,NULL,NULL,'live','27.79.217.103','2024-05-17 22:35:26'),
(7,'103.179.173.13','10005',NULL,NULL,NULL,'live','171.224.220.120','2024-05-17 22:35:28'),
(8,'103.179.173.13','10006',NULL,NULL,NULL,'live','171.237.152.173','2024-05-17 22:35:31');
/*!40000 ALTER TABLE `rotating-proxy-ipv4` ENABLE KEYS */;
UNLOCK TABLES;

SELECT * FROM `social-media-scraper-proxy`.`proxy-ipv4`;
SELECT * FROM `social-media-scraper-proxy`.`rotating-proxy-ipv4`;



