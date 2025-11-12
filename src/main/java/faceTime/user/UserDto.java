package faceTime.user;

import lombok.Getter;

public class UserDto {

    /**
     * 마이페이지 응답 DTO
     * (비밀번호 같은 민감 정보를 제외하고 보내기 위함)
     */
    @Getter
    public static class MyPageResponse {
        private String email;
        private String name;
        private String skinType; // (이 값은 나중에 피부 진단 후 업데이트할 수 있습니다)

        public MyPageResponse(User user) {
            this.email = user.getEmail();
            this.name = user.getName();
            this.skinType = user.getSkinType();
        }
    }
}