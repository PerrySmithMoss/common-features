CREATE TABLE `Users` (
 `id`         INT(11) unsigned NOT NULL AUTO_INCREMENT,
 `first_name` VARCHAR(128) NOT NULL,
 `last_name`  VARCHAR(128) NOT NULL,
 `sex`        VARCHAR(10) NOT NULL,
 `email`      VARCHAR(128) NOT NULL,
 `password`   VARCHAR(255) NOT NULL,
 `created_at` DATETIME NOT NULL,
 PRIMARY KEY (`id`)
)