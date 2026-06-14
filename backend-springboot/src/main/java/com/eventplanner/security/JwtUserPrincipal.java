package com.eventplanner.security;

import java.security.Principal;

public record JwtUserPrincipal(Long userId, String email, String role) implements Principal {
    @Override
    public String getName() {
        return email;
    }
}
