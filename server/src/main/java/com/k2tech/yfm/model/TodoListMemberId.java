package com.k2tech.yfm.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class TodoListMemberId implements Serializable {
    @Column(name = "list_id")
    public UUID listId;

    @Column(name = "user_id")
    public UUID userId;

    public TodoListMemberId() {
    }

    public TodoListMemberId(UUID listId, UUID userId) {
        this.listId = listId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        TodoListMemberId that = (TodoListMemberId) o;
        return Objects.equals(listId, that.listId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(listId, userId);
    }
}
