package com.pocketmentor.repository;

import com.pocketmentor.model.Reaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReactionRepository extends MongoRepository<Reaction, String> {
    List<Reaction> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Reaction> findByUserIdAndTopic(String userId, String topic);
    long countByUserId(String userId);
}
