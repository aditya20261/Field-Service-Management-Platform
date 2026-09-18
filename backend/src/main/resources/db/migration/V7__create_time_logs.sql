CREATE TABLE IF NOT EXISTS time_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    work_order_id BIGINT NOT NULL,
    technician_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    duration_minutes INTEGER NULL,
    notes VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_time_logs_work_order
        FOREIGN KEY (work_order_id)
        REFERENCES work_orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_time_logs_technician
        FOREIGN KEY (technician_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_time_logs_duration
        CHECK (duration_minutes IS NULL OR duration_minutes >= 0)
);