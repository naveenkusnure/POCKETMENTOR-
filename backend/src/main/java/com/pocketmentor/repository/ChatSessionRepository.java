package com.pocketmentor.repository;

import com.pocketmentor.model.ChatSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends MongoRepository<ChatSession, String> {
    List<ChatSession> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<ChatSession> findFirstByUserIdOrderByCreatedAtDesc(String userId);
}
