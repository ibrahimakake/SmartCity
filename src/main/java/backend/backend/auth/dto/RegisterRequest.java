package backend.backend.auth.dto;

import backend.backend.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {

    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String password;

    // Selected from frontend dropdown
    private Role role;
}
