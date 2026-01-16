package backend.backend.tourism.attraction;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "attractions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Attraction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "Attraction name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String category;

    @NotNull(message = "Ticket price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Ticket price must be >= 0")
    @Column(name = "ticket_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal ticketPrice;

    @NotBlank(message = "Description is required")
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String description;

    // ============= NEW FIELDS =============

    // Change from @NotBlank to optional
    @Size(max = 200)
    @Column(length = 200)  // Remove nullable = false
    private String address;

    @Size(max = 20)
    @Column(name = "contact_number", length = 20)  // Remove nullable = false
    private String contactNumber;

    @Size(max = 500)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // ======================================

    // Class-diagram methods (domain methods)
    public void updateDetails(String name, String category, String description) {
        this.name = name;
        this.category = category;
        this.description = description;
    }

    public void updateTicketPrice(BigDecimal price) {
        this.ticketPrice = price;
    }
}