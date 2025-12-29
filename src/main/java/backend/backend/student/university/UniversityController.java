package backend.backend.student.university;

import backend.backend.student.university.University;
import backend.backend.student.university.UniversityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/universities")
@RequiredArgsConstructor
public class UniversityController {

    private final UniversityService universityService;

    // ✅ VIEW (all authenticated)
    @GetMapping
    public ResponseEntity<List<University>> getAll() {
        return ResponseEntity.ok(universityService.getAllUniversities());
    }

    // ✅ VIEW (all authenticated)
    @GetMapping("/{id}")
    public ResponseEntity<University> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(universityService.getUniversityById(id));
    }

    // ✅ VIEW (all authenticated)
    @GetMapping("/search")
    public ResponseEntity<List<University>> search(@RequestParam String query) {
        return ResponseEntity.ok(universityService.search(query));
    }

    // ✅ ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<University> create(@Valid @RequestBody University university) {
        University created = universityService.createUniversity(university);
        return ResponseEntity.created(URI.create("/api/universities/" + created.getId()))
                .body(created);
    }

    // ✅ ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<University> update(@PathVariable UUID id, @Valid @RequestBody University details) {
        return ResponseEntity.ok(universityService.updateUniversity(id, details));
    }

    // ✅ ADMIN ONLY
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        universityService.deleteUniversity(id);
        return ResponseEntity.noContent().build();
    }
}
