package faceTime.user;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 현재 로그인한 사용자의 정보를 조회합니다.
     */
    @Transactional(readOnly = true)
    public UserDto.MyPageResponse getMyInfo() {
        // 1. SecurityContext에서 현재 인증된 사용자의 Authentication 객체를 가져옵니다.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 2. Authentication 객체에서 사용자 이름(우리는 email을 사용)을 가져옵니다.
        String userEmail = authentication.getName();

        // 3. email을 사용해 DB에서 사용자를 찾습니다.
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("로그인한 사용자를 찾을 수 없습니다: " + userEmail));

        // 4. User 엔티티를 MyPageResponse DTO로 변환하여 반환합니다.
        return new UserDto.MyPageResponse(user);
    }
}