package backend.backend.tourism.attraction;

import backend.backend.tourism.attraction.Attraction;
import backend.backend.tourism.attraction.AttractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attractions")
@RequiredArgsConstructor
@Validated
public class AttractionController {

    private final AttractionService attractionService;

    //  VIEW (Tourist can view)
    @GetMapping
    public ResponseEntity<List<Attraction>> getAll() {
        return ResponseEntity.ok(attractionService.getAllAttractions());
    }

    //  VIEW (Tourist can view)
    @GetMapping("/{id}")
    public ResponseEntity<Attraction> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(attractionService.getAttractionById(id));
    }

    //  VIEW (Tourist can view)
    @GetMapping("/search")
    public ResponseEntity<List<Attraction>> search(@RequestParam @NotBlank(message = "Search query cannot be empty") String query) {
        return ResponseEntity.ok(attractionService.searchAttractions(query));
    }

    //  ADMIN only: create
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Attraction> create(@Valid @RequestBody Attraction attraction) {
        Attraction created = attractionService.createAttraction(attraction);
        return ResponseEntity.created(URI.create("/api/attractions/" + created.getId()))
                .body(created);
    }

    //  ADMIN only: update
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Attraction> update(@PathVariable UUID id, @Valid @RequestBody Attraction details) {
        return ResponseEntity.ok(attractionService.updateAttraction(id, details));
    }

    //  ADMIN only: delete
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        attractionService.deleteAttraction(id);
        return ResponseEntity.noContent().build();
    }
}
