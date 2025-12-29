package backend.backend.core.user.user_dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class TouristProfileRequestDTO {

    @Size(max = 150, message = "Nationality must not exceed 150 characters")
    private String nationality;

    @Size(max = 500, message = "Preferences must not exceed 500 characters")
    private String preferences;

    private Set<String> interests;
}
