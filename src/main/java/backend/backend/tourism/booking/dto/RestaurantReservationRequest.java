package backend.backend.tourism.booking.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
public class RestaurantReservationRequest {

    @NotNull
    private UUID touristProfileId;

    @NotNull
    private UUID restaurantId;

    @NotNull
    @FutureOrPresent
    private LocalDate reservationDate;

    @NotNull
    private LocalTime reservationTime;
}
