package com.k2tech.yfm.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.id.uuid.UuidVersion7Strategy;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Entity
public class Todo extends PanacheEntityBase {
    @Id
    @UuidGenerator(algorithm = UuidVersion7Strategy.class)
    public UUID id;

    public String title;
    public boolean completed;
    @Column(length = 2000)
    public String details;
    @Column(name = "due_date")
    public LocalDate dueDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    public TodoPriority priority = TodoPriority.MEDIUM;
    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt;
    @Column(name = "completed_at")
    public LocalDateTime completedAt;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "list_id", nullable = false)
    public TodoList todoList;

    @ManyToOne
    public User createdBy;

    @ManyToOne
    public User completedBy;

    @JsonProperty("todoList")
    public Map<String, Object> getTodoListSummary() {
        if (todoList == null) {
            return null;
        }
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("id", todoList.id);
        summary.put("name", todoList.name);
        return summary;
    }

}
