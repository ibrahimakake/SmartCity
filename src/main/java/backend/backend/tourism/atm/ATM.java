package backend.backend.tourism.atm;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "atms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ATM {

    // =========================
    // Primary Key
    // =========================
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // =========================
    // ATM Information
    // =========================
    @NotBlank(message = "ATM name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Bank name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String bankName;

    @NotBlank(message = "Address is required")
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String address;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    // =========================
    // Availability
    // =========================
    @Column(nullable = false)
    private boolean active = true;

    // =========================
    // Auditing
    // =========================
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // =========================
    // Lifecycle Hooks
    // =========================
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
