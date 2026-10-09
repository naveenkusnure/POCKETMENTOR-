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
@Document(collection = "reactions")
public class Reaction {
    @Id
    private String id;

    private String userId;

    // TARGET TYPES: SUMMARY, EXPLANATION, MENTOR_CHAT
    private String targetType;

    private String targetId;

    private String topic;

    // HELPFUL (+1), EXCELLENT (+2), CONFUSED (-1), NOT_HELPFUL (-2)
    private String reactionType;

    private int scoreWeight;

    @CreatedDate
    private Instant createdAt;
}
