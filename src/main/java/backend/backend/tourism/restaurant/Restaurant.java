package backend.backend.tourism.restaurant;

import backend.backend.tourism.booking.bookingEntity.RestaurantReservation;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"reservations"})
public class Restaurant {

    // =============================
    // Primary Key
    // =============================
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // =============================
    // Restaurant Information
    // =============================
    @NotBlank(message = "Restaurant name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Address is required")
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String address;

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

    @NotBlank(message = "Price range is required")
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String priceRange;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    @Size(max = 150)
    @Column(length = 150)
    private String cuisineType;

    @NotBlank(message = "Contact number is required")
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String contactNumber;


    // stores the public URL or relative path, e.g. "/uploads/hotels/<uuid>.jpg"
    @Size(min = 500)
    @Column(name = "image_url", length = 500)
    private String imageUrl;


    // =============================
    // Relationships
    // =============================
    // Informational side only – reservations are created/managed by TouristProfile
    @OneToMany(mappedBy = "restaurant")
    private List<RestaurantReservation> reservations = new ArrayList<>();
}
