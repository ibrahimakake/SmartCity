package backend.backend.tourism.booking.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class TheatreBookingRequest {

    @NotNull(message = "Tourist profile id is required")
    private UUID touristProfileId;

    @NotNull(message = "Theatre id is required")
    private UUID theatreId;

    @NotNull(message = "Show time is required")
    @Future(message = "Show time must be in the future")
    private LocalDateTime showTime;

    @NotNull
    @Min(1)
    @Max(10)
    private Integer numberOfTickets;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal totalPrice;

    @Size(max = 50)
    private String seatNumbers;
}
