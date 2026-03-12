package com.k2tech.yfm.repository;

import com.k2tech.yfm.model.TodoList;
import com.k2tech.yfm.model.TodoListMembershipLevel;
import com.k2tech.yfm.model.User;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class TodoListRepository implements PanacheRepositoryBase<TodoList, UUID> {
    public List<TodoList> findAccessibleByUser(User user) {
        return find("""
                select distinct l from TodoList l
                join l.memberships membership
                where membership.user = ?1
                order by l.name
                """, user).list();
    }

    public Optional<TodoList> findByIdForUser(UUID id, User user) {
        return find("""
                select distinct l from TodoList l
                join l.memberships membership
                where l.id = ?1 and membership.user = ?2
                """, id, user).firstResultOptional();
    }

    public Optional<TodoList> findByIdWritableForUser(UUID id, User user) {
        return find("""
                select distinct l from TodoList l
                join l.memberships membership
                where l.id = ?1
                  and membership.user = ?2
                  and membership.membershipLevel in (?3, ?4)
                """, id, user, TodoListMembershipLevel.OWNER, TodoListMembershipLevel.READ_WRITE)
                .firstResultOptional();
    }
}
