package backend.backend.student.coaching;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/coaching-centers")
@RequiredArgsConstructor
public class CoachingCenterController {

    private final CoachingCenterService coachingCenterService;

    // =========================
    // VIEW (all authenticated users)
    // =========================
    @GetMapping
    public ResponseEntity<List<CoachingCenter>> getAll() {
        return ResponseEntity.ok(coachingCenterService.getAllCenters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoachingCenter> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(coachingCenterService.getCenterById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<CoachingCenter>> search(@RequestParam String query) {
        return ResponseEntity.ok(coachingCenterService.searchCenters(query));
    }

    // =========================
    // ADMIN ONLY
    // =========================
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<CoachingCenter> create(@Valid @RequestBody CoachingCenter center) {
        CoachingCenter created = coachingCenterService.createCenter(center);
        return ResponseEntity
                .created(URI.create("/api/coaching-centers/" + created.getId()))
                .body(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CoachingCenter> update(
            @PathVariable UUID id,
            @Valid @RequestBody CoachingCenter details) {
        return ResponseEntity.ok(coachingCenterService.updateCenter(id, details));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        coachingCenterService.deleteCenter(id);
        return ResponseEntity.noContent().build();
    }
}
