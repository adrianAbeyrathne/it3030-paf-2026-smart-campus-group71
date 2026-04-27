package com.smartcampus.api.service;

import com.smartcampus.api.dto.*;
import com.smartcampus.api.exception.ResourceNotFoundException;
import com.smartcampus.api.model.IncidentTicket;
import com.smartcampus.api.model.TicketComment;
import com.smartcampus.api.model.User;
import com.smartcampus.api.model.enums.NotificationType;
import com.smartcampus.api.model.enums.TicketStatus;
import com.smartcampus.api.model.enums.UserRole;
import com.smartcampus.api.repository.IncidentTicketRepository;
import com.smartcampus.api.repository.TicketCommentRepository;
import com.smartcampus.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public TicketResponseDTO createTicket(String reporterId, TicketRequestDTO dto, List<MultipartFile> files) {
        IncidentTicket ticket = IncidentTicket.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .priority(dto.getPriority())
                .status(TicketStatus.OPEN)
                .resourceId(dto.getResourceId())
                .location(dto.getLocation())
                .reporterId(reporterId)
                .contactDetails(dto.getContactDetails())
                .build();

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (ticket.getImages().size() < 3) {
                    String filename = fileStorageService.store(file);
                    ticket.getImages().add(filename);
                }
            }
        }

        IncidentTicket saved = ticketRepository.save(ticket);
        
        // Notify Admins
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                admin.getId(),
                NotificationType.BOOKING_REQUESTED, // Reusing existing type for simplicity or can add new
                "New Incident Ticket",
                "A new ticket has been reported: " + ticket.getTitle(),
                saved.getId()
            );
        }

        return mapToResponse(saved);
    }

    public TicketResponseDTO updateTicket(String ticketId, String reporterId, TicketRequestDTO dto, List<MultipartFile> files) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (!ticket.getReporterId().equals(reporterId)) {
            throw new RuntimeException("Unauthorized to update this ticket");
        }
        if (ticket.getStatus() != TicketStatus.OPEN || ticket.getAssignedToId() != null) {
            throw new RuntimeException("Cannot update ticket that is already assigned or not OPEN");
        }

        ticket.setTitle(dto.getTitle());
        ticket.setDescription(dto.getDescription());
        ticket.setCategory(dto.getCategory());
        ticket.setPriority(dto.getPriority());
        ticket.setResourceId(dto.getResourceId());
        ticket.setLocation(dto.getLocation());
        ticket.setContactDetails(dto.getContactDetails());

        if (files != null && !files.isEmpty()) {
            // Option to replace or just add images, let's just add for now up to 3
            for (MultipartFile file : files) {
                if (ticket.getImages().size() < 3) {
                    String filename = fileStorageService.store(file);
                    ticket.getImages().add(filename);
                }
            }
        }

        IncidentTicket updated = ticketRepository.save(ticket);
        return mapToResponse(updated);
    }

    public void deleteTicket(String ticketId, String reporterId) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (!ticket.getReporterId().equals(reporterId)) {
            throw new RuntimeException("Unauthorized to delete this ticket");
        }
        if (ticket.getStatus() != TicketStatus.OPEN || ticket.getAssignedToId() != null) {
            throw new RuntimeException("Cannot delete ticket that is already assigned or not OPEN");
        }

        // Also delete comments
        List<TicketComment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        commentRepository.deleteAll(comments);

        ticketRepository.delete(ticket);
    }

    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getMyTickets(String userId) {
        return ticketRepository.findByReporterId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getAssignedTickets(String technicianId) {
        return ticketRepository.findByAssignedToId(technicianId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TicketResponseDTO getTicketById(String id) {
        IncidentTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return mapToResponse(ticket);
    }

    public TicketResponseDTO updateTicketStatus(String ticketId, TicketStatusUpdateDTO dto) {
        IncidentTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        boolean isNewlyAssigned = false;
        if (dto.getAssignedToId() != null && !dto.getAssignedToId().equals(ticket.getAssignedToId())) {
            ticket.setAssignedToId(dto.getAssignedToId());
            isNewlyAssigned = true;
        }

        if (dto.getStatus() != null) {
            ticket.setStatus(dto.getStatus());
        }
        if (dto.getResolutionNotes() != null) {
            ticket.setResolutionNotes(dto.getResolutionNotes());
        }

        IncidentTicket updated = ticketRepository.save(ticket);

        // Notify Reporter
        notificationService.createNotification(
            ticket.getReporterId(),
            NotificationType.TICKET_STATUS_CHANGED,
            "Ticket Status Updated",
            "Your ticket '" + ticket.getTitle() + "' is now " + ticket.getStatus(),
            updated.getId()
        );

        // Notify Technician if newly assigned
        if (isNewlyAssigned) {
            notificationService.createNotification(
                ticket.getAssignedToId(),
                NotificationType.TICKET_STATUS_CHANGED,
                "New Ticket Assigned",
                "You have been assigned to ticket: " + ticket.getTitle(),
                updated.getId()
            );
        }

        // Notify Admins about progress (if status changed)
        if (dto.getStatus() != null) {
            List<User> admins = userRepository.findByRole(UserRole.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification(
                    admin.getId(),
                    NotificationType.TICKET_STATUS_CHANGED,
                    "Ticket Progress Update",
                    "Ticket '" + ticket.getTitle() + "' status changed to " + ticket.getStatus(),
                    updated.getId()
                );
            }
        }

        return mapToResponse(updated);
    }

    public CommentResponseDTO addComment(String ticketId, String userId, CommentRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        TicketComment comment = TicketComment.builder()
                .ticketId(ticketId)
                .userId(userId)
                .userName(user.getName())
                .content(dto.getContent())
                .build();
        
        TicketComment saved = commentRepository.save(comment);

        // Notify other party (Admin or Reporter)
        IncidentTicket ticket = ticketRepository.findById(ticketId).orElse(null);
        if (ticket != null) {
            String recipientId = userId.equals(ticket.getReporterId()) ? ticket.getAssignedToId() : ticket.getReporterId();
            if (recipientId != null) {
                notificationService.createNotification(
                    recipientId,
                    NotificationType.NEW_COMMENT,
                    "New Comment on Ticket",
                    user.getName() + " commented on your ticket: " + ticket.getTitle(),
                    ticketId
                );
            }
        }

        return mapToCommentResponse(saved);
    }

    public List<CommentResponseDTO> getComments(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(this::mapToCommentResponse)
                .collect(Collectors.toList());
    }

    public void deleteComment(String commentId, String userId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }

    private TicketResponseDTO mapToResponse(IncidentTicket t) {
        String reporterName = userRepository.findById(t.getReporterId()).map(User::getName).orElse("Unknown");
        String assignedName = t.getAssignedToId() != null ? 
                userRepository.findById(t.getAssignedToId()).map(User::getName).orElse("Unassigned") : "Unassigned";

        return TicketResponseDTO.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .category(t.getCategory())
                .priority(t.getPriority())
                .status(t.getStatus())
                .resourceId(t.getResourceId())
                .location(t.getLocation())
                .reporterId(t.getReporterId())
                .reporterName(reporterName)
                .assignedToId(t.getAssignedToId())
                .assignedToName(assignedName)
                .contactDetails(t.getContactDetails())
                .images(t.getImages())
                .resolutionNotes(t.getResolutionNotes())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private CommentResponseDTO mapToCommentResponse(TicketComment c) {
        return CommentResponseDTO.builder()
                .id(c.getId())
                .ticketId(c.getTicketId())
                .userId(c.getUserId())
                .userName(c.getUserName())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
