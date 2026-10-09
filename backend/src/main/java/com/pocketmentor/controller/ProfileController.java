package com.pocketmentor.controller;

import com.pocketmentor.dto.StudyDto;
import com.pocketmentor.model.Progress;
import com.pocketmentor.model.User;
import com.pocketmentor.repository.MaterialRepository;
import com.pocketmentor.repository.QuizAttemptRepository;
import com.pocketmentor.repository.UserRepository;
import com.pocketmentor.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController extends BaseController {

    private final UserRepository userRepository;
    private final ProgressService progressService;
    private final QuizAttemptRepository quizAttemptRepository;
    private final MaterialRepository materialRepository;

    public ProfileController(UserRepository userRepository,
                             ProgressService progressService,
                             QuizAttemptRepository quizAttemptRepository,
                             MaterialRepository materialRepository) {
        super(userRepository);
        this.userRepository = userRepository;
        this.progressService = progressService;
        this.quizAttemptRepository = quizAttemptRepository;
        this.materialRepository = materialRepository;
    }

    @GetMapping
    public ResponseEntity<StudyDto.ProfileResponse> getProfile() {
        User user = getAuthenticatedUser();
        Progress progress = progressService.getOrCreateProgress(user.getId());
        long materialsCount = materialRepository.countByUserId(user.getId());
        int totalQuizzes = (int) quizAttemptRepository.countByUserId(user.getId());

        return ResponseEntity.ok(StudyDto.ProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .courseOrBranch(user.getCourseOrBranch())
                .yearOfStudy(user.getYearOfStudy())
                .joinedDate(user.getCreatedAt())
                .totalQuizzes(totalQuizzes)
                .averageScore(progress.getQuizAccuracy())
                .studyMaterialsCount(materialsCount)
                .learningScore(progress.getLearningScore())
                .currentStreak(progress.getStudyStreakDays())
                .build());
    }

    @PutMapping
    public ResponseEntity<StudyDto.ProfileResponse> updateProfile(@RequestBody StudyDto.UpdateProfileRequest request) {
        User user = getAuthenticatedUser();
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getCourseOrBranch() != null && !request.getCourseOrBranch().isBlank()) {
            user.setCourseOrBranch(request.getCourseOrBranch().trim());
        }
        if (request.getYearOfStudy() != null && !request.getYearOfStudy().isBlank()) {
            user.setYearOfStudy(request.getYearOfStudy().trim());
        }
        userRepository.save(user);

        return getProfile();
    }
}
