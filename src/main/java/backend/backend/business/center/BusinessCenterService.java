package backend.backend.business.center;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BusinessCenterService {

    private final BusinessCenterRepository businessCenterRepository;

    // ✅ READ (all authenticated users)
    @Transactional(readOnly = true)
    public List<BusinessCenter> getAllCenters() {
        return businessCenterRepository.findAll();
    }

    @Transactional(readOnly = true)
    public BusinessCenter getCenterById(UUID id) {
        return businessCenterRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Business center not found"));
    }

    @Transactional(readOnly = true)
    public List<BusinessCenter> searchCenters(String query) {
        return businessCenterRepository
                .findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(query, query);
    }

    // 🔒 WRITE (ADMIN)
    @Transactional
    public BusinessCenter createCenter(BusinessCenter center) {
        return businessCenterRepository.save(center);
    }

    @Transactional
    public BusinessCenter updateCenter(UUID id, BusinessCenter details) {
        return businessCenterRepository.findById(id)
                .map(center -> {
                    center.setName(details.getName());
                    center.setSector(details.getSector());
                    center.setAddress(details.getAddress());
                    center.setDescription(details.getDescription());
                    return businessCenterRepository.save(center);
                })
                .orElseThrow(() -> new EntityNotFoundException("Business center not found"));
    }

    @Transactional
    public void deleteCenter(UUID id) {
        businessCenterRepository.deleteById(id);
    }
}
