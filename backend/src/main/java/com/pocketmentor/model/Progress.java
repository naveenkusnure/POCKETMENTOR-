package com.pocketmentor.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "progress")
public class Progress {
    @Id
    private String id;

    private String userId;

    private double learningScore; // e.g. 82.0

    private double quizAccuracy;   // e.g. 86.0

    private int totalQuizzesCompleted;

    private int studyStreakDays;

    private Instant lastActivityDate;

    private List<String> weakTopics;

    private List<String> strongTopics;

    // Weekly performance trend points: [{"label": "Week 1", "score": 65}, ...]
    private List<WeeklyScore> weeklyTrend;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyScore {
        private String week;
        private double score;
    }
}
