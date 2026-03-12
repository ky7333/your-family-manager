package com.k2tech.yfm.resource;

import com.k2tech.yfm.model.Role;
import com.k2tech.yfm.model.Todo;
import com.k2tech.yfm.model.TodoList;
import com.k2tech.yfm.model.TodoListMember;
import com.k2tech.yfm.model.TodoListMemberId;
import com.k2tech.yfm.model.TodoListMembershipLevel;
import com.k2tech.yfm.model.TodoPriority;
import com.k2tech.yfm.model.User;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.MediaType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;

@QuarkusTest
class TodoResourceTest {

    @BeforeEach
    @Transactional
    void setUp() {
        Todo.deleteAll();
        TodoList.deleteAll();
        User.deleteAll();
        Role.deleteAll();

        User.add("alice", "alice", Set.of("user"));
        User.add("bob", "bob", Set.of("user"));
        User.add("charlie", "charlie", Set.of("user"));
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void listOnlyReturnsTodosFromListsCurrentUserCanAccessIncludingReadOnly() {
        UUID aliceList = createListFor("alice", "Alice list", Set.of(), Set.of());
        UUID bobSharedWriteList = createListFor("bob", "Shared write", Set.of("alice"), Set.of());
        UUID bobSharedReadOnlyList = createListFor("bob", "Shared read-only", Set.of(), Set.of("alice"));
        UUID bobPrivateList = createListFor("bob", "Private", Set.of(), Set.of());

        createTodoFor(aliceList, "alice", "Alice todo", false);
        createTodoFor(bobSharedWriteList, "bob", "Shared write todo", false);
        createTodoFor(bobSharedReadOnlyList, "bob", "Shared readonly todo", false);
        createTodoFor(bobPrivateList, "bob", "Private todo", false);

        given()
                .when().get("/todos")
                .then()
                .statusCode(200)
                .body("$", hasSize(3))
                .body("title", hasItem("Alice todo"))
                .body("title", hasItem("Shared write todo"))
                .body("title", hasItem("Shared readonly todo"))
                .body("title", not(hasItem("Private todo")));
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void readOnlyMemberCanViewByIdButCannotWrite() {
        UUID listId = createListFor("bob", "Read-only for Alice", Set.of(), Set.of("alice"));
        UUID todoId = createTodoFor(listId, "bob", "Readonly task", false);

        given()
                .when().get("/todos/{id}", todoId)
                .then()
                .statusCode(200)
                .body("title", equalTo("Readonly task"));

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("completed", true))
                .when().put("/todos/{id}", todoId)
                .then()
                .statusCode(403);

        given()
                .when().delete("/todos/{id}", todoId)
                .then()
                .statusCode(403);

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "listId", listId,
                        "title", "Should fail",
                        "completed", false
                ))
                .when().post("/todos")
                .then()
                .statusCode(403);
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void listFilterReturnsOnlySelectedListTodos() {
        UUID chores = createListFor("alice", "Chores", Set.of(), Set.of());
        UUID shopping = createListFor("alice", "Shopping", Set.of(), Set.of());
        createTodoFor(chores, "alice", "Laundry", false);
        createTodoFor(shopping, "alice", "Milk", false);

        given()
                .queryParam("listId", chores)
                .when().get("/todos")
                .then()
                .statusCode(200)
                .body("$", hasSize(1))
                .body("[0].title", equalTo("Laundry"));
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void cannotAccessAnotherUsersPrivateTodoById() {
        UUID bobPrivateList = createListFor("bob", "Bob private", Set.of(), Set.of());
        UUID bobTodoId = createTodoFor(bobPrivateList, "bob", "Bob secret", false);

        given()
                .when().get("/todos/{id}", bobTodoId)
                .then()
                .statusCode(404);
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void cannotCreateTodoInInaccessibleList() {
        UUID bobPrivateList = createListFor("bob", "Bob private", Set.of(), Set.of());

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "listId", bobPrivateList,
                        "title", "Should fail",
                        "completed", false
                ))
                .when().post("/todos")
                .then()
                .statusCode(404);
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void supportsExtendedTodoFieldsAndCompletionMetadata() {
        UUID aliceList = createListFor("alice", "Alice list", Set.of(), Set.of());

        String todoId = given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "listId", aliceList,
                        "title", "Pay utility bill",
                        "details", "Pay online before late fee applies",
                        "dueDate", "2026-03-15",
                        "priority", "HIGH",
                        "completed", true
                ))
                .when().post("/todos")
                .then()
                .statusCode(201)
                .body("todoList.id", equalTo(aliceList.toString()))
                .body("details", equalTo("Pay online before late fee applies"))
                .body("dueDate", equalTo("2026-03-15"))
                .body("priority", equalTo("HIGH"))
                .body("completed", is(true))
                .body("completedBy.username", equalTo("alice"))
                .extract().path("id");

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "completed", false,
                        "details", "",
                        "dueDate", "",
                        "priority", "LOW"
                ))
                .when().put("/todos/{id}", todoId)
                .then()
                .statusCode(200)
                .body("completed", is(false))
                .body("completedBy", nullValue())
                .body("completedAt", nullValue())
                .body("details", nullValue())
                .body("dueDate", nullValue())
                .body("priority", equalTo("LOW"));
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void rejectsInvalidTodoPayloads() {
        UUID aliceList = createListFor("alice", "Alice list", Set.of(), Set.of());

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "listId", aliceList,
                        "title", "   ",
                        "completed", false
                ))
                .when().post("/todos")
                .then()
                .statusCode(400);

        given()
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "listId", aliceList,
                        "title", "Valid title",
                        "dueDate", "03/15/2026",
                        "completed", false
                ))
                .when().post("/todos")
                .then()
                .statusCode(400);
    }

    @Transactional
    UUID createListFor(String ownerUsername, String name, Set<String> sharedWrite, Set<String> sharedReadOnly) {
        User owner = User.find("username", ownerUsername).firstResult();
        TodoList todoList = new TodoList();
        todoList.name = name;
        todoList.createdBy = owner;
        todoList.persist();

        addMembership(todoList, owner, TodoListMembershipLevel.OWNER);
        for (String username : sharedWrite) {
            User member = User.find("username", username).firstResult();
            if (member != null) {
                addMembership(todoList, member, TodoListMembershipLevel.READ_WRITE);
            }
        }
        for (String username : sharedReadOnly) {
            User member = User.find("username", username).firstResult();
            if (member != null && todoList.memberships.stream().noneMatch(existing -> existing.user.id.equals(member.id))) {
                addMembership(todoList, member, TodoListMembershipLevel.READ_ONLY);
            }
        }

        return todoList.id;
    }

    @Transactional
    UUID createTodoFor(UUID listId, String createdByUsername, String title, boolean completed) {
        User owner = User.find("username", createdByUsername).firstResult();
        TodoList todoList = TodoList.findById(listId);
        Todo todo = new Todo();
        todo.title = title;
        todo.completed = completed;
        todo.details = null;
        todo.priority = TodoPriority.MEDIUM;
        todo.createdAt = LocalDateTime.now();
        todo.updatedAt = LocalDateTime.now();
        todo.completedAt = completed ? LocalDateTime.now() : null;
        todo.dueDate = LocalDate.now().plusDays(1);
        todo.todoList = todoList;
        todo.createdBy = owner;
        todo.completedBy = completed ? owner : null;
        todo.persist();
        return todo.id;
    }

    void addMembership(TodoList todoList, User user, TodoListMembershipLevel level) {
        if (todoList.memberships.stream().anyMatch(existing -> existing.user.id.equals(user.id))) {
            return;
        }
        TodoListMember membership = new TodoListMember();
        membership.todoList = todoList;
        membership.user = user;
        membership.membershipLevel = level;
        membership.id = new TodoListMemberId(todoList.id, user.id);
        todoList.memberships.add(membership);
    }
}
