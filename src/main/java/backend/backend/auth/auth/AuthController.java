package backend.backend.auth.auth;

import backend.backend.auth.dto.AuthResponse;
import backend.backend.auth.dto.LoginRequest;
import backend.backend.auth.dto.RegisterRequest;
import backend.backend.auth.dto.TokenRefreshRequest;
import backend.backend.auth.exception.AuthException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for authentication operations
 * Handles user registration, login, token refresh, and logout
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user
     * The first registered user automatically becomes ADMIN
     * Subsequent users are assigned TOURIST role by default
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Registration attempt for username: {}", request.getUsername());
            AuthResponse response = authService.register(request);
            log.info("Registration successful for username: {} with role: {}",
                    request.getUsername(), response.getRole());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (AuthException e) {
            log.error("Registration failed for username {}: {}",
                    request.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Registration failed",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected registration error for username: {}",
                    request.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Internal server error",
                    "message", "An unexpected error occurred during registration"
            ));
        }
    }

    /**
     * Authenticate user and generate tokens
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Login attempt for username: {}", request.getUsername());
            AuthResponse response = authService.login(request);
            log.info("Login successful for username: {}", request.getUsername());
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            log.error("Login failed for username {}: {}",
                    request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Login failed",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected login error for username: {}",
                    request.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Internal server error",
                    "message", "An unexpected error occurred during login"
            ));
        }
    }

    /**
     * Refresh access token using a valid refresh token
     * Generates new access and refresh tokens (token rotation for security)
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        try {
            log.info("Token refresh attempt");
            AuthResponse response = authService.refreshToken(request.getRefreshToken());
            log.info("Token refresh successful for user: {}", response.getUsername());
            return ResponseEntity.ok(response);
        } catch (AuthException e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Token refresh failed",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected token refresh error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Internal server error",
                    "message", "An unexpected error occurred during token refresh"
            ));
        }
    }

    /**
     * Logout user by invalidating the refresh token
     * The refresh token is removed from the database
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            // Validate authorization header format
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Logout attempt with invalid authorization header");
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid authorization header",
                        "message", "Authorization header must start with 'Bearer '"
                ));
            }

            // Extract refresh token (remove "Bearer " prefix)
            String refreshToken = authHeader.substring(7);

            log.info("Logout attempt");
            authService.logout(refreshToken);
            log.info("Logout successful");

            return ResponseEntity.ok(Map.of(
                    "message", "Logged out successfully"
            ));
        } catch (AuthException e) {
            log.error("Logout failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Logout failed",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected logout error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Internal server error",
                    "message", "An unexpected error occurred during logout"
            ));
        }
    }

    // ===== Exception Handlers =====

    /**
     * Handle validation errors from @Valid annotations
     * Returns field-level error messages
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, Object> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.put(error.getField(), error.getDefaultMessage())
        );

        log.warn("Validation failed: {}", fieldErrors);

        return Map.of(
                "error", "Validation failed",
                "fields", fieldErrors
        );
    }

    /**
     * Handle custom authentication exceptions
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(AuthException.class)
    public Map<String, String> handleAuthException(AuthException ex) {
        log.error("Authentication error: {}", ex.getMessage());
        return Map.of(
                "error", "Authentication error",
                "message", ex.getMessage()
        );
    }
}