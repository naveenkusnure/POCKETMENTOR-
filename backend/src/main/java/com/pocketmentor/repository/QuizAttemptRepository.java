package com.pocketmentor.repository;

import com.pocketmentor.model.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    List<QuizAttempt> findByUserIdOrderByCompletedAtDesc(String userId);
    List<QuizAttempt> findTop10ByUserIdOrderByCompletedAtDesc(String userId);
    long countByUserId(String userId);
}
