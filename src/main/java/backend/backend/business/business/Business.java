package backend.backend.business.business;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "businesses")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Business {

    // =========================
    // Primary Key
    // =========================
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // =========================
    // Business Information
    // =========================
    @NotBlank(message = "Business name is required")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Sector is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String sector;

    @NotBlank(message = "Address is required")
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String address;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    @NotBlank(message = "Contact information is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String contact;

    // =========================
    // Auditing
    // =========================
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
