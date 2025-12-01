# 1. Build Stage: Maven과 Java 21을 사용하여 빌드
# pom.xml의 java.version 21 기준
FROM eclipse-temurin:21-jdk-jammy as builder

WORKDIR /app
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline

COPY src ./src
# pom.xml의 packaging이 'war'이므로 .war 파일이 생성됨
RUN ./mvnw clean package -DskipTests

# 2. Run Stage: JRE만 설치된 경량 이미지로 교체
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# 빌드 스테이지에서 .war 파일 복사
COPY --from=builder /app/target/*.war app.war

# application.properties에서 설정된 포트 8081
EXPOSE 8081

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.war"]