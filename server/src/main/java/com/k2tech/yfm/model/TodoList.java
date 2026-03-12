package com.k2tech.yfm.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.id.uuid.UuidVersion7Strategy;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "todo_list")
public class TodoList extends PanacheEntityBase {
    @Id
    @UuidGenerator(algorithm = UuidVersion7Strategy.class)
    public UUID id;

    @Column(nullable = false, length = 255)
    public String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "createdby_id", nullable = false)
    public User createdBy;

    @JsonIgnore
    @OneToMany(mappedBy = "todoList", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<TodoListMember> memberships = new ArrayList<>();

    @JsonProperty("members")
    public List<User> getMembers() {
        return memberships.stream()
                .filter(member -> member.membershipLevel == TodoListMembershipLevel.OWNER
                        || member.membershipLevel == TodoListMembershipLevel.READ_WRITE)
                .map(member -> member.user)
                .toList();
    }

    @JsonProperty("readOnlyMembers")
    public List<User> getReadOnlyMembers() {
        return memberships.stream()
                .filter(member -> member.membershipLevel == TodoListMembershipLevel.READ_ONLY)
                .map(member -> member.user)
                .toList();
    }
}
