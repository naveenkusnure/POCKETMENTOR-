package com.pocketmentor.service;

import com.pocketmentor.dto.StudyDto;
import com.pocketmentor.model.*;
import com.pocketmentor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProgressService progressService;
    private final MaterialRepository materialRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final SummaryRepository summaryRepository;

    public StudyDto.DashboardResponse getDashboardData(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Progress progress = progressService.getOrCreateProgress(userId);
        Prediction prediction = progressService.getLatestPrediction(userId);
        long materialCount = materialRepository.countByUserId(userId);
        List<QuizAttempt> recentAttempts = quizAttemptRepository.findTop10ByUserIdOrderByCompletedAtDesc(userId);

        // Build recent activity list
        List<StudyDto.ActivityItem> recentActivity = new ArrayList<>();
        for (QuizAttempt qa : recentAttempts) {
            recentActivity.add(StudyDto.ActivityItem.builder()
                    .type("QUIZ")
                    .description("Completed " + qa.getTopic() + " Quiz")
                    .score((int) qa.getScorePercentage() + "%")
                    .timestamp(qa.getCompletedAt())
                    .build());
        }

        // Add PDF uploads to activity
        List<Material> recentMaterials = materialRepository.findByUserIdOrderByUploadedAtDesc(userId);
        for (Material m : recentMaterials.stream().limit(3).collect(Collectors.toList())) {
            recentActivity.add(StudyDto.ActivityItem.builder()
                    .type("UPLOAD")
                    .description("Uploaded " + m.getFileName())
                    .score("")
                    .timestamp(m.getUploadedAt())
                    .build());
        }

        // Sort activity newest first
        recentActivity.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        if (recentActivity.size() > 5) {
            recentActivity = recentActivity.subList(0, 5);
        }

        // Generate Today's Focus
        List<String> todaysFocus = new ArrayList<>();
        if (progress.getWeakTopics() != null && !progress.getWeakTopics().isEmpty()) {
            todaysFocus.add("Revise " + progress.getWeakTopics().get(0) + " key concepts");
            todaysFocus.add("Take a 5-question targeted quiz on " + progress.getWeakTopics().get(0));
            todaysFocus.add("Review incorrect answers and clarify confusion with AI Mentor");
        } else {
            todaysFocus.add("Upload today's lecture notes or study PDF");
            todaysFocus.add("Practice a quick 10-question mixed quiz");
            todaysFocus.add("Maintain your " + progress.getStudyStreakDays() + "-day study streak");
        }

        // Recommendation Engine Logic
        List<StudyDto.RecommendationItem> recommendations = new ArrayList<>();
        if (progress.getQuizAccuracy() < 60.0) {
            recommendations.add(StudyDto.RecommendationItem.builder()
                    .title("Review Core Fundamentals")
                    .description("Quiz accuracy is below 60%. Request a Simple or Revision summary before attempting more questions.")
                    .actionType("REVISION")
                    .target("Signals")
                    .build());
        } else if (progress.getQuizAccuracy() <= 80.0) {
            recommendations.add(StudyDto.RecommendationItem.builder()
                    .title("Take Practice Quiz")
                    .description("Good progress! Reinforce weak areas with a 10-question quiz.")
                    .actionType("QUIZ")
                    .target("Signals")
                    .build());
        } else {
            recommendations.add(StudyDto.RecommendationItem.builder()
                    .title("Advanced Challenge")
                    .description("Excellent accuracy (>80%). Try hard-difficulty exam questions.")
                    .actionType("QUIZ")
                    .target("Advanced")
                    .build());
        }

        if (progress.getWeakTopics() != null && !progress.getWeakTopics().isEmpty()) {
            recommendations.add(StudyDto.RecommendationItem.builder()
                    .title("Ask AI Mentor on " + progress.getWeakTopics().get(0))
                    .description("You marked confusion in this topic. Ask for an exam-oriented analogy.")
                    .actionType("MENTOR")
                    .target(progress.getWeakTopics().get(0))
                    .build());
        }

        // Performance Chart points
        List<StudyDto.WeeklyTrendPoint> chart = new ArrayList<>();
        if (progress.getWeeklyTrend() != null) {
            for (Progress.WeeklyScore ws : progress.getWeeklyTrend()) {
                chart.add(new StudyDto.WeeklyTrendPoint(ws.getWeek(), ws.getScore()));
            }
        }

        return StudyDto.DashboardResponse.builder()
                .studentName(user.getFullName())
                .courseOrBranch(user.getCourseOrBranch())
                .yearOfStudy(user.getYearOfStudy())
                .learningScore(progress.getLearningScore())
                .learningScoreTrend("↑ 8% this week")
                .predictedScore(prediction.getPredictedScore())
                .predictionConfidence(prediction.getConfidencePercentage())
                .predictionTrend(prediction.getTrend())
                .quizAccuracy(progress.getQuizAccuracy())
                .quizzesCompleted(progress.getTotalQuizzesCompleted())
                .studyStreakDays(progress.getStudyStreakDays())
                .weakTopics(progress.getWeakTopics())
                .materialsCount(materialCount)
                .todaysFocus(todaysFocus)
                .recentActivity(recentActivity)
                .performanceChart(chart)
                .recommendations(recommendations)
                .build();
    }
}
