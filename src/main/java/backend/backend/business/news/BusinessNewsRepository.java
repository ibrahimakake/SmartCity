package backend.backend.business.news;

import backend.backend.job.industry.Industry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessNewsRepository extends JpaRepository<BusinessNews, UUID> {

    List<BusinessNews> findByIndustry(Industry industry);

    List<BusinessNews> findByTitleContainingIgnoreCase(String keyword);
}
