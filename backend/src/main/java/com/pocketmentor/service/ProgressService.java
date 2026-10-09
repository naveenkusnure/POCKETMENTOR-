package com.pocketmentor.service;

import com.pocketmentor.dto.StudyDto;
import com.pocketmentor.model.Prediction;
import com.pocketmentor.model.Progress;
import com.pocketmentor.model.QuizAttempt;
import com.pocketmentor.model.Reaction;
import com.pocketmentor.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final PredictionRepository predictionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ReactionRepository reactionRepository;
    private final MaterialRepository materialRepository;

    /**
     * Configurable Learning Score weights:
     * Quiz Performance: 50%
     * Topic Mastery: 20%
     * Study Consistency: 15%
     * Reaction Feedback: 15%
     */
    private static final double WEIGHT_QUIZ = 0.50;
    private static final double WEIGHT_MASTERY = 0.20;
    private static final double WEIGHT_CONSISTENCY = 0.15;
    private static final double WEIGHT_REACTION = 0.15;

    public Progress getOrCreateProgress(String userId) {
        return progressRepository.findByUserId(userId).orElseGet(() -> {
            Progress p = Progress.builder()
                    .userId(userId)
                    .learningScore(75.0)
                    .quizAccuracy(78.0)
                    .totalQuizzesCompleted(0)
                    .studyStreakDays(1)
                    .lastActivityDate(Instant.now())
                    .weakTopics(new ArrayList<>(List.of("Signals", "VLSI", "Microcontrollers")))
                    .strongTopics(new ArrayList<>(List.of("Digital Systems", "Computer Architecture")))
                    .weeklyTrend(new ArrayList<>(List.of(
                            new Progress.WeeklyScore("Week 1", 65.0),
                            new Progress.WeeklyScore("Week 2", 71.0),
                            new Progress.WeeklyScore("Week 3", 78.0),
                            new Progress.WeeklyScore("Week 4", 82.0)
                    )))
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            return progressRepository.save(p);
        });
    }

    public synchronized void updateProgressAfterQuiz(String userId, QuizAttempt attempt) {
        Progress progress = getOrCreateProgress(userId);

        // Update streak
        Instant now = Instant.now();
        if (progress.getLastActivityDate() != null) {
            long days = ChronoUnit.DAYS.between(progress.getLastActivityDate(), now);
            if (days == 1) {
                progress.setStudyStreakDays(progress.getStudyStreakDays() + 1);
            } else if (days > 1) {
                progress.setStudyStreakDays(1);
            }
        } else {
            progress.setStudyStreakDays(1);
        }
        progress.setLastActivityDate(now);

        // Fetch recent quiz attempts
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdOrderByCompletedAtDesc(userId);
        double totalAccuracy = 0;
        for (QuizAttempt a : attempts) {
            totalAccuracy += a.getScorePercentage();
        }
        double avgQuizAccuracy = attempts.isEmpty() ? 75.0 : totalAccuracy / attempts.size();

        progress.setTotalQuizzesCompleted(attempts.size());
        progress.setQuizAccuracy(Math.round(avgQuizAccuracy * 10.0) / 10.0);

        // Weak vs Strong topics adjustment
        List<String> weak = progress.getWeakTopics() != null ? new ArrayList<>(progress.getWeakTopics()) : new ArrayList<>();
        List<String> strong = progress.getStrongTopics() != null ? new ArrayList<>(progress.getStrongTopics()) : new ArrayList<>();

        if (attempt.getScorePercentage() < 60.0) {
            if (!weak.contains(attempt.getTopic())) {
                weak.add(attempt.getTopic());
            }
            strong.remove(attempt.getTopic());
        } else if (attempt.getScorePercentage() >= 80.0) {
            weak.remove(attempt.getTopic());
            if (!strong.contains(attempt.getTopic())) {
                strong.add(attempt.getTopic());
            }
        }
        progress.setWeakTopics(weak);
        progress.setStrongTopics(strong);

        // Calculate Learning Score
        double learningScore = calculateLearningScore(userId, avgQuizAccuracy, progress.getStudyStreakDays(), weak.size(), strong.size());
        progress.setLearningScore(Math.round(learningScore * 10.0) / 10.0);

        // Update weekly trend point
        List<Progress.WeeklyScore> trend = progress.getWeeklyTrend();
        if (trend == null || trend.isEmpty()) {
            trend = new ArrayList<>(List.of(new Progress.WeeklyScore("Current", progress.getLearningScore())));
        } else {
            // Keep latest trend synced
            trend.get(trend.size() - 1).setScore(progress.getLearningScore());
        }
        progress.setWeeklyTrend(trend);
        progress.setUpdatedAt(now);

        progressRepository.save(progress);

        // Auto update prediction
        recalculatePrediction(userId, progress, attempts);
    }

    public void recordReaction(String userId, StudyDto.ReactionRequest req) {
        int weight = 0;
        String type = req.getReactionType() != null ? req.getReactionType().toUpperCase() : "HELPFUL";
        switch (type) {
            case "EXCELLENT" -> weight = 2;
            case "HELPFUL" -> weight = 1;
            case "CONFUSED" -> weight = -1;
            case "NOT_HELPFUL" -> weight = -2;
            default -> weight = 1;
        }

        Reaction r = Reaction.builder()
                .userId(userId)
                .targetType(req.getTargetType())
                .targetId(req.getTargetId())
                .topic(req.getTopic())
                .reactionType(type)
                .scoreWeight(weight)
                .createdAt(Instant.now())
                .build();

        reactionRepository.save(r);

        // If student is frequently confused by this topic, add to weak topics
        if (type.equals("CONFUSED") && req.getTopic() != null && !req.getTopic().isBlank()) {
            Progress progress = getOrCreateProgress(userId);
            List<String> weak = progress.getWeakTopics() != null ? new ArrayList<>(progress.getWeakTopics()) : new ArrayList<>();
            if (!weak.contains(req.getTopic())) {
                weak.add(req.getTopic());
                progress.setWeakTopics(weak);
                progressRepository.save(progress);
            }
        }
    }

    public Prediction recalculatePrediction(String userId, Progress progress, List<QuizAttempt> attempts) {
        if (progress == null) {
            progress = getOrCreateProgress(userId);
        }
        if (attempts == null) {
            attempts = quizAttemptRepository.findByUserIdOrderByCompletedAtDesc(userId);
        }

        double baseScore = progress.getLearningScore();
        double predicted = Math.min(98.0, Math.max(45.0, baseScore * 0.95 + 3.0));

        // Confidence formula based on sample size and consistency
        double confidence = Math.min(95.0, 60.0 + (attempts.size() * 3.5) + (progress.getStudyStreakDays() * 1.5));

        String trend = "Improving ↑";
        if (attempts.size() >= 2) {
            double latest = attempts.get(0).getScorePercentage();
            double prior = attempts.get(1).getScorePercentage();
            if (latest < prior - 5.0) {
                trend = "Needs Attention ↓";
            } else if (Math.abs(latest - prior) <= 5.0) {
                trend = "Stable →";
            }
        }

        List<String> positive = new ArrayList<>();
        List<String> areas = new ArrayList<>();

        if (progress.getQuizAccuracy() >= 75.0) {
            positive.add("Quiz accuracy demonstrates solid foundational comprehension");
        }
        if (progress.getStudyStreakDays() >= 3) {
            positive.add("Consistent daily study activity builds long-term retention (" + progress.getStudyStreakDays() + "-day streak)");
        }
        if (progress.getStrongTopics() != null && !progress.getStrongTopics().isEmpty()) {
            positive.add("High mastery observed in: " + String.join(", ", progress.getStrongTopics()));
        }

        if (progress.getWeakTopics() != null && !progress.getWeakTopics().isEmpty()) {
            for (String w : progress.getWeakTopics()) {
                areas.add(w + " accuracy shows opportunities for conceptual revision");
            }
        } else {
            areas.add("Attempt varied question difficulties to stress-test speed under timed constraints");
        }

        String recommendation = (progress.getWeakTopics() != null && !progress.getWeakTopics().isEmpty())
                ? "Revise " + progress.getWeakTopics().get(0) + " with AI Mentor and take 1 targeted practice quiz."
                : "Great consistency! Take a mixed-difficulty quiz to maintain your exam readiness.";

        Prediction pred = Prediction.builder()
                .userId(userId)
                .predictedScore(Math.round(predicted * 10.0) / 10.0)
                .confidencePercentage(Math.round(confidence * 10.0) / 10.0)
                .trend(trend)
                .positiveFactors(positive)
                .improvementAreas(areas)
                .recommendation(recommendation)
                .disclaimer("Prediction is an estimated learning indicator based on your activity and quiz performance. It is not a guaranteed exam score.")
                .calculatedAt(Instant.now())
                .build();

        return predictionRepository.save(pred);
    }

    public Prediction getLatestPrediction(String userId) {
        return predictionRepository.findFirstByUserIdOrderByCalculatedAtDesc(userId)
                .orElseGet(() -> recalculatePrediction(userId, null, null));
    }

    private double calculateLearningScore(String userId, double avgAccuracy, int streak, int weakCount, int strongCount) {
        // Topic mastery metric: ratio of strong vs weak topics
        double masteryMetric = Math.min(100.0, Math.max(30.0, 50.0 + (strongCount * 15.0) - (weakCount * 8.0)));

        // Study consistency metric: based on streak and regular check-ins
        double consistencyMetric = Math.min(100.0, 50.0 + (streak * 7.0));

        // Reaction sentiment metric
        List<Reaction> reactions = reactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        double reactionMetric = 75.0; // default baseline
        if (!reactions.isEmpty()) {
            int netScore = 0;
            for (Reaction r : reactions) {
                netScore += r.getScoreWeight();
            }
            reactionMetric = Math.min(100.0, Math.max(40.0, 75.0 + (netScore * 3.0)));
        }

        double score = (avgAccuracy * WEIGHT_QUIZ)
                + (masteryMetric * WEIGHT_MASTERY)
                + (consistencyMetric * WEIGHT_CONSISTENCY)
                + (reactionMetric * WEIGHT_REACTION);

        return Math.min(100.0, Math.max(0.0, score));
    }
}
