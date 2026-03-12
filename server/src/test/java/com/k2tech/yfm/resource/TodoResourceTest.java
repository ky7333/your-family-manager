package com.k2tech.yfm.resource;

import com.k2tech.yfm.model.Role;
import com.k2tech.yfm.model.Todo;
import com.k2tech.yfm.model.User;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.MediaType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;

@QuarkusTest
class TodoResourceTest {

    @BeforeEach
    @Transactional
    void setUp() {
        Todo.deleteAll();
        User.deleteAll();
        Role.deleteAll();

        User.add("alice", "alice", Set.of("user"));
        User.add("bob", "bob", Set.of("user"));
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void listOnlyReturnsCurrentUsersTodos() {
        createTodoFor("alice", "Alice todo", false);
        createTodoFor("bob", "Bob todo", false);

        given()
                .when().get("/todos")
                .then()
                .statusCode(200)
                .body("$", hasSize(1))
                .body("[0].title", equalTo("Alice todo"))
                .body("[0].createdBy.username", equalTo("alice"));
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void cannotAccessAnotherUsersTodoById() {
        UUID bobTodoId = createTodoFor("bob", "Bob secret", false);

        given()
                .when().get("/todos/{id}", bobTodoId)
                .then()
                .statusCode(404);
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void cannotUpdateOrDeleteAnotherUsersTodo() {
        UUID bobTodoId = createTodoFor("bob", "Bob secret", false);

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("title", "Should fail"))
                .when().put("/todos/{id}", bobTodoId)
                .then()
                .statusCode(404);

        given()
                .when().delete("/todos/{id}", bobTodoId)
                .then()
                .statusCode(404);
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void clearsCompletedByWhenTodoMarkedIncomplete() {
        UUID todoId = createTodoFor("alice", "Toggle me", false);

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("completed", true))
                .when().put("/todos/{id}", todoId)
                .then()
                .statusCode(200)
                .body("completed", is(true))
                .body("completedBy.username", equalTo("alice"));

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("completed", false))
                .when().put("/todos/{id}", todoId)
                .then()
                .statusCode(200)
                .body("completed", is(false))
                .body("completedBy", nullValue());
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void rejectsInvalidTodoPayloads() {
        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("title", "   ", "completed", false))
                .when().post("/todos")
                .then()
                .statusCode(400);

        UUID todoId = createTodoFor("alice", "Valid", false);

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("title", " "))
                .when().put("/todos/{id}", todoId)
                .then()
                .statusCode(400);
    }

    @Transactional
    UUID createTodoFor(String username, String title, boolean completed) {
        User owner = User.find("username", username).firstResult();
        Todo todo = new Todo();
        todo.title = title;
        todo.completed = completed;
        todo.createdBy = owner;
        todo.completedBy = completed ? owner : null;
        todo.persist();
        return todo.id;
    }
}
