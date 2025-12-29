package backend.backend.student.coaching;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "coaching_centers")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CoachingCenter {

    // =========================
    // Primary Key
    // =========================
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // =========================
    // Coaching Center Info
    // =========================
    @NotBlank(message = "Center name is required")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Address is required")
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String address;

    @NotBlank(message = "Contact information is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String contact;

    @NotBlank(message = "Specialization is required")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String specialization; // ex: "Math", "Languages", "Programming"

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    // =========================
    // Opening Hours (optional)
    // =========================
    private LocalTime openTime;
    private LocalTime closeTime;

    // =========================
    // Auditing
    // =========================
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
