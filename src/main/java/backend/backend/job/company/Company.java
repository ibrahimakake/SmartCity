package backend.backend.job.company;

import backend.backend.job.industry.Industry;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "companies")
@EntityListeners(AuditingEntityListener.class)
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

    @NotBlank(message = "Contact is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String contact;

    @NotBlank(message = "Sector is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String sector;

    @NotBlank(message = "Address is required")
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String address;

    // =========================
    // Relationships
    // =========================
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "industry_id", nullable = false)
    private Industry industry;

    // =========================
    // Auditing
    // =========================
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
