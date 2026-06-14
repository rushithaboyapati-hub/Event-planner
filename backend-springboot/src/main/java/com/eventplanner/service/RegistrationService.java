package com.eventplanner.service;

import com.eventplanner.exception.ConflictException;
import com.eventplanner.exception.ResourceNotFoundException;
import com.eventplanner.model.*;
import com.eventplanner.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final WaitlistRepository waitlistRepository;

    public RegistrationService(RegistrationRepository registrationRepository,
                               EventRepository eventRepository,
                               UserRepository userRepository,
                               WaitlistRepository waitlistRepository) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.waitlistRepository = waitlistRepository;
    }

    public Registration registerUser(Long eventId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));

        if (event.getStatus() == Event.EventStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot register for a cancelled event");
        }
        if (event.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot register for a past event");
        }

        registrationRepository.findByUserIdAndEventId(userId, eventId)
                .ifPresent(r -> { throw new ConflictException("Already registered for this event"); });

        checkSchedulingConflict(userId, event.getStartTime(), event.getEndTime());

        long confirmedCount = registrationRepository.countByEventIdAndStatus(
                eventId, Registration.RegistrationStatus.CONFIRMED);

        Registration registration = new Registration();
        registration.setUser(user);
        registration.setEvent(event);

        if (confirmedCount >= event.getCapacity()) {
            registration.setStatus(Registration.RegistrationStatus.PENDING);
            Registration saved = registrationRepository.save(registration);
            addToWaitlist(user, event);
            return saved;
        }

        registration.setStatus(Registration.RegistrationStatus.CONFIRMED);
        return registrationRepository.save(registration);
    }

    public void cancelRegistration(Long eventId, Long userId) {
        Registration registration = registrationRepository.findByUserIdAndEventId(userId, eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration for user " + userId + " on event " + eventId, 0L));

        registration.setStatus(Registration.RegistrationStatus.CANCELLED);
        registrationRepository.save(registration);

        promoteFromWaitlist(eventId);
    }

    public List<Registration> getUserRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId);
    }

    public List<Registration> getEventRegistrations(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }

    public void markAttended(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", registrationId));
        registration.setStatus(Registration.RegistrationStatus.ATTENDED);
        registrationRepository.save(registration);
    }

    private void checkSchedulingConflict(Long userId, LocalDateTime start, LocalDateTime end) {
        List<Registration> conflicts = registrationRepository.findConflictingRegistrations(userId, start, end);
        if (!conflicts.isEmpty()) {
            String eventTitles = conflicts.stream()
                    .map(r -> r.getEvent().getTitle())
                    .collect(Collectors.joining(", "));
            throw new ConflictException("Scheduling conflict with: " + eventTitles);
        }
    }

    private void addToWaitlist(User user, Event event) {
        if (waitlistRepository.findByUserIdAndEventId(user.getId(), event.getId()).isEmpty()) {
            Waitlist entry = new Waitlist();
            entry.setUser(user);
            entry.setEvent(event);
            entry.setPosition(waitlistRepository.countByEventId(event.getId()) + 1);
            waitlistRepository.save(entry);
        }
    }

    private void promoteFromWaitlist(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));

        long capacity = event.getCapacity();
        long confirmed = registrationRepository.countByEventIdAndStatus(eventId, Registration.RegistrationStatus.CONFIRMED);
        long available = capacity - confirmed;

        if (available > 0) {
            List<Waitlist> waitlisted = waitlistRepository.findByEventIdOrderByPositionAsc(eventId);
            for (int i = 0; i < Math.min(available, waitlisted.size()); i++) {
                Waitlist w = waitlisted.get(i);
                Registration reg = registrationRepository.findByUserIdAndEventId(w.getUser().getId(), eventId)
                        .orElse(null);
                if (reg != null && reg.getStatus() == Registration.RegistrationStatus.PENDING) {
                    reg.setStatus(Registration.RegistrationStatus.CONFIRMED);
                    registrationRepository.save(reg);
                }
            }
        }
    }
}
