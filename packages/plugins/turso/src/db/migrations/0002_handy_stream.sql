CREATE TABLE `kv` (
	`namespace` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	PRIMARY KEY(`namespace`, `key`)
) WITHOUT ROWID;