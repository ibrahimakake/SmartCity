package backend.backend.business.news;

import backend.backend.core.user.user_entity.User;
import backend.backend.job.industry.Industry;
import backend.backend.job.industry.IndustryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BusinessNewsService {

    private final BusinessNewsRepository businessNewsRepository;
    private final IndustryRepository industryRepository;

    // =========================
    // READ (ALL USERS)
    // =========================
    @Transactional(readOnly = true)
    public List<BusinessNews> getAllNews() {
        return businessNewsRepository.findAll();
    }

    @Transactional(readOnly = true)
    public BusinessNews getById(UUID id) {
        return businessNewsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Business news not found"));
    }

    // =========================
    // CREATE (ADMIN)
    // =========================
    @Transactional
    public BusinessNews createNews(BusinessNews news, UUID industryId, User admin) {

        Industry industry = industryRepository.findById(industryId)
                .orElseThrow(() -> new EntityNotFoundException("Industry not found"));

        news.setIndustry(industry);
        news.setCreatedBy(admin);

        return businessNewsRepository.save(news);
    }

    // =========================
    // UPDATE (ADMIN)
    // =========================
    @Transactional
    public BusinessNews updateNews(UUID id, BusinessNews details) {
        return businessNewsRepository.findById(id)
                .map(news -> {
                    news.setTitle(details.getTitle());
                    news.setContent(details.getContent());
                    return businessNewsRepository.save(news);
                })
                .orElseThrow(() -> new EntityNotFoundException("Business news not found"));
    }

    // =========================
    // DELETE (ADMIN)
    // =========================
    @Transactional
    public void deleteNews(UUID id) {
        businessNewsRepository.deleteById(id);
    }
}
