package faceTime.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {

        // 1. API 기본 정보 설정
        Info info = new Info()
                .title("FaceTime Project API")
                .version("v1.0.0")
                .description("AI 피부 진단 앱 FaceTime의 API 명세서입니다.");

        // 2. JWT 인증 버튼 추가 설정
        String jwtSchemeName = "JWT Authentication";

        // 2-1. SecurityScheme 설정 (HTTP Bearer)
        SecurityScheme securityScheme = new SecurityScheme()
                .name(jwtSchemeName)
                .type(SecurityScheme.Type.HTTP) // HTTP 타입
                .scheme("bearer")               // Bearer 스킴
                .bearerFormat("JWT");           // 포맷은 JWT

        // 2-2. SecurityRequirement 설정 (전역으로 JWT 인증 적용)
        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);

        return new OpenAPI()
                .components(new Components().addSecuritySchemes(jwtSchemeName, securityScheme))
                .addSecurityItem(securityRequirement)
                .info(info);
    }
}