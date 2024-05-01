DROP TABLE IF EXISTS `sb_reports`;
CREATE TABLE `sb_reports` (
  `id` int(11) NOT NULL,
  `server_name` varchar(128) NOT NULL,
  `reporter` varchar(64) NOT NULL,
  `reporter_id` varchar(32) NOT NULL,
  `suspect` varchar(64) DEFAULT NULL,
  `suspect_id` varchar(32) DEFAULT NULL,
  `reason` varchar(256) NOT NULL,
  `dateOf` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sent` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;COMMIT;
