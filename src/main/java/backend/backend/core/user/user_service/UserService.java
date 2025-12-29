package backend.backend.core.user.user_service;

import backend.backend.core.user.user_entity.User;
import backend.backend.core.user.user_repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import backend.backend.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Transactional
    public User updateUser(UUID id, User userDetails) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(userDetails.getUsername());
                    user.setEmail(userDetails.getEmail());
                    if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                        user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                    }
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Transactional
    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }







    // Role-based methods
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(Role.valueOf(role.toUpperCase()));
    }

    @Transactional(readOnly = true)
    public boolean existsByIdAndRole(UUID id, String role) {
        return userRepository.existsByIdAndRole(id, Role.valueOf(role.toUpperCase()));
    }

    @Transactional(readOnly = true)
    public long countByRole(String role) {
        return userRepository.countByRole(Role.valueOf(role.toUpperCase()));
    }

    @Transactional
    public void deleteByRole(String role) {
        userRepository.deleteByRole(Role.valueOf(role.toUpperCase()));
    }

    @Transactional(readOnly = true)
    public List<User> findActiveUsersByRole(String role, boolean enabled) {
        return userRepository.findActiveUsersByRole(Role.valueOf(role.toUpperCase()), enabled);
    }

    @Transactional
    public int updateRoleForAllUsersWithRole(String oldRole, String newRole) {
        return userRepository.updateRoleForAllUsersWithRole(
            Role.valueOf(oldRole.toUpperCase()),
            Role.valueOf(newRole.toUpperCase())
        );
    }

    @Transactional
    public int deleteInactiveUsersByRole(String role, java.time.LocalDate date) {
        return userRepository.deleteInactiveUsersByRole(Role.valueOf(role.toUpperCase()), date);
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    // Helper

    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

}