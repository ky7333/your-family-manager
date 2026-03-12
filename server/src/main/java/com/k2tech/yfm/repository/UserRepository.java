package com.k2tech.yfm.repository;

import com.k2tech.yfm.model.User;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class UserRepository implements PanacheRepositoryBase<User, UUID> {
    public User findByUsername(String username) {
        return find("username", username).firstResult();
    }

    public List<User> searchByUsername(String query, String excludedUsername, int limit) {
        return find(
                "lower(username) like ?1 and lower(username) <> ?2 order by username",
                "%" + query.toLowerCase() + "%",
                excludedUsername.toLowerCase()
        ).page(Page.ofSize(limit)).list();
    }
}
