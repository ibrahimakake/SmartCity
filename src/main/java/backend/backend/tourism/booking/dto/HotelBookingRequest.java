package backend.backend.tourism.booking.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class HotelBookingRequest {

    @NotNull
    private UUID touristProfileId;

    @NotNull
    private UUID hotelId;

    @NotNull
    @FutureOrPresent
    private LocalDate checkInDate;

    @NotNull
    @Future
    private LocalDate checkOutDate;

    @NotNull
    @Min(1)
    @Max(10)
    private Integer numberOfGuests;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double totalPrice;
}
