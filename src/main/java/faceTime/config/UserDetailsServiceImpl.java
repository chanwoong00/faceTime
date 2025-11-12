package faceTime.config;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import faceTime.user.UserRepository;

@Service // <-- 1. Service 빈으로 등록
public class UserDetailsServiceImpl implements UserDetailsService { // <-- 2. UserDetailsService 구현

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 3. SecurityConfig에 있던 로직을 그대로 가져옴
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException(username + "을 찾을 수 없습니다."));
    }
}
