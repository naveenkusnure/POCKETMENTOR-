package com.pocketmentor.repository;

import com.pocketmentor.model.Prediction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PredictionRepository extends MongoRepository<Prediction, String> {
    Optional<Prediction> findFirstByUserIdOrderByCalculatedAtDesc(String userId);
}
