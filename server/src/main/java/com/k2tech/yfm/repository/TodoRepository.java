package com.k2tech.yfm.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import com.k2tech.yfm.model.Todo;

import java.util.UUID;

@ApplicationScoped
public class TodoRepository implements PanacheRepositoryBase<Todo, UUID> {
    // Add custom queries here if needed
}
