package backend.backend.job.company;

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
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final IndustryRepository industryRepository;

    // =========================
    // READ
    // =========================
    @Transactional(readOnly = true)
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Company getCompanyById(UUID id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));
    }

    @Transactional(readOnly = true)
    public List<Company> getCompaniesByIndustry(UUID industryId) {
        return companyRepository.findByIndustry_Id(industryId);
    }

    // =========================
    // WRITE (ADMIN)
    // =========================
    @Transactional
    public Company createCompany(Company company, UUID industryId) {

        Industry industry = industryRepository.findById(industryId)
                .orElseThrow(() -> new EntityNotFoundException("Industry not found"));

        company.setIndustry(industry);
        return companyRepository.save(company);
    }

    @Transactional
    public Company updateCompany(UUID id, Company details) {
        return companyRepository.findById(id)
                .map(company -> {
                    company.setName(details.getName());
                    company.setContactNumber(details.getContactNumber());
                    company.setEmail(details.getEmail());
                    company.setSector(details.getSector());
                    company.setAddress(details.getAddress());
                    return companyRepository.save(company);
                })
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));
    }

    @Transactional
    public void deleteCompany(UUID id) {
        companyRepository.deleteById(id);
    }
}
