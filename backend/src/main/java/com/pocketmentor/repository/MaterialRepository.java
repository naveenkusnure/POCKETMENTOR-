package com.pocketmentor.repository;

import com.pocketmentor.model.Material;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRepository extends MongoRepository<Material, String> {
    List<Material> findByUserIdOrderByUploadedAtDesc(String userId);
    Optional<Material> findByIdAndUserId(String id, String userId);
    long countByUserId(String userId);
}
