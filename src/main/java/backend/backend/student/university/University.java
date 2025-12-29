package backend.backend.student.university;

import backend.backend.enums.Faculty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "universities")
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
    @Column(nullable = false)
    private LocalTime openTime;

    @NotNull(message = "Close time is required")
    @Column(nullable = false)
    private LocalTime closeTime;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    // University can have multiple faculties
    @ElementCollection(targetClass = Faculty.class)
    @CollectionTable(name = "university_faculties", joinColumns = @JoinColumn(name = "university_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "faculty", nullable = false, length = 50)
    private Set<Faculty> faculties = new HashSet<>();
}
