package backend.backend.job.joblisting;

import backend.backend.job.company.Company;
import backend.backend.job.industry.Industry;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_listings")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"company", "industry"})
public class JobListing {

    // =========================
    // Primary Key
    // =========================
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // =========================
    // Job Information
    // =========================
    @NotBlank(message = "Job title is required")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String title;

    @NotBlank(message = "Job description is required")
    @Size(max = 2000)
    @Column(nullable = false, length = 2000)
    private String description;

    @NotNull(message = "Salary is required")
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal salary;

    @NotBlank(message = "Contact number is required")
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String contactNumber;

    @Email
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String email;


    // =========================
    // Relationships
    // =========================
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "industry_id", nullable = false)
    private Industry industry;

    // =========================
    // Auditing
    // =========================
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime postedAt;
}
