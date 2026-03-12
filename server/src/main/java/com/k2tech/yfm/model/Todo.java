package com.k2tech.yfm.model;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.id.uuid.UuidVersion7Strategy;

import java.util.UUID;

@Entity
public class Todo extends PanacheEntityBase {
    @Id
    @UuidGenerator(algorithm = UuidVersion7Strategy.class)
    public UUID id;

    public String title;
    public boolean completed;

    @ManyToOne
    public User createdBy;

    @ManyToOne
    public User completedBy;

}
