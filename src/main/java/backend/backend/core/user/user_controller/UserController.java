package backend.backend.core.user.user_controller;

import org.springframework.format.annotation.DateTimeFormat;
import backend.backend.auth.auth.AuthService;
import backend.backend.auth.dto.RegisterRequest;
import backend.backend.core.user.user_entity.User;
import backend.backend.core.user.user_service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<String> createUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            authService.register(registerRequest);
            return ResponseEntity
                    .created(URI.create("/api/users/" + registerRequest.getUsername()))
                    .body("User registered successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody User userDetails) {
        return ResponseEntity.ok(userService.updateUser(id, userDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Role-based endpoints
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @GetMapping("/{id}/role/{role}")
    public ResponseEntity<Boolean> existsByIdAndRole(
            @PathVariable UUID id,
            @PathVariable String role) {
        return ResponseEntity.ok(userService.existsByIdAndRole(id, role));
    }

    @GetMapping("/count/role/{role}")
    public ResponseEntity<Long> countByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.countByRole(role));
    }

    @DeleteMapping("/role/{role}")
    public ResponseEntity<Void> deleteByRole(@PathVariable String role) {
        userService.deleteByRole(role);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active/role/{role}")
    public ResponseEntity<List<User>> findActiveUsersByRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "true") boolean enabled) {
        return ResponseEntity.ok(userService.findActiveUsersByRole(role, enabled));
    }

    @PutMapping("/roles/{oldRole}/update-to/{newRole}")
    public ResponseEntity<Integer> updateRoleForAllUsersWithRole(
            @PathVariable String oldRole,
            @PathVariable String newRole) {
        return ResponseEntity.ok(userService.updateRoleForAllUsersWithRole(oldRole, newRole));
    }

    @DeleteMapping("/inactive/role/{role}")
    public ResponseEntity<Integer> deleteInactiveUsersByRole(
            @PathVariable String role,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate beforeDate) {
        return ResponseEntity.ok(userService.deleteInactiveUsersByRole(role, beforeDate));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }
}