/*package backend.backend.auth.auth;

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
    public void register(RegisterRequest request) {
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

            // 3. Determine user role
            Role role = determineUserRole();

            // 4. Create and save user
            User user = createUserFromRequest(request, role);
            userRepository.save(user);
            
            log.info("User registered successfully: {}", user.getUsername());
            
        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            throw new AuthException(e.getMessage() != null ? e.getMessage() : "Registration failed");
        }
    }

    public AuthResponse login(LoginRequest request) {
        try {
            // 1. Authenticate
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );

            // 2. Generate token
            var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AuthException("User not found"));

            if (!user.isActive()) {
                throw new AuthException("Account is deactivated");
            }

            String token = jwtService.generateToken(user);
            log.info("User logged in: {}", user.getUsername());
            
            return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .username(user.getUsername())
                .build();
                
        } catch (BadCredentialsException e) {
            log.warn("Login failed for user: {}", request.getUsername());
            throw new AuthException("Invalid username or password");
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            throw new AuthException("Login failed: " + e.getMessage());
        }
    }

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

    private Role determineUserRole() {
        if (userRepository.count() == 0) {
            log.info("First user registration - assigning ADMIN role");
            return Role.ADMIN;
        }
        // For now, default to TOURIST for all other registrations
        // You can modify this based on your requirements
        return Role.TOURIST;
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
}*/

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

            // 3. Determine user role (ADMIN si premier utilisateur, sinon TOURIST)
            Role assignedRole = determineUserRole(request);

            // 4. Create and save user
            User user = createUserFromRequest(request, assignedRole);
            userRepository.save(user);

            log.info("User registered successfully: {} with role: {}", user.getUsername(), assignedRole);

            // 5. Generate token and return response
            String token = jwtService.generateToken(user);

            return AuthResponse.builder()
                    .token(token)
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

    public AuthResponse login(LoginRequest request) {
        try {
            // 1. Authenticate
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // 2. Generate token
            var user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new AuthException("User not found"));

            if (!user.isActive()) {
                throw new AuthException("Account is deactivated");
            }

            String token = jwtService.generateToken(user);
            log.info("User logged in: {}", user.getUsername());

            return AuthResponse.builder()
                    .token(token)
                    .role(user.getRole().name())
                    .username(user.getUsername())
                    .build();

        } catch (BadCredentialsException e) {
            log.warn("Login failed for user: {}", request.getUsername());
            throw new AuthException("Invalid username or password");
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            throw new AuthException("Login failed: " + e.getMessage());
        }
    }

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
     * Détermine le rôle de l'utilisateur :
     * - Premier utilisateur → ADMIN
     * - Autres utilisateurs → Role fourni ou TOURIST par défaut
     */
    private Role determineUserRole(RegisterRequest request) {
        // Si c'est le premier utilisateur, il devient automatiquement ADMIN
        if (userRepository.count() == 0) {
            log.info("First user registration - assigning ADMIN role");
            return Role.ADMIN;
        }

        // Sinon, utiliser le rôle fourni (ou TOURIST par défaut)
        if (request.getRole() != null) {
            log.info("User registration with specified role: {}", request.getRole());
            return request.getRole();
        }

        log.info("User registration with default TOURIST role");
        return Role.TOURIST;
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