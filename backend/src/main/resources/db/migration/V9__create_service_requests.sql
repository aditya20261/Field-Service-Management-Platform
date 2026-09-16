CREATE TABLE service_requests (
    id BIGINT NOT NULL AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    site_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_service_request_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id),

    CONSTRAINT fk_service_request_site
        FOREIGN KEY (site_id)
        REFERENCES sites(id)
);