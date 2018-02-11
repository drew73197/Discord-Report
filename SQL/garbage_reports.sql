
CREATE DATABASE IF NOT EXISTS `garbage_reports` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `garbage_reports`;

DROP TABLE IF EXISTS `blocked`;
CREATE TABLE `blocked` (
  `id` int(11) NOT NULL,
  `steam_id` varchar(64) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `server_name` varchar(128) NOT NULL,
  `ip_port` varchar(32) DEFAULT NULL,
  `reporter` varchar(64) NOT NULL,
  `reporter_id` varchar(32) NOT NULL,
  `suspect` varchar(64) DEFAULT NULL,
  `suspect_id` varchar(32) DEFAULT NULL,
  `reason` varchar(256) NOT NULL,
  `dateOf` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sent` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

ALTER TABLE `blocked`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `steam_id` (`steam_id`);

ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `blocked`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;COMMIT;
