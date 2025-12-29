package backend.backend.core.user.user_entity;

import backend.backend.tourism.booking.bookingEntity.HotelBooking;
import backend.backend.tourism.booking.bookingEntity.RestaurantReservation;
import backend.backend.tourism.booking.bookingEntity.TheatreBooking;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "tourist_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {
        "user",
        "hotelBookings",
        "restaurantReservations",
        "theatreBookings"
})
public class TouristProfile {

    // =========================
    // Shared Primary Key with User (via @MapsId)
    // =========================
    @Id
    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User user;

    // =========================
    // One Tourist → Many Bookings (read-only relationship here)
    // =========================
    @OneToMany(mappedBy = "touristProfile", fetch = FetchType.LAZY)
    private Set<HotelBooking> hotelBookings = new HashSet<>();

    @OneToMany(mappedBy = "touristProfile", fetch = FetchType.LAZY)
    private Set<RestaurantReservation> restaurantReservations = new HashSet<>();

    @OneToMany(mappedBy = "touristProfile", fetch = FetchType.LAZY)
    private Set<TheatreBooking> theatreBookings = new HashSet<>();

    // =========================
    // Tourist-specific fields (minimal, per requirements)
    // =========================
    @Size(max = 150)
    @Column(length = 150)
    private String nationality;

    @Size(max = 500)
    @Column(length = 500)
    private String preferences;

    @ElementCollection
    @CollectionTable(
            name = "tourist_interests",
            joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "interest", length = 100)
    private Set<String> interests = new HashSet<>();
}
