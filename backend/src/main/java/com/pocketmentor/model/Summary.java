package com.pocketmentor.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "summaries")
public class Summary {
    @Id
    private String id;

    private String userId;

    private String materialId;

    private String materialTitle;

    // quick, standard, detailed
    private String summaryLevel;

    private String quickSummary;

    private List<String> keyConcepts;

    private List<String> importantDefinitions;

    private List<String> importantFormulas;

    private List<String> examPoints;

    private String quickRevision;

    @CreatedDate
    private Instant createdAt;
}
