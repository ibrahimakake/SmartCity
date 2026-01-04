package backend.backend.student.university;

import backend.backend.enums.Faculty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "universities")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "faculties")
public class University {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String address;

    @NotBlank(message = "Contact is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String contact;

    @NotNull(message = "Open time is required")
    @Column(name = "open_time", nullable = false)
    private LocalTime openTime;

    @NotNull(message = "Close time is required")
    @Column(name = "close_time", nullable = false)
    private LocalTime closeTime;

    @Size(max = 500)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @ElementCollection(targetClass = Faculty.class)
    @CollectionTable(
            name = "university_faculties",
            joinColumns = @JoinColumn(name = "university_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "faculty", nullable = false, length = 50)
    private Set<Faculty> faculties = new HashSet<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
