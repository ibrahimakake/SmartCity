package backend.backend.tourism.attraction;

import backend.backend.tourism.attraction.Attraction;
import backend.backend.tourism.attraction.AttractionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttractionService {

    private final AttractionRepository attractionRepository;

    @Transactional(readOnly = true)
    public List<Attraction> getAllAttractions() {
        return attractionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Attraction getAttractionById(UUID id) {
        return attractionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Attraction not found"));
    }

    @Transactional
    public Attraction createAttraction(Attraction attraction) {
        return attractionRepository.save(attraction);
    }

    @Transactional
    public Attraction updateAttraction(UUID id, Attraction details) {
        return attractionRepository.findById(id)
                .map(attraction -> {
                    attraction.updateDetails(details.getName(), details.getCategory(), details.getDescription());
                    attraction.updateTicketPrice(details.getTicketPrice());
                    return attractionRepository.save(attraction);
                })
                .orElseThrow(() -> new EntityNotFoundException("Attraction not found"));
    }

    @Transactional
    public void deleteAttraction(UUID id) {
        attractionRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Attraction> searchAttractions(String query) {
        return attractionRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(query, query);
    }
}
