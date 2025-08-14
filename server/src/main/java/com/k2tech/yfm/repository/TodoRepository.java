package com.k2tech.yfm.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import com.k2tech.yfm.model.Todo;

@ApplicationScoped
public class TodoRepository implements PanacheRepository<Todo> {
    // Add custom queries here if needed
}
