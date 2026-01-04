package backend.backend.tourism.theatre;

import backend.backend.tourism.booking.bookingEntity.TheatreBooking;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "theatres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Theatre {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "Theatre name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Address is required")
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String address;

    @NotNull(message = "Rating is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Rating must be at least 0")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5")
    @Digits(integer = 1, fraction = 1, message = "Rating must have up to 1 decimal place")
    @Column(nullable = false, precision = 2, scale = 1)
    private BigDecimal rating = new BigDecimal("0.0");


    @NotBlank(message = "Description is required")
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String description;

    @NotBlank(message = "Contact number is required")
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String contactNumber;

    // stores the public URL or relative path, e.g. "/uploads/hotels/<uuid>.jpg"
    @Size(min = 500)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // =========================
    // Relationships
    // =========================
    @OneToMany(mappedBy = "theatre", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TheatreBooking> bookings = new ArrayList<>();
}
