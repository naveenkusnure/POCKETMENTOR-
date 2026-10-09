package com.pocketmentor.repository;

import com.pocketmentor.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends MongoRepository<Quiz, String> {
    List<Quiz> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Quiz> findByIdAndUserId(String id, String userId);
}
