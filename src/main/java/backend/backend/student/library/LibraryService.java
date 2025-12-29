package backend.backend.student.library;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LibraryRepository libraryRepository;

    @Transactional(readOnly = true)
    public List<Library> getAllLibraries() {
        return libraryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Library getLibraryById(UUID id) {
        return libraryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Library not found"));
    }

    @Transactional
    public Library createLibrary(Library library) {
        return libraryRepository.save(library);
    }

    @Transactional
    public Library updateLibrary(UUID id, Library details) {
        return libraryRepository.findById(id)
                .map(lib -> {
                    lib.setName(details.getName());
                    lib.setAddress(details.getAddress());
                    lib.setContact(details.getContact());
                    lib.setDescription(details.getDescription());
                    lib.setOpenTime(details.getOpenTime());
                    lib.setCloseTime(details.getCloseTime());
                    return libraryRepository.save(lib);
                })
                .orElseThrow(() -> new EntityNotFoundException("Library not found"));
    }

    @Transactional
    public void deleteLibrary(UUID id) {
        libraryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Library> searchLibraries(String query) {
        return libraryRepository
                .findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(query, query);
    }
}
