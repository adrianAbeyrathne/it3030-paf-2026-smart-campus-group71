package com.smartcampus.api.repository;

import com.smartcampus.api.model.IncidentTicket;
import com.smartcampus.api.model.enums.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {
    List<IncidentTicket> findByReporterId(String reporterId);
    List<IncidentTicket> findByAssignedToId(String assignedToId);
    List<IncidentTicket> findByStatus(TicketStatus status);
}
