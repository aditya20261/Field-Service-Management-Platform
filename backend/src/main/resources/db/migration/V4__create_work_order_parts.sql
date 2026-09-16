CREATE TABLE work_order_parts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    work_order_id BIGINT NOT NULL,
    part_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DOUBLE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_work_order_parts_work_order
        FOREIGN KEY (work_order_id)
        REFERENCES work_orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_work_order_parts_part
        FOREIGN KEY (part_id)
        REFERENCES parts(id)
        ON DELETE RESTRICT,

    CONSTRAINT uk_work_order_part
        UNIQUE (work_order_id, part_id),

    CONSTRAINT chk_work_order_parts_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_work_order_parts_unit_price
        CHECK (unit_price >= 0)
);