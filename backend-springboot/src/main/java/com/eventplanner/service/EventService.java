package com.eventplanner.service;

import com.eventplanner.dto.*;
import com.eventplanner.exception.ConflictException;
import com.eventplanner.exception.ResourceNotFoundException;
import com.eventplanner.model.*;
import com.eventplanner.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final VenueRepository venueRepository;
    private final TagRepository tagRepository;
    private final RegistrationRepository registrationRepository;

    public EventService(EventRepository eventRepository, UserRepository userRepository,
                        CategoryRepository categoryRepository, VenueRepository venueRepository,
                        TagRepository tagRepository, RegistrationRepository registrationRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.venueRepository = venueRepository;
        this.tagRepository = tagRepository;
        this.registrationRepository = registrationRepository;
    }

    public EventResponse createEvent(Long organizerId, EventRequest request) {
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot create events in the past");
        }

        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", organizerId));

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setCapacity(request.getCapacity());
        event.setOrganizer(organizer);
        event.setStatus(Event.EventStatus.PUBLISHED);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            event.setCategory(category);
        }

        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venue", request.getVenueId()));
            checkVenueConflict(request.getVenueId(), request.getStartTime(), request.getEndTime(), null);
            event.setVenue(venue);
        }

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            Set<Tag> tags = request.getTagIds().stream()
                    .map(id -> tagRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Tag", id)))
                    .collect(Collectors.toSet());
            event.setTags(tags);
        }

        Event saved = eventRepository.save(event);
        return toEventResponse(saved);
    }

    public EventResponse getEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        return toEventResponse(event);
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::toEventResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getUpcomingEvents() {
        return eventRepository.findUpcomingEvents(LocalDateTime.now()).stream()
                .map(this::toEventResponse)
                .collect(Collectors.toList());
    }

    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));

        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (request.getStartTime().isAfter(request.getEndTime())) {
                throw new IllegalArgumentException("Start time must be before end time");
            }
            event.setStartTime(request.getStartTime());
            event.setEndTime(request.getEndTime());
        }

        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getCapacity() != null) event.setCapacity(request.getCapacity());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            event.setCategory(category);
        }

        if (request.getVenueId() != null) {
            Venue venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new ResourceNotFoundException("Venue", request.getVenueId()));
            checkVenueConflict(request.getVenueId(), event.getStartTime(), event.getEndTime(), event.getId());
            event.setVenue(venue);
        }

        if (request.getTagIds() != null) {
            Set<Tag> tags = request.getTagIds().stream()
                    .map(tagId -> tagRepository.findById(tagId)
                            .orElseThrow(() -> new ResourceNotFoundException("Tag", tagId)))
                    .collect(Collectors.toSet());
            event.setTags(tags);
        }

        Event saved = eventRepository.save(event);
        return toEventResponse(saved);
    }

    public void cancelEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        event.setStatus(Event.EventStatus.CANCELLED);
        eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event", id);
        }
        eventRepository.deleteById(id);
    }

    public List<EventResponse> getCalendarEvents(CalendarFilterRequest filter) {
        LocalDateTime start = filter.getStartDate() != null ? filter.getStartDate() : LocalDateTime.now().minusMonths(1);
        LocalDateTime end = filter.getEndDate() != null ? filter.getEndDate() : LocalDateTime.now().plusMonths(1);

        List<Event> events = eventRepository.findByStartTimeBetween(start, end);

        if (filter.getUserId() != null) {
            events = events.stream()
                    .filter(e -> registrationRepository.existsByUserIdAndEventIdAndStatus(
                            filter.getUserId(), e.getId(), Registration.RegistrationStatus.CONFIRMED))
                    .collect(Collectors.toList());
        }

        if (filter.getCategoryId() != null) {
            events = events.stream()
                    .filter(e -> e.getCategory() != null && e.getCategory().getId().equals(filter.getCategoryId()))
                    .collect(Collectors.toList());
        }

        return events.stream().map(this::toEventResponse).collect(Collectors.toList());
    }

    public ConflictCheckResponse checkUserConflict(Long userId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));

        List<Registration> conflicts = registrationRepository.findConflictingRegistrations(
                userId, event.getStartTime(), event.getEndTime());

        List<EventResponse> conflictingEvents = conflicts.stream()
                .filter(r -> !r.getEvent().getId().equals(eventId))
                .map(r -> toEventResponse(r.getEvent()))
                .collect(Collectors.toList());

        return new ConflictCheckResponse(!conflictingEvents.isEmpty(), conflictingEvents);
    }

    private void checkVenueConflict(Long venueId, LocalDateTime start, LocalDateTime end, Long excludeEventId) {
        List<Event> conflicts = eventRepository.findConflictingEvents(venueId, start, end, excludeEventId);
        if (!conflicts.isEmpty()) {
            throw new ConflictException("Venue is already booked during this time slot");
        }
    }

    private EventResponse toEventResponse(Event event) {
        EventResponse resp = new EventResponse();
        resp.setId(event.getId());
        resp.setTitle(event.getTitle());
        resp.setStatus(event.getStatus().name());
        resp.setStartTime(event.getStartTime());
        resp.setEndTime(event.getEndTime());
        resp.setCapacity(event.getCapacity());
        resp.setRegisteredCount((int) registrationRepository.countByEventIdAndStatus(
                event.getId(), Registration.RegistrationStatus.CONFIRMED));
        resp.setOrganizerId(event.getOrganizer().getId());
        resp.setOrganizerName(event.getOrganizer().getName());
        resp.setCreatedAt(event.getCreatedAt());

        if (event.getCategory() != null) {
            resp.setCategoryId(event.getCategory().getId());
            resp.setCategoryName(event.getCategory().getName());
        }
        if (event.getVenue() != null) {
            resp.setVenueId(event.getVenue().getId());
            resp.setVenueName(event.getVenue().getName());
        }
        resp.setTags(event.getTags().stream().map(Tag::getName).collect(Collectors.toSet()));
        return resp;
    }
}
