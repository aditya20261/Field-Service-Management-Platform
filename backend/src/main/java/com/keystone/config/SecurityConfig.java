package com.keystone.config;

import com.keystone.repository.UserRepository;
import com.keystone.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

        @Bean
        PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        UserDetailsService userDetailsService(UserRepository users) {
                return email -> users.findByEmail(email)
                                .map(u -> (UserDetails) User.withUsername(u.getEmail())
                                                .password(u.getPassword())
                                                .roles(u.getRole().name())
                                                .disabled(!u.isActive())
                                                .build())
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        }

        @Bean
        SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        JwtAuthFilter jwt) throws Exception {

                return http
                                .csrf(c -> c.disable())
                                .cors(c -> {
                                })
                                .sessionManagement(s -> s.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(a -> a

                                                // Public authentication endpoints
                                                .requestMatchers("/api/auth/**").permitAll()

                                                // Spring error endpoint
                                                .requestMatchers("/error").permitAll()

                                                // Swagger UI
                                                .requestMatchers(
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html")
                                                .permitAll()

                                                // OpenAPI documentation
                                                .requestMatchers(
                                                                "/v3/api-docs/**")
                                                .permitAll()

                                                // Everything else requires authentication
                                                .anyRequest().authenticated())

                                .addFilterBefore(
                                                jwt,
                                                UsernamePasswordAuthenticationFilter.class)

                                .build();
        }

        @Bean
        CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration config = new CorsConfiguration();

                config.setAllowedOrigins(List.of(
                                "http://localhost:5173",
                                "http://127.0.0.1:5173",
                                "http://localhost:4173",
                                "http://127.0.0.1:4173",
                                "https://field-service-management-35mg.onrender.com"));

                config.setAllowedMethods(List.of(
                                "GET",
                                "POST",
                                "PUT",
                                "DELETE",
                                "OPTIONS"));

                config.setAllowedHeaders(List.of(
                                "Authorization",
                                "Content-Type"));

                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                config);

                return source;
        }
}