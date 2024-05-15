drop database if exists `social-media-scraper-proxy`;
create database `social-media-scraper-proxy`;
use `social-media-scraper-proxy`;

create table `proxy`(
	id bigint auto_increment primary key,
    ip varchar(200),
    port varchar(200),
    username varchar(200),
    password varchar(200),
    country_code varchar(200),
    status enum('live', 'die', 'out_of_date'),
    import_date date,
    expiration_date date,
    last_checked datetime,
    last_used datetime
);
LOCK TABLES `proxy` WRITE;
/*!40000 ALTER TABLE `proxy` DISABLE KEYS */;
INSERT INTO `proxy` VALUES (1,'198.46.137.153','6357','ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:27:19','2024-05-11 08:27:19'),(2,'147.185.217.112','6546','ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:27:31','2024-05-11 08:27:31'),(3,'142.147.245.225','5916','ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:27:47','2024-05-11 08:27:47'),(4,'207.244.218.65','5673','ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:27:57','2024-05-11 08:27:57'),(5,'104.238.38.58','6326','ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:28:05','2024-05-11 08:28:05'),(6,'173.211.8.171','6283','ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:28:18','2024-05-11 08:28:18'),(7,'184.174.28.204','5219','ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:28:29','2024-05-11 08:28:29'),(8,'104.239.124.196','6474','ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:28:39','2024-05-11 08:28:39'),(9,'38.154.204.122','8163','ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:28:50','2024-05-11 08:28:50'),(10,'66.78.32.225','5275','ncpptvdk','g9czf5seop32','US','live','2024-05-11','2024-06-11','2024-05-11 08:29:00','2024-05-11 08:29:00');
/*!40000 ALTER TABLE `proxy` ENABLE KEYS */;
UNLOCK TABLES;

SELECT * FROM `instagram-scraper`.proxy;