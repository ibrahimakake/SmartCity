package backend.backend.student.college;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/colleges")
@RequiredArgsConstructor
public class CollegeController {

    private final CollegeService collegeService;

    // =========================
    // VIEW (all authenticated users)
    // =========================
    @GetMapping
    public ResponseEntity<List<College>> getAll() {
        return ResponseEntity.ok(collegeService.getAllColleges());
    }

    @GetMapping("/{id}")
    public ResponseEntity<College> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(collegeService.getCollegeById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<College>> search(@RequestParam String query) {
        return ResponseEntity.ok(collegeService.searchColleges(query));
    }

    // =========================
    // ADMIN ONLY
    // =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<College> create(@Valid @RequestBody College college) {
        College created = collegeService.createCollege(college);
        return ResponseEntity
                .created(URI.create("/api/colleges/" + created.getId()))
                .body(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<College> update(
            @PathVariable UUID id,
            @Valid @RequestBody College details) {
        return ResponseEntity.ok(collegeService.updateCollege(id, details));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        collegeService.deleteCollege(id);
        return ResponseEntity.noContent().build();
    }
}
