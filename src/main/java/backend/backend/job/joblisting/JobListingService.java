package backend.backend.job.joblisting;

import backend.backend.job.company.Company;
import backend.backend.job.company.CompanyRepository;
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
public class JobListingService {

    private final JobListingRepository jobListingRepository;
    private final CompanyRepository companyRepository;
    private final IndustryRepository industryRepository;

    // =========================
    // READ
    // =========================
    @Transactional(readOnly = true)
    public List<JobListing> getAllJobListings() {
        return jobListingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public JobListing getJobListingById(UUID id) {
        return jobListingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Job listing not found"));
    }

    @Transactional(readOnly = true)
    public List<JobListing> getJobListingsByCompany(UUID companyId) {
        return jobListingRepository.findByCompany_Id(companyId);
    }

    @Transactional(readOnly = true)
    public List<JobListing> getJobListingsByIndustry(UUID industryId) {
        return jobListingRepository.findByIndustry_Id(industryId);
    }

    @Transactional(readOnly = true)
    public List<JobListing> searchJobListings(String keyword) {
        return jobListingRepository.findByTitleContainingIgnoreCase(keyword);
    }

    // =========================
    // WRITE (ADMIN)
    // =========================
    @Transactional
    public JobListing createJobListing(JobListing jobListing, UUID companyId, UUID industryId) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));

        Industry industry = industryRepository.findById(industryId)
                .orElseThrow(() -> new EntityNotFoundException("Industry not found"));

        jobListing.setCompany(company);
        jobListing.setIndustry(industry);

        return jobListingRepository.save(jobListing);
    }

    @Transactional
    public JobListing updateJobListing(UUID id, JobListing details) {
        return jobListingRepository.findById(id)
                .map(job -> {
                    job.setTitle(details.getTitle());
                    job.setDescription(details.getDescription());
                    job.setSalary(details.getSalary());
                    return jobListingRepository.save(job);
                })
                .orElseThrow(() -> new EntityNotFoundException("Job listing not found"));
    }

    @Transactional
    public void deleteJobListing(UUID id) {
        jobListingRepository.deleteById(id);
    }
}
