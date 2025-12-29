package backend.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;

@RestController
public class TestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/api/test")
    public String testConnection() {
        try {
            String result = jdbcTemplate.queryForObject("SELECT 'Database connection successful' as message", String.class);
            return result;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/api/schema")
    @Transactional
    public String checkSchema() {
        try {
            // Try to list all tables in the database
            List<String> tables = jdbcTemplate.queryForList(
                "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC'", 
                String.class
            );
            
            return "Tables in database: " + String.join(", ", tables);
        } catch (Exception e) {
            return "Error checking schema: " + e.getMessage();
        }
    }

    @GetMapping("/api/entities")
    @Transactional
    public String checkEntities() {
        try {
            // Try to query a simple entity to check if JPA is working
            List<?> result = entityManager.createQuery("SELECT t FROM Theatre t").getResultList();
            return "Number of Theatre entities: " + result.size();
        } catch (Exception e) {
            return "Error querying entities: " + e.getMessage();
        }
    }
}
