package com.k2tech.yfm.resource;

import com.k2tech.yfm.model.Role;
import com.k2tech.yfm.model.Todo;
import com.k2tech.yfm.model.User;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.nullValue;

@QuarkusTest
class UserResourceTest {

    @BeforeEach
    @Transactional
    void setUp() {
        Todo.deleteAll();
        User.deleteAll();
        Role.deleteAll();

        User.add("alice", "alice", Set.of("user"));
    }

    @Test
    void meRequiresAuthentication() {
        given()
                .when().get("/me")
                .then()
                .statusCode(401);
    }

    @Test
    @TestSecurity(user = "alice", roles = {"user"})
    void meReturnsCurrentUser() {
        given()
                .when().get("/me")
                .then()
                .statusCode(200)
                .body("username", equalTo("alice"))
                .body("password", nullValue());
    }
}
