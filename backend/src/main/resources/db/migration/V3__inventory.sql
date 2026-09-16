CREATE TABLE IF NOT EXISTS parts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit_price DOUBLE NOT NULL DEFAULT 0.0,
    minimum_stock INT NOT NULL DEFAULT 5,
    PRIMARY KEY (id),
    UNIQUE KEY uk_parts_part_number (part_number)
);