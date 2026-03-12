package org.acme;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

@QuarkusTest
class GreetingResourceTest {
    @Test
    void testMeRequiresAuthentication() {
        given()
          .when().get("/me")
          .then()
             .statusCode(401);
    }

}
