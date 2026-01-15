package backend.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Value("${cors.allowed-methods}")
    private String[] allowedMethods;

    @Value("${cors.allowed-headers}")
    private String allowedHeaders;

    @Value("${cors.allow-credentials}")
    private boolean allowCredentials;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods(allowedMethods)
                .allowedHeaders(allowedHeaders.split(","))
                .allowCredentials(allowCredentials)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static resources from classpath
        registry.addResourceHandler(
                "/**/*.css",
                "/**/*.js",
                "/**/*.json",
                "/**/*.png",
                "/**/*.jpg",
                "/**/*.jpeg",
                "/**/*.gif",
                "/**/*.svg",
                "/**/*.ico",
                "/**/*.ttf",
                "/**/*.woff",
                "/**/*.woff2"
        )
        .addResourceLocations(
                "classpath:/static/"
        );

        // Serve index.html for all other requests (SPA fallback)
        registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/")
            .resourceChain(true)
            .addResolver(new PathResourceResolver() {
                @Override
                protected Resource getResource(String resourcePath, Resource location) throws IOException {
                    Resource requestedResource = location.createRelative(resourcePath);
                    return requestedResource.exists() && requestedResource.isReadable()
                        ? requestedResource
                        : new ClassPathResource("/static/index.html");
                }
            });
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Map the root URL to index.html
        registry.addViewController("/").setViewName("forward:/index.html");

        // Map all other frontend routes to index.html for SPA routing
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/index.html");

        // Map nested frontend routes (one level deep)
        registry.addViewController("/{path:[^\\.]*}/{path2:[^\\.]*}")
                .setViewName("forward:/index.html");

        // Map deeper nested routes (two levels deep)
        registry.addViewController("/{path:[^\\.]*}/{path2:[^\\.]*}/{path3:[^\\.]*}")
                .setViewName("forward:/index.html");

        // Map all other paths to index.html
        registry.addViewController("/**/{path:[^\\.]*}")
                .setViewName("forward:/index.html");
    }
}