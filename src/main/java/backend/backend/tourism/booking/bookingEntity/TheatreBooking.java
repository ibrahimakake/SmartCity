package backend.backend.tourism.booking.bookingEntity;

import backend.backend.core.user.user_entity.TouristProfile;
import backend.backend.enums.BookingStatus;
import backend.backend.tourism.theatre.Theatre;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "theatre_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"theatre", "touristProfile"})
public class TheatreBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "Show time is required")
    @Future(message = "Show time must be in the future")
    @Column(name = "show_time", nullable = false)
    private LocalDateTime showTime;

    @NotNull(message = "Number of tickets is required")
    @Min(value = 1, message = "At least one ticket is required")
    @Max(value = 10, message = "Maximum 10 tickets allowed per booking")
    @Column(name = "number_of_tickets", nullable = false)
    private Integer numberOfTickets;

    @NotNull(message = "Total price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Size(max = 50, message = "Seat numbers must not exceed 50 characters")
    @Column(name = "seat_numbers", length = 50)
    private String seatNumbers;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(name = "booking_date", nullable = false, updatable = false)
    private LocalDateTime bookingDate;

    // =========================
    // Relationships
    // =========================
    @NotNull(message = "Theatre is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "theatre_id", nullable = false)
    private Theatre theatre;

    @NotNull(message = "Tourist profile is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tourist_profile_id", nullable = false)
    private TouristProfile touristProfile;

    @PrePersist
    protected void onCreate() {
        if (this.bookingDate == null) {
            this.bookingDate = LocalDateTime.now();
        }
        // Status is already initialized with CONFIRMED
    }
}
