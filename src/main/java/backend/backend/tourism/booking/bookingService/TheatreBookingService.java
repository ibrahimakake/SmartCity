package backend.backend.tourism.booking.bookingService;

import backend.backend.core.user.user_entity.TouristProfile;
import backend.backend.core.user.user_repository.TouristProfileRepository;
import backend.backend.enums.BookingStatus;
import backend.backend.tourism.booking.bookingEntity.TheatreBooking;
import backend.backend.tourism.booking.bookingRepository.TheatreBookingRepository;
import backend.backend.tourism.booking.dto.TheatreBookingRequest;
import backend.backend.tourism.theatre.Theatre;
import backend.backend.tourism.theatre.TheatreRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TheatreBookingService {

    private final TheatreBookingRepository theatreBookingRepository;
    private final TouristProfileRepository touristProfileRepository;
    private final TheatreRepository theatreRepository;

    @Transactional
    public TheatreBooking createBooking(TheatreBookingRequest request) {

        TouristProfile profile = touristProfileRepository.findById(request.getTouristProfileId())
                .orElseThrow(() -> new EntityNotFoundException("Tourist profile not found"));

        Theatre theatre = theatreRepository.findById(request.getTheatreId())
                .orElseThrow(() -> new EntityNotFoundException("Theatre not found"));
        TheatreBooking booking = new TheatreBooking();
        booking.setTouristProfile(profile);
        booking.setTheatre(theatre);
        booking.setShowTime(request.getShowTime());
        booking.setNumberOfTickets(request.getNumberOfTickets());

        // Ensure totalPrice is not null and has the correct scale
        BigDecimal totalPrice = request.getTotalPrice() != null
                ? request.getTotalPrice().setScale(2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        booking.setTotalPrice(totalPrice);

        booking.setSeatNumbers(request.getSeatNumbers());
        booking.setStatus(BookingStatus.CONFIRMED);

        return theatreBookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public TheatreBooking getById(UUID id) {
        return theatreBookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Theatre booking not found"));
    }

    @Transactional(readOnly = true)
    public java.util.List<TheatreBooking> getBookingsByTouristProfileId(UUID touristProfileId) {
        return theatreBookingRepository.findByTouristProfileId(touristProfileId);
    }

    @Transactional
    public void cancel(UUID id) {
        TheatreBooking booking = getById(id);
        booking.setStatus(BookingStatus.CANCELLED);
        theatreBookingRepository.save(booking); // explicit like we did for reservation
    }
}
