
package com.keystone.config;

import com.keystone.entity.Customer;
import com.keystone.entity.Role;
import com.keystone.entity.User;
import com.keystone.repository.CustomerRepository;
import com.keystone.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedUsers(
            UserRepository users,
            CustomerRepository customers,
            PasswordEncoder encoder) {

        return args -> {

            createUser(
                    users,
                    encoder,
                    "manager@keystone.com",
                    "KEYSTONE Manager",
                    Role.MANAGER
            );

            createUser(
                    users,
                    encoder,
                    "dispatcher@keystone.com",
                    "KEYSTONE Dispatcher",
                    Role.DISPATCHER
            );

            createUser(
                    users,
                    encoder,
                    "technician@keystone.com",
                    "KEYSTONE Technician",
                    Role.TECHNICIAN
            );

            // Second technician for Phase 8 authorization testing
            createUser(
                    users,
                    encoder,
                    "technician2@keystone.com",
                    "KEYSTONE Technician 2",
                    Role.TECHNICIAN
            );

            User customerUser = createUser(
                    users,
                    encoder,
                    "customer@keystone.com",
                    "KEYSTONE Customer",
                    Role.CUSTOMER
            );

            if (customers.findAll().stream()
                    .noneMatch(c -> c.getUser().getId().equals(customerUser.getId()))) {

                Customer customer = new Customer();
                customer.setUser(customerUser);
                customer.setPhone("");
                customers.save(customer);
            }
        };
    }

    private User createUser(
            UserRepository users,
            PasswordEncoder encoder,
            String email,
            String name,
            Role role) {

        return users.findByEmail(email).orElseGet(() -> {

            User u = new User();

            u.setEmail(email);
            u.setFullName(name);

            // Password: password
            u.setPassword(encoder.encode("password"));

            u.setRole(role);
            u.setActive(true);

            return users.save(u);
        });
    }
}

