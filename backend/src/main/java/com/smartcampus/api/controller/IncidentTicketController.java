package com.smartcampus.api.controller;

import com.smartcampus.api.dto.*;
import com.smartcampus.api.service.IncidentTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class IncidentTicketController {

    private final IncidentTicketService ticketService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<TicketResponseDTO>> createTicket(
            Authentication auth,
            @RequestPart("data") @Valid TicketRequestDTO dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        
        String userId = (String) auth.getPrincipal();
        TicketResponseDTO response = ticketService.createTicket(userId, dto, files);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ticket created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketResponseDTO>>> getTickets(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        // Admins and Technicians see all, users see their own
        boolean isAdminOrTech = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_TECHNICIAN"));
        
        List<TicketResponseDTO> tickets = isAdminOrTech ? 
                ticketService.getAllTickets() : ticketService.getMyTickets(userId);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Tickets fetched successfully", tickets));
    }

    @GetMapping("/assigned")
    public ResponseEntity<ApiResponse<List<TicketResponseDTO>>> getAssignedTickets(Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Assigned tickets fetched", ticketService.getAssignedTickets(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Ticket detail", ticketService.getTicketById(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketStatusUpdateDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Status updated", ticketService.updateTicketStatus(id, dto)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponseDTO>> addComment(
            Authentication auth,
            @PathVariable String id,
            @Valid @RequestBody CommentRequestDTO dto) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(new ApiResponse<>(true, "Comment added", ticketService.addComment(id, userId, dto)));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponseDTO>>> getComments(@PathVariable String id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Comments fetched", ticketService.getComments(id)));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(Authentication auth, @PathVariable String commentId) {
        String userId = (String) auth.getPrincipal();
        ticketService.deleteComment(commentId, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Comment deleted", null));
    }
}
