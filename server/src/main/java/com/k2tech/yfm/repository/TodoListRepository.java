package com.k2tech.yfm.repository;

import com.k2tech.yfm.model.TodoList;
import com.k2tech.yfm.model.User;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class TodoListRepository implements PanacheRepositoryBase<TodoList, UUID> {
    public List<TodoList> findAccessibleByUser(User user) {
        return find("select distinct l from TodoList l join l.members m where m = ?1 order by l.name", user).list();
    }

    public Optional<TodoList> findByIdForUser(UUID id, User user) {
        return find("select distinct l from TodoList l join l.members m where l.id = ?1 and m = ?2", id, user)
                .firstResultOptional();
    }
}
