package backend.backend.business.business;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;

    // =========================
    // READ
    // =========================
    @Transactional(readOnly = true)
    public List<Business> getAllBusinesses() {
        return businessRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Business getBusinessById(UUID id) {
        return businessRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Business not found"));
    }

    // =========================
    // CREATE (ADMIN)
    // =========================
    @Transactional
    public Business createBusiness(Business business) {
        return businessRepository.save(business);
    }

    // =========================
    // UPDATE (ADMIN)
    // =========================
    @Transactional
    public Business updateBusiness(UUID id, Business details) {
        return businessRepository.findById(id)
                .map(business -> {
                    business.setName(details.getName());
                    business.setSector(details.getSector());
                    business.setAddress(details.getAddress());
                    business.setDescription(details.getDescription());
                    business.setContact(details.getContact());
                    return businessRepository.save(business);
                })
                .orElseThrow(() -> new EntityNotFoundException("Business not found"));
    }

    // =========================
    // DELETE (ADMIN)
    // =========================
    @Transactional
    public void deleteBusiness(UUID id) {
        businessRepository.deleteById(id);
    }
}
