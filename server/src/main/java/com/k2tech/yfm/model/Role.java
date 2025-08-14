package com.k2tech.yfm.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import io.quarkus.security.jpa.RolesValue;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "roles")
public class Role extends PanacheEntity {
    @RolesValue
    @Column(name = "role", nullable = false)
    public String role;

    @ManyToMany(mappedBy = "roles")
    @com.fasterxml.jackson.annotation.JsonIgnore
    public List<User> users;
}
