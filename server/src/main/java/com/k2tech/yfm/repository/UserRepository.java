package com.k2tech.yfm.repository;

import com.k2tech.yfm.model.User;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class UserRepository implements PanacheRepositoryBase<User, UUID> {
    public User findByUsername(String username) {
        return find("username", username).firstResult();
    }
}

