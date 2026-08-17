CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`kind` text NOT NULL,
	`storage_key` text NOT NULL,
	`prompt` text,
	`locked` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`order_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`customer_wallet` text NOT NULL,
	`currency` text NOT NULL,
	`subtotal` real NOT NULL,
	`platform_fee` real NOT NULL,
	`tx_signature` text,
	`status` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payouts` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`currency` text NOT NULL,
	`amount` real NOT NULL,
	`wallet` text NOT NULL,
	`tx_signature` text,
	`status` text NOT NULL,
	`scheduled_at` integer
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`product_id` text NOT NULL,
	`tier` text NOT NULL,
	`size` text NOT NULL,
	`price_delta` real NOT NULL,
	`production_days` integer NOT NULL,
	`provider_sku` text
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`base_price` real NOT NULL,
	`inventory_mode` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_admins` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`wallet` text NOT NULL,
	`role` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`ticker` text,
	`owner_wallet` text NOT NULL,
	`payout_wallet` text NOT NULL,
	`storefront_config` text,
	`created_at` integer NOT NULL
);
