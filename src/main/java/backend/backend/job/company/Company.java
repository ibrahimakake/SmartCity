package backend.backend.job.company;

import backend.backend.job.industry.Industry;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "industry")
public class Company {

    // =========================
    // Primary Key
    // =========================
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // =========================
    // Company Information
    // =========================
    @NotBlank(message = "Company name is required")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Contact number is required")
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String contactNumber;

    @Email
    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String email;

    @NotBlank(message = "Sector is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String sector;

    @NotBlank(message = "Address is required")
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String address;

    @Size(max = 100)
    @Column(length = 100)
    private String location;

    @Size(max = 1000)
    @Column(length = 1000)
    private String description;

    @Size(max = 200)
    @Column(length = 200)
    private String website;

    // URL/path e.g. "/uploads/companies/<uuid>.jpg"
    @Size(max = 500)
    @Column(name = "company_logo", length = 500)
    private String logoUrl;

    @Column(nullable = false)
    private Boolean active = true;

    // =========================
    // Relationships
    // =========================
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "industry_id", nullable = false)
    private Industry industry;

    // =========================
    // Auditing
    // =========================
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
