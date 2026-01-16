package backend.backend.tourism.hotel;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hotels")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "Hotel name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Address is required")
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String address;

    @Email(message = "Invalid email format")
    @Size(max = 100)
    @Column(length = 100)
    private String email;

    @Pattern(regexp = "^\\+?[0-9\\s\\-()]{7,20}$", message = "Invalid phone number format")
    @Size(max = 20)
    @Column(length = 20)
    private String phoneNumber;

    @Size(max = 1000)
    @Column(length = 1000)
    private String description;

    @DecimalMin(value = "0.0", message = "Price must be a positive number")
    @Column(precision = 10, scale = 2)
    private BigDecimal minPrice;

    @DecimalMin(value = "0.0", message = "Price must be a positive number")
    @Column(precision = 10, scale = 2)
    private BigDecimal maxPrice;

    @NotNull(message = "Star rating is required")
    @Min(value = 1, message = "Star rating must be between 1 and 5")
    @Max(value = 5, message = "Star rating must be between 1 and 5")
    @Column(nullable = false)
    private Integer starRating;

    @NotNull(message = "Rating is required")
    @DecimalMin(value = "0.0", message = "Rating must be at least 0.0")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    @Column(nullable = false, precision = 2, scale = 1)
    private BigDecimal rating;

    @DecimalMin(value = "0.0", inclusive = true, message = "Starting price must be >= 0")
    @Column(name = "starting_price", precision = 10, scale = 2)
    private BigDecimal startingPrice;

    // stores the public URL or relative path, e.g. "/uploads/hotels/<uuid>.jpg"
    @Size(max = 500)
    @Column(name = "image_url", length = 500, nullable = true)
    private String imageUrl;


    @Column(nullable = false)
    private boolean active = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
