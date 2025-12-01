package faceTime.auth;

// [필요한 임포트 추가]
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
// ---
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import faceTime.config.jwt.JwtTokenProvider;
import faceTime.user.User;
import faceTime.user.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // AuthenticationManager가 완전히 제거됨
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public Long signup(AuthDto.SignupRequest requestDto) {
        if (userRepository.findByEmail(requestDto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(requestDto.getEmail())
                .password(passwordEncoder.encode(requestDto.getPassword()))
                .name(requestDto.getName())
                .build();

        User savedUser = userRepository.save(user);
        return savedUser.getUserId();
    }

    @Transactional
    public AuthDto.TokenResponse login(AuthDto.LoginRequest requestDto) {
        // 1. DB에서 사용자 로드
        User user = userRepository.findByEmail(requestDto.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + requestDto.getEmail()));

        // 2. [주석 해제됨!] 비밀번호 검사
        if (!passwordEncoder.matches(requestDto.getPassword(), user.getPassword())) {
            // "BadCredentialsException" 대신 UsernameNotFoundException을 사용해도
            // Spring Security가 동일하게 401로 처리합니다.
            throw new UsernameNotFoundException("비밀번호가 일치하지 않습니다.");
        }

        // 3. (비밀번호 일치) 인증 객체 수동 생성
        // User가 UserDetails를 구현하고 있으므로, user 객체를 그대로 사용
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user, // principal (사용자 정보)
                null, // credentials (비밀번호는 이미 검증됨)
                user.getAuthorities() // authorities (권한)
        );

        // 4. SecurityContext에 인증 정보 저장 (선택 사항이지만 좋은 습관)
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 5. JWT 토큰 생성
        String token = jwtTokenProvider.createToken(authentication);

        return new AuthDto.TokenResponse(token);
    }
}