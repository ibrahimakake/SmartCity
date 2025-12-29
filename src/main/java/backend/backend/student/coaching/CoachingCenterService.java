package backend.backend.student.coaching;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CoachingCenterService {

    private final CoachingCenterRepository coachingCenterRepository;

    @Transactional(readOnly = true)
    public List<CoachingCenter> getAllCenters() {
        return coachingCenterRepository.findAll();
    }

    @Transactional(readOnly = true)
    public CoachingCenter getCenterById(UUID id) {
        return coachingCenterRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Coaching center not found"));
    }

    @Transactional
    public CoachingCenter createCenter(CoachingCenter center) {
        return coachingCenterRepository.save(center);
    }

    @Transactional
    public CoachingCenter updateCenter(UUID id, CoachingCenter details) {
        return coachingCenterRepository.findById(id)
                .map(c -> {
                    c.setName(details.getName());
                    c.setAddress(details.getAddress());
                    c.setContact(details.getContact());
                    c.setSpecialization(details.getSpecialization());
                    c.setDescription(details.getDescription());
                    c.setOpenTime(details.getOpenTime());
                    c.setCloseTime(details.getCloseTime());
                    return coachingCenterRepository.save(c);
                })
                .orElseThrow(() -> new EntityNotFoundException("Coaching center not found"));
    }

    @Transactional
    public void deleteCenter(UUID id) {
        coachingCenterRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CoachingCenter> searchCenters(String query) {
        return coachingCenterRepository
                .findByNameContainingIgnoreCaseOrAddressContainingIgnoreCaseOrSpecializationContainingIgnoreCase(
                        query, query, query
                );
    }
}
