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
@Document(collection = "quizzes")
public class Quiz {
    @Id
    private String id;

    private String userId;

    private String materialId; // Optional if created directly from topic

    private String topic;

    private int questionCount;

    // Easy, Medium, Hard, Mixed
    private String difficulty;

    private List<Question> questions;

    @CreatedDate
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Question {
        private String id;
        private String questionText;
        private List<String> options;
        private int correctOptionIndex; // 0-based
        private String explanation;
    }
}
