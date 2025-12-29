package backend.backend.student.college;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CollegeService {

    private final CollegeRepository collegeRepository;

    @Transactional(readOnly = true)
    public List<College> getAllColleges() {
        return collegeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public College getCollegeById(UUID id) {
        return collegeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("College not found"));
    }

    @Transactional
    public College createCollege(College college) {
        return collegeRepository.save(college);
    }

    @Transactional
    public College updateCollege(UUID id, College details) {
        return collegeRepository.findById(id)
                .map(college -> {
                    college.setName(details.getName());
                    college.setAddress(details.getAddress());
                    college.setContact(details.getContact());
                    college.setDescription(details.getDescription());
                    college.setOpenTime(details.getOpenTime());
                    college.setCloseTime(details.getCloseTime());
                    return collegeRepository.save(college);
                })
                .orElseThrow(() -> new EntityNotFoundException("College not found"));
    }

    @Transactional
    public void deleteCollege(UUID id) {
        collegeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<College> searchColleges(String query) {
        return collegeRepository
                .findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(query, query);
    }
}
