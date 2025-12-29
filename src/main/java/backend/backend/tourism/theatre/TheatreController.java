package backend.backend.tourism.theatre;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/theatres")
@RequiredArgsConstructor
public class TheatreController {

    private final TheatreService theatreService;

    //  VIEW: tourists can view
    @GetMapping
    public ResponseEntity<List<Theatre>> getAll() {
        return ResponseEntity.ok(theatreService.getAllTheatres());
    }

    //  VIEW: tourists can view
    @GetMapping("/{id}")
    public ResponseEntity<Theatre> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(theatreService.getTheatreById(id));
    }

    //  VIEW: tourists can view
    @GetMapping("/search")
    public ResponseEntity<List<Theatre>> search(@RequestParam String query) {
        return ResponseEntity.ok(theatreService.searchTheatres(query));
    }

    //  ADMIN ONLY: create
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Theatre> create(@Valid @RequestBody Theatre theatre) {
        Theatre created = theatreService.createTheatre(theatre);
        return ResponseEntity.created(URI.create("/api/theatres/" + created.getId()))
                .body(created);
    }

    //  ADMIN ONLY: update
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Theatre> update(@PathVariable UUID id, @Valid @RequestBody Theatre details) {
        return ResponseEntity.ok(theatreService.updateTheatre(id, details));
    }

    //  ADMIN ONLY: delete
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        theatreService.deleteTheatre(id);
        return ResponseEntity.noContent().build();
    }
}
