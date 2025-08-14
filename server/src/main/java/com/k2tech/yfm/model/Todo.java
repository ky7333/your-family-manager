package com.k2tech.yfm.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
public class Todo extends PanacheEntity {
    public String title;
    public boolean completed;

    @ManyToOne
    public User createdBy;

    @ManyToOne
    public User completedBy;
}
