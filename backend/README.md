# KEYSTONE Backend
Java 21 + Spring Boot + MySQL + Flyway + JWT.

## Run
1. Install MySQL and create/use `keystone_db` (the URL can create it automatically).
2. Set `spring.datasource.password` in `src/main/resources/application.properties`.
3. Run: `mvn spring-boot:run`

Customer registration: POST `/api/auth/register`
Login: POST `/api/auth/login`
Protected dashboard: GET `/api/dashboard` with `Authorization: Bearer <token>`.
