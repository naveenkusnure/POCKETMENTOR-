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
@Document(collection = "predictions")
public class Prediction {
    @Id
    private String id;

    private String userId;

    private double predictedScore; // e.g. 78.0 / 100

    private double confidencePercentage; // e.g. 84.0%

    private String trend; // "Improving ↑", "Stable →", "Needs Attention ↓"

    private List<String> positiveFactors;

    private List<String> improvementAreas;

    private String recommendation;

    private String disclaimer;

    @CreatedDate
    private Instant calculatedAt;
}
