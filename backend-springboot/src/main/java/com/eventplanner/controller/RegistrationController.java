package com.eventplanner.controller;

import com.eventplanner.model.Registration;
import com.eventplanner.service.RegistrationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/events/{eventId}/register")
    @PreAuthorize("hasAnyRole('USER', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<Registration> register(
            @PathVariable Long eventId,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registrationService.registerUser(eventId, userId));
    }

    @DeleteMapping("/events/{eventId}/register")
    @PreAuthorize("hasAnyRole('USER', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<Void> cancelRegistration(
            @PathVariable Long eventId,
            @RequestParam Long userId) {
        registrationService.cancelRegistration(eventId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{userId}/registrations")
    @PreAuthorize("hasAnyRole('USER', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<Registration>> getUserRegistrations(@PathVariable Long userId) {
        return ResponseEntity.ok(registrationService.getUserRegistrations(userId));
    }

    @GetMapping("/events/{eventId}/registrations")
    @PreAuthorize("hasAnyRole('USER', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<Registration>> getEventRegistrations(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.getEventRegistrations(eventId));
    }

    @PatchMapping("/registrations/{registrationId}/attend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markAttended(@PathVariable Long registrationId) {
        registrationService.markAttended(registrationId);
        return ResponseEntity.noContent().build();
    }
}
