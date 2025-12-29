package backend.backend.auth.auth;

import backend.backend.auth.dto.AuthResponse;
import backend.backend.auth.dto.LoginRequest;
import backend.backend.auth.dto.RegisterRequest;
import backend.backend.security.JwtService;
import backend.backend.enums.Role;
import backend.backend.core.user.user_entity.User;
import backend.backend.core.user.user_repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

//  backend.backend.auth.auth.AuthService
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    public void register(RegisterRequest request) {
        // 1. VALIDATE: Move duplicate checks here
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // 2. DETERMINE ROLE: Move admin logic here
        Role assignedRole;
        if (userRepository.count() == 0) {
            assignedRole = Role.ADMIN;
        } else {
            if (request.getRole() == null || request.getRole() == Role.ADMIN) {
                throw new RuntimeException("Admin role cannot be assigned");
            }
            assignedRole = request.getRole();
        }

        // 3. CREATE & SAVE USER: Move entity creation here
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(assignedRole);
        user.setActive(true);

        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        // 1. AUTHENTICATE
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. FIND USER & GENERATE TOKEN
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user);

        // 3. RETURN RESPONSE DTO
        return new AuthResponse(token, user.getRole().name());
    }
}