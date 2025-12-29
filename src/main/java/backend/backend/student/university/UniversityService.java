package backend.backend.student.university;

import backend.backend.student.university.University;
import backend.backend.student.university.repository.UniversityRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UniversityService {

    private final UniversityRepository universityRepository;

    @Transactional(readOnly = true)
    public List<University> getAllUniversities() {
        return universityRepository.findAll();
    }

    @Transactional(readOnly = true)
    public University getUniversityById(UUID id) {
        return universityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("University not found"));
    }

    @Transactional
    public University createUniversity(University university) {
        return universityRepository.save(university);
    }

    @Transactional
    public University updateUniversity(UUID id, University details) {
        return universityRepository.findById(id)
                .map(u -> {
                    u.setName(details.getName());
                    u.setAddress(details.getAddress());
                    u.setContact(details.getContact());
                    u.setOpenTime(details.getOpenTime());
                    u.setCloseTime(details.getCloseTime());
                    u.setDescription(details.getDescription());
                    u.setFaculties(details.getFaculties());
                    return universityRepository.save(u);
                })
                .orElseThrow(() -> new EntityNotFoundException("University not found"));
    }

    @Transactional
    public void deleteUniversity(UUID id) {
        if (!universityRepository.existsById(id)) {
            throw new EntityNotFoundException("University not found");
        }
        universityRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<University> search(String query) {
        return universityRepository.findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(query, query);
    }
}
