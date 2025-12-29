package backend.backend.core.user.user_dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
public class TouristProfileResponseDTO {

    private UUID id;
    private UUID userId;

    private String nationality;
    private String preferences;
    private Set<String> interests;
}
