package com.k2tech.yfm.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
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

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "todo_list_member",
            joinColumns = @JoinColumn(name = "list_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    public List<User> members = new ArrayList<>();
}
