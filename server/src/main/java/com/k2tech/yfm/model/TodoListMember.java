package com.k2tech.yfm.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "todo_list_member")
public class TodoListMember extends PanacheEntityBase {

    @EmbeddedId
    public TodoListMemberId id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("listId")
    @JoinColumn(name = "list_id", nullable = false)
    public TodoList todoList;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_level", nullable = false, length = 32)
    public TodoListMembershipLevel membershipLevel;
}
