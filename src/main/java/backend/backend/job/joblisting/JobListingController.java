package backend.backend.job.joblisting;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/job-listings")
@RequiredArgsConstructor
public class JobListingController {

    private final JobListingService jobListingService;

    // =========================
    // VIEW (ALL AUTH USERS)
    // =========================
    @GetMapping
    public ResponseEntity<List<JobListing>> getAll() {
        return ResponseEntity.ok(jobListingService.getAllJobListings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobListing> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(jobListingService.getJobListingById(id));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobListing>> getByCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(jobListingService.getJobListingsByCompany(companyId));
    }

    @GetMapping("/industry/{industryId}")
    public ResponseEntity<List<JobListing>> getByIndustry(@PathVariable UUID industryId) {
        return ResponseEntity.ok(jobListingService.getJobListingsByIndustry(industryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobListing>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(jobListingService.searchJobListings(keyword));
    }

    // =========================
    // ADMIN ONLY
    // =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<JobListing> create(
            @RequestParam UUID companyId,
            @RequestParam UUID industryId,
            @Valid @RequestBody JobListing jobListing) {

        JobListing created = jobListingService.createJobListing(jobListing, companyId, industryId);

        return ResponseEntity
                .created(URI.create("/api/job-listings/" + created.getId()))
                .body(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<JobListing> update(
            @PathVariable UUID id,
            @Valid @RequestBody JobListing details) {

        return ResponseEntity.ok(jobListingService.updateJobListing(id, details));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        jobListingService.deleteJobListing(id);
        return ResponseEntity.noContent().build();
    }
}
