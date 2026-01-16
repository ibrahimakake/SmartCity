package backend.backend.tourism.atm;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ATMService {

    private final ATMRepository atmRepository;

    @Transactional(readOnly = true)
    public List<ATM> getAllATMs() {
        return atmRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ATM getATMById(UUID id) {
        return atmRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ATM not found"));
    }

    @Transactional
    public ATM createATM(ATM atm) {
        return atmRepository.save(atm);
    }

    @Transactional
    public ATM updateATM(UUID id, ATM details) {
        return atmRepository.findById(id)
                .map(atm -> {
                    // Basic information
                    atm.setName(details.getName());
                    atm.setBankName(details.getBankName());
                    atm.setAddress(details.getAddress());
                    atm.setDescription(details.getDescription());
                    
                    // Status
                    atm.setActive(details.isActive());
                    
                    return atmRepository.save(atm);
                })
                .orElseThrow(() -> new EntityNotFoundException("ATM not found"));
    }

    @Transactional
    public void deleteATM(UUID id) {
        atmRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ATM> searchATMs(String query) {
        return atmRepository.findByNameContainingIgnoreCaseOrBankNameContainingIgnoreCaseOrAddressContainingIgnoreCase(
                query, query, query);
    }
}
