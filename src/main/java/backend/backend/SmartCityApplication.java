package backend.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaAuditing  // ⚠️ CRITIQUE : Active @CreatedDate dans l'entité User
@EntityScan(basePackages = {
        "backend.backend.tourism",
        "backend.backend.job",
        "backend.backend.auth",
        "backend.backend.business",
        "backend.backend.core",
        "backend.backend.student"
})
@EnableJpaRepositories(basePackages = {
        "backend.backend.tourism",
        "backend.backend.job",
        "backend.backend.auth",
        "backend.backend.business",
        "backend.backend.core",
        "backend.backend.student"
})
public class SmartCityApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartCityApplication.class, args);
    }
}