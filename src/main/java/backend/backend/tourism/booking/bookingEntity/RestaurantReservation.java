package backend.backend.tourism.booking.bookingEntity;

import backend.backend.core.user.user_entity.TouristProfile;
import backend.backend.enums.ReservationStatus;
import backend.backend.tourism.restaurant.Restaurant;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "restaurant_reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"touristProfile", "restaurant"})
public class RestaurantReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @NotNull(message = "Tourist profile is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tourist_profile_id", nullable = false, columnDefinition = "uuid")
    private TouristProfile touristProfile;

    @NotNull(message = "Restaurant is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false, columnDefinition = "uuid")
    private Restaurant restaurant;

    @NotNull(message = "Reservation date is required")
    @FutureOrPresent(message = "Reservation date must be today or in the future")
    @Column(name = "reservation_date", nullable = false, columnDefinition = "date")
    private LocalDate reservationDate;

    @NotNull(message = "Reservation time is required")
    @Column(name = "reservation_time", nullable = false, columnDefinition = "time")
    private LocalTime reservationTime;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20)")
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "timestamp")
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = ReservationStatus.CONFIRMED;
        }
        
        // Validate reservation time is in the future
        if (this.reservationDate != null && this.reservationTime != null) {
            if (this.reservationDate.isBefore(LocalDate.now()) || 
                (this.reservationDate.isEqual(LocalDate.now()) && 
                 this.reservationTime.isBefore(LocalTime.now()))) {
                throw new IllegalArgumentException("Reservation time must be in the future");
            }
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RestaurantReservation that = (RestaurantReservation) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
