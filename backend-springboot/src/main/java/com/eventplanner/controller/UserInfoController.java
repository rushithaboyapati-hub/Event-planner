package com.eventplanner.controller;

import com.eventplanner.dto.UserInfoResponse;
import com.eventplanner.exception.ResourceNotFoundException;
import com.eventplanner.model.User;
import com.eventplanner.repository.UserRepository;
import com.eventplanner.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserInfoController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public UserInfoController(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/uinfo")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String authHeader) {
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

        UserInfoResponse response = new UserInfoResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getIsVerified(),
                user.getBio(),
                user.getPhone(),
                user.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }
}
