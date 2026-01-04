package backend.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get the absolute path to the frontend directory
        String frontendPath = Paths.get("frontend/frontend").toAbsolutePath().toString();
        
        // Serve static resources from frontend directory
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
            "file:" + frontendPath + "/",
            "classpath:/META-INF/resources/",
            "classpath:/resources/",
            "classpath:/static/",
            "classpath:/public/"
        );

        // Serve index.html for all other requests (SPA fallback)
        registry.addResourceHandler("/**")
                .addResourceLocations("file:" + frontendPath + "/")
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
