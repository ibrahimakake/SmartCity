package backend.backend.job.industry;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IndustryService {

    private final IndustryRepository industryRepository;

    @Transactional(readOnly = true)
    public List<Industry> getAllIndustries() {
        return industryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Industry getIndustryById(UUID id) {
        return industryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Industry not found"));
    }

    @Transactional
    public Industry createIndustry(Industry industry) {
        return industryRepository.save(industry);
    }

    @Transactional
    public Industry updateIndustry(UUID id, Industry details) {
        return industryRepository.findById(id)
                .map(industry -> {
                    industry.setName(details.getName());
                    industry.setDescription(details.getDescription());
                    return industryRepository.save(industry);
                })
                .orElseThrow(() -> new EntityNotFoundException("Industry not found"));
    }

    @Transactional
    public void deleteIndustry(UUID id) {
        industryRepository.deleteById(id);
    }
}
