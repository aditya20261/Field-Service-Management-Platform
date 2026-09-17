# =========================
# BUILD STAGE
# =========================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -DskipTests clean package


# =========================
# RUN STAGE
# =========================
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/keystone-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]