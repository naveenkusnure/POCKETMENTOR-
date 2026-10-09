package com.pocketmentor.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "materials")
public class Material {
    @Id
    private String id;

    private String userId;

    private String fileName;

    private String storedFileName;

    private long fileSize;

    private String contentType;

    private int pageCount;

    // Extracted raw text (or truncated representative sample for swift AI queries)
    private String extractedText;

    @CreatedDate
    private Instant uploadedAt;
}
