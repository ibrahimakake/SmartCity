package backend.backend.business.center;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "business_centers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class BusinessCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "Center name is required")
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
}
