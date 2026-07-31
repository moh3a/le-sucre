ALTER TABLE `invoices` DROP INDEX `invoices_invoice_number_uidx`;--> statement-breakpoint
ALTER TABLE `purchase_orders` DROP INDEX `purchase_orders_po_number_uidx`;--> statement-breakpoint
ALTER TABLE `invoices` DROP COLUMN `invoice_number`;--> statement-breakpoint
ALTER TABLE `purchase_orders` DROP COLUMN `po_number`;