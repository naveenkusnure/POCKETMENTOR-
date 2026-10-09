package com.pocketmentor.repository;

import com.pocketmentor.model.Summary;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SummaryRepository extends MongoRepository<Summary, String> {
    List<Summary> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<Summary> findByMaterialIdAndSummaryLevel(String materialId, String summaryLevel);
    Optional<Summary> findFirstByMaterialIdOrderByCreatedAtDesc(String materialId);
}
