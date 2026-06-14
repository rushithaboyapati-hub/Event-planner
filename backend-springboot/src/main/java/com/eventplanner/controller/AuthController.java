package com.eventplanner.controller;

import com.eventplanner.dto.LoginRequest;
import com.eventplanner.dto.LoginResponse;
import com.eventplanner.exception.ResourceNotFoundException;
import com.eventplanner.model.User;
import com.eventplanner.repository.UserRepository;
import com.eventplanner.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, JwtTokenProvider jwtTokenProvider,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User with email " + request.getEmail(), 0L));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Invalid email or password"));
        }

        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("error", "Account pending admin approval"));
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new LoginResponse(token, user.getId(), user.getEmail(),
                user.getName(), user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("error", "Email already registered"));
        }

        long userCount = userRepository.count();

        if (userCount == 0) {
            // First user ever: auto-verified admin (bootstrap)
            user.setRole(User.UserRole.ADMIN);
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
            user.setIsVerified(true);
            User saved = userRepository.save(user);
            String token = jwtTokenProvider.generateToken(saved.getId(), saved.getEmail(), saved.getRole().name());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new LoginResponse(token, saved.getId(), saved.getEmail(),
                            saved.getName(), saved.getRole().name()));
        }

        if (user.getRole() == User.UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", "Cannot register as ADMIN. Contact an existing admin to assign this role."));
        }

        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        if (user.getRole() == null) {
            user.setRole(User.UserRole.USER);
        }
        user.setIsVerified(false);
        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(java.util.Map.of(
                        "message", "Registration submitted. An admin must approve this account before login.",
                        "userId", saved.getId(),
                        "email", saved.getEmail(),
                        "name", saved.getName(),
                        "role", saved.getRole().name(),
                        "isVerified", saved.getIsVerified()
                ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Missing or invalid token"));
        }
        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Invalid or expired token"));
        }
        Long userId = jwtTokenProvider.getUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return ResponseEntity.ok(new LoginResponse(token, user.getId(), user.getEmail(),
                user.getName(), user.getRole().name()));
    }
}
