package com.k2tech.yfm.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import com.k2tech.yfm.model.Todo;
import com.k2tech.yfm.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class TodoRepository implements PanacheRepositoryBase<Todo, UUID> {
    public List<Todo> findByOwner(User owner) {
        return find("createdBy", owner).list();
    }

    public Optional<Todo> findByIdAndOwner(UUID id, User owner) {
        return find("id = ?1 and createdBy = ?2", id, owner).firstResultOptional();
    }

    public boolean deleteByIdAndOwner(UUID id, User owner) {
        return delete("id = ?1 and createdBy = ?2", id, owner) == 1;
    }
}
