/* V1: 초기 스키마 생성 - FaceTime 프로젝트 */

/* 1. users 테이블 (로그인 및 사용자 정보) */
/* (테이블명을 "users"로 한 이유: "user"는 MySQL 예약어) */
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    skin_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

/* 2. skin_result 테이블 (AI 진단 결과) */
CREATE TABLE skin_result (
    result_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    acne_score INT DEFAULT 0,
    oil_score INT DEFAULT 0,
    skin_type VARCHAR(100),
    diagnosed_at TIMESTAMP NOT NULL,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

/* 3. skin_history 테이블 (진단 이력 트래킹) */
CREATE TABLE skin_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    result_id BIGINT NOT NULL UNIQUE,
    date TIMESTAMP NOT NULL,
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (result_id) REFERENCES skin_result(result_id) ON DELETE CASCADE
);

/* 4. product 테이블 (추천 제품) */
CREATE TABLE product (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    skin_type VARCHAR(100) NOT NULL, -- "지성", "건성", "복합성" 등
    description TEXT,
    INDEX idx_skin_type (skin_type)
);

/* 5. routine 테이블 (개인 루틴) */
CREATE TABLE routine (
    routine_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE, -- 사용자는 하나의 루틴만 가진다고 가정 (1:1)
    morning_steps TEXT, -- (예: "1.세안, 2.스킨, 3.로션")
    night_steps TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);