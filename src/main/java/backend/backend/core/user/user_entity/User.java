package backend.backend.core.user.user_entity;

import backend.backend.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import backend.backend.core.user.user_entity.TouristProfile;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@ToString(exclude = {"password", "touristProfile"})
@NoArgsConstructor
@AllArgsConstructor
public class User {

    // =========================
    // Primary Key
    // =========================
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // =========================
    // Personal Information
    // =========================
    @NotBlank(message = "First name is required")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String lastName;

    // Optional: set/update in AuthService on login
    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    // =========================
    // Authentication Fields
    // =========================
    @NotBlank(message = "Username is required")
    @Size(min = 4, max = 150)
    @Column(nullable = false, unique = true, length = 150)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 200)
    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8)
    @Column(nullable = false)
    private String password;

    // =========================
    // Authorization
    // =========================
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Role role;

    // =========================
    // Account Status
    // =========================
    @Column(nullable = false)
    private boolean active = true;

    // =========================
    // Tourist profile (optional 1-1)
    // =========================
    //  TouristProfile should  be deleted when User deleted
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private TouristProfile touristProfile;

    // =========================
    // Auditing
    // =========================
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
