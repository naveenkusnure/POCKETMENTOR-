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
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "quizAttempts")
public class QuizAttempt {
    @Id
    private String id;

    private String userId;

    private String quizId;

    private String topic;

    private int totalQuestions;

    private int correctCount;

    private int incorrectCount;

    private double scorePercentage;

    private long timeTakenSeconds;

    // questionId -> selectedOptionIndex
    private Map<String, Integer> userAnswers;

    private List<QuestionResult> questionResults;

    @CreatedDate
    private Instant completedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResult {
        private String questionId;
        private String questionText;
        private List<String> options;
        private int selectedIndex;
        private int correctIndex;
        private boolean isCorrect;
        private String explanation;
    }
}
