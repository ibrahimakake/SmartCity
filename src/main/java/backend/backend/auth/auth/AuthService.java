package backend.backend.auth.auth;

import backend.backend.auth.dto.AuthResponse;
import backend.backend.auth.dto.LoginRequest;
import backend.backend.auth.dto.RegisterRequest;
import backend.backend.auth.exception.AuthException;
import backend.backend.security.JwtService;
import backend.backend.enums.Role;
import backend.backend.core.user.user_entity.User;
import backend.backend.core.user.user_repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        try {
            // 1. Validate input
            validateRegistrationRequest(request);

            // 2. Check for existing users
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new AuthException("Username is already taken");
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new AuthException("Email is already registered");
            }

            // 3. Determine user role (ADMIN if first user, otherwise TOURIST)
            Role assignedRole = determineUserRole(request);

            // 4. Create and save user
            User user = createUserFromRequest(request, assignedRole);
            user = userRepository.save(user);

            // 5. Generate tokens using the User directly (implements UserDetails)
            String accessToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // 6. Save refresh token
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            log.info("User registered successfully: {} with role: {}", user.getUsername(), assignedRole);

            return AuthResponse.builder()
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .role(assignedRole.name())
                    .username(user.getUsername())
                    .build();

        } catch (AuthException e) {
            log.error("Registration failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected registration error", e);
            throw new AuthException("Registration failed: " + e.getMessage());
        }
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            // 1. Authenticate
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // 2. Find user and validate
            var user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new AuthException("User not found"));

            if (!user.isActive()) {
                throw new AuthException("Account is deactivated");
            }

            // 3. Generate tokens
            String accessToken = jwtService.generateToken(user);
            // Convert User to UserDetails for refresh token generation
            org.springframework.security.core.userdetails.User userDetails = 
                new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPassword(),
                    true, true, true, true,
                    user.getAuthorities()
                );
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            // 4. Save refresh token
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            log.info("User logged in: {}", user.getUsername());

            // 5. Return tokens
            return AuthResponse.builder()
                    .token(accessToken)
                    .refreshToken(refreshToken)
                    .role(user.getRole().name())
                    .username(user.getUsername())
                    .build();

        } catch (BadCredentialsException e) {
            log.warn("Login failed for user: {}", request.getUsername());
            throw new AuthException("Invalid username or password");
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage(), e);
            throw new AuthException("Login failed: " + e.getMessage());
        }
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        try {
            // 1. Validate refresh token
            String username = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AuthException("User not found"));

            // 2. Verify token validity and match with stored token
            if (!jwtService.isTokenValid(refreshToken, user) ||
                    !refreshToken.equals(user.getRefreshToken())) {
                throw new AuthException("Invalid refresh token");
            }

            // 3. Generate new tokens
            String newAccessToken = jwtService.generateToken(user);
            String newRefreshToken = jwtService.generateRefreshToken(user);

            // 4. Update refresh token in database
            user.setRefreshToken(newRefreshToken);
            userRepository.save(user);

            log.info("Token refreshed for user: {}", username);

            // 5. Return new tokens
            return AuthResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .role(user.getRole().name())
                    .username(user.getUsername())
                    .build();

        } catch (Exception e) {
            log.error("Refresh token error: {}", e.getMessage(), e);
            throw new AuthException("Failed to refresh token: " + e.getMessage());
        }
    }

    @Transactional
    public void logout(String refreshToken) {
        try {
            // 1. Extract username from token
            String username = jwtService.extractUsername(refreshToken);

            // 2. Find user and clear refresh token
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AuthException("User not found"));

            user.setRefreshToken(null);
            userRepository.save(user);

            log.info("User logged out: {}", username);

        } catch (Exception e) {
            log.error("Logout error: {}", e.getMessage(), e);
            throw new AuthException("Logout failed: " + e.getMessage());
        }
    }

    // ===== Helper Methods =====

    private void validateRegistrationRequest(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new AuthException("Username is required");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new AuthException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new AuthException("Password is required");
        }
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            throw new AuthException("First name is required");
        }
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            throw new AuthException("Last name is required");
        }
    }

    /**
     * Determines the user's role:
     * - First user → ADMIN
     * - Subsequent users → Role from request or TOURIST by default
     */
    private Role determineUserRole(RegisterRequest request) {
        if (userRepository.count() == 0) {
            log.info("First user registration - assigning ADMIN role");
            return Role.ADMIN;
        }

        return request.getRole() != null ? request.getRole() : Role.TOURIST;
    }

    private User createUserFromRequest(RegisterRequest request, Role role) {
        return User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .username(request.getUsername().trim().toLowerCase())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .build();
    }
}