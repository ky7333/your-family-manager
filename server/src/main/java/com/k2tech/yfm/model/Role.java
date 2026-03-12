package com.k2tech.yfm.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import io.quarkus.security.jpa.RolesValue;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.id.uuid.UuidVersion7Strategy;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "role")
public class Role extends PanacheEntityBase {
    @Id
    @UuidGenerator(algorithm = UuidVersion7Strategy.class)
    public UUID id;

    @RolesValue
    @Column(name = "role", nullable = false)
    public String role;

    @ManyToMany(mappedBy = "roles")
    @JsonIgnore
    public List<User> users;
}

