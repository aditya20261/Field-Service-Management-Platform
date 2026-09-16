ALTER TABLE work_orders
    ADD COLUMN sla_due_at DATETIME NULL;

ALTER TABLE work_orders
    ADD COLUMN sla_status VARCHAR(20) NULL;