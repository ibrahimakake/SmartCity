package backend.backend.job.joblisting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobListingRepository extends JpaRepository<JobListing, UUID> {

    List<JobListing> findByCompany_Id(UUID companyId);

    List<JobListing> findByIndustry_Id(UUID industryId);

    List<JobListing> findByTitleContainingIgnoreCase(String keyword);
}
