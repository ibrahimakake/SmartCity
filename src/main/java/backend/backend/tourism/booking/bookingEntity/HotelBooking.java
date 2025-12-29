package backend.backend.tourism.booking.bookingEntity;

import backend.backend.core.user.user_entity.TouristProfile;
import backend.backend.enums.BookingStatus;
import backend.backend.tourism.hotel.Hotel;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "hotel_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"touristProfile", "hotel"})
public class HotelBooking {

    // =========================
    // Primary Key
    // =========================
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // =========================
    // Relationships
    // =========================
    @NotNull(message = "Tourist profile is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tourist_profile_id", nullable = false)
    private TouristProfile touristProfile;

    @NotNull(message = "Hotel is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    // =========================
    // Booking Info
    // =========================
    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date must be today or in the future")
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @NotNull(message = "Check-out date is required")
    @Future(message = "Check-out date must be in the future")
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "At least 1 guest is required")
    @Max(value = 10, message = "Maximum 10 guests allowed")
    @Column(name = "number_of_guests", nullable = false)
    private Integer numberOfGuests;

    @NotNull(message = "Total price is required")
    @DecimalMin(value = "0.01", message = "Total price must be > 0")
    @Digits(integer = 10, fraction = 2, message = "Total price format is invalid")
    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status;

    @Column(name = "booking_date", nullable = false, updatable = false)
    private LocalDate bookingDate;

    // =========================
    // Lifecycle
    // =========================
    @PrePersist
    protected void onCreate() {
        if (this.bookingDate == null) this.bookingDate = LocalDate.now();
        if (this.status == null) this.status = BookingStatus.CONFIRMED;
    }

    @PreUpdate
    protected void onUpdate() {
        // Ensures checkout is after checkin (JPA/DB safety)
        if (checkInDate != null && checkOutDate != null && !checkOutDate.isAfter(checkInDate)) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }
    }
}
