package com.k2tech.yfm.security.jpa;


import com.k2tech.yfm.model.User;
import org.eclipse.microprofile.config.ConfigProvider;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import io.quarkus.runtime.StartupEvent;

import java.util.Set;


@Singleton
public class Startup {
    @Transactional
    public void loadUsers(@Observes StartupEvent evt) {
        String profile = ConfigProvider.getConfig().getValue("quarkus.profile", String.class);
        if ("dev".equals(profile)) {
            // This is only for development purposes, do not use in production!
            if (User.count() == 0) {
                User.add("admin", "admin", Set.of("admin", "user"));
                User.add("user", "user", Set.of("user"));
            }

        }
    }
}
