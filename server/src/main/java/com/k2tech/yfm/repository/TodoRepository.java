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
    public List<Todo> findByUser(User user) {
        return find("select distinct t from Todo t join t.todoList l join l.members m where m = ?1 order by t.completed asc, t.createdAt desc", user).list();
    }

    public List<Todo> findByListAndUser(UUID listId, User user) {
        return find("select distinct t from Todo t join t.todoList l join l.members m where l.id = ?1 and m = ?2 order by t.completed asc, t.createdAt desc", listId, user).list();
    }

    public Optional<Todo> findByIdForUser(UUID id, User user) {
        return find("select distinct t from Todo t join t.todoList l join l.members m where t.id = ?1 and m = ?2", id, user)
                .firstResultOptional();
    }
}
