package com.eventplanner.controller;

import com.eventplanner.exception.ResourceNotFoundException;
import com.eventplanner.model.Venue;
import com.eventplanner.repository.VenueRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueRepository venueRepository;

    public VenueController(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    @GetMapping
    public ResponseEntity<List<Venue>> getAll() {
        return ResponseEntity.ok(venueRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<Venue> create(@RequestBody Venue venue) {
        return ResponseEntity.status(HttpStatus.CREATED).body(venueRepository.save(venue));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<Venue> update(@PathVariable Long id, @RequestBody Venue venue) {
        Venue existing = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", id));
        if (venue.getName() != null) existing.setName(venue.getName());
        if (venue.getAddress() != null) existing.setAddress(venue.getAddress());
        if (venue.getCity() != null) existing.setCity(venue.getCity());
        if (venue.getCapacity() != null) existing.setCapacity(venue.getCapacity());
        if (venue.getFacilities() != null) existing.setFacilities(venue.getFacilities());
        return ResponseEntity.ok(venueRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!venueRepository.existsById(id)) {
            throw new ResourceNotFoundException("Venue", id);
        }
        venueRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
