package faceTime.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api") // /api 로 시작하는 요청
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 마이페이지 정보 조회 (로그인 필요!)
     */
    @GetMapping("/mypage")
    public ResponseEntity<UserDto.MyPageResponse> getMyPageInfo() {
        // `SecurityConfig`에서 "/api/auth/**" 외의 모든 요청은
        // 인증이 필요하다고 설정했기 때문에,
        // 이 API는 자동으로 '로그인한 사용자'만 호출할 수 있습니다.

        // `UserService`가 SecurityContext에서 직접 사용자 정보를 가져옵니다.
        UserDto.MyPageResponse response = userService.getMyInfo();

        return ResponseEntity.ok(response);
    }
}