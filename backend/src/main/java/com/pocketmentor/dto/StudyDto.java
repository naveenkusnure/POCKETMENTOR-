package com.pocketmentor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class StudyDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaterialResponse {
        private String id;
        private String fileName;
        private long fileSize;
        private int pageCount;
        private Instant uploadedAt;
        private boolean hasSummary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummarizeRequest {
        // Quick, Standard, Detailed
        private String summaryLevel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizGenerateRequest {
        private String materialId; // optional
        private String topic;      // optional or fallback
        private int questionCount; // 5, 10, 15, 20
        private String difficulty; // Easy, Medium, Hard, Mixed
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizSubmitRequest {
        private String quizId;
        private long timeTakenSeconds;
        // questionId -> chosenIndex
        private Map<String, Integer> answers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReactionRequest {
        private String targetType; // SUMMARY, EXPLANATION, MENTOR_CHAT
        private String targetId;
        private String topic;
        private String reactionType; // HELPFUL, EXCELLENT, CONFUSED, NOT_HELPFUL
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorAskRequest {
        private String materialId;
        private String topic;
        private String question;
        private String mode; // Simple, Detailed, Exam, Revision
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorAskResponse {
        private String answer;
        private String topic;
        private String mode;
        private Instant timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardResponse {
        private String studentName;
        private String courseOrBranch;
        private String yearOfStudy;

        // Super Card 1: Learning Score
        private double learningScore;
        private String learningScoreTrend;

        // Super Card 2: Predicted Score
        private double predictedScore;
        private double predictionConfidence;
        private String predictionTrend;

        // Super Card 3: Quiz Accuracy
        private double quizAccuracy;
        private int quizzesCompleted;

        // Super Card 4: Study Streak
        private int studyStreakDays;

        // Super Card 5: Weak Topics
        private List<String> weakTopics;

        // Super Card 6: Study Materials
        private long materialsCount;

        // Sections
        private List<String> todaysFocus;
        private List<ActivityItem> recentActivity;
        private List<WeeklyTrendPoint> performanceChart;
        private List<RecommendationItem> recommendations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityItem {
        private String type; // QUIZ, UPLOAD, SUMMARY, MENTOR
        private String description;
        private Instant timestamp;
        private String score;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyTrendPoint {
        private String week;
        private double score;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendationItem {
        private String title;
        private String description;
        private String actionType; // QUIZ, REVISION, MENTOR
        private String target;     // topic or materialId
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileResponse {
        private String id;
        private String fullName;
        private String email;
        private String courseOrBranch;
        private String yearOfStudy;
        private Instant joinedDate;
        private int totalQuizzes;
        private double averageScore;
        private long studyMaterialsCount;
        private double learningScore;
        private int currentStreak;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String fullName;
        private String courseOrBranch;
        private String yearOfStudy;
    }
}
