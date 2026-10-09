package com.pocketmentor.controller;

import com.pocketmentor.dto.StudyDto;
import com.pocketmentor.model.Prediction;
import com.pocketmentor.model.Progress;
import com.pocketmentor.model.User;
import com.pocketmentor.repository.UserRepository;
import com.pocketmentor.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProgressAndReactionController extends BaseController {

    private final ProgressService progressService;

    public ProgressAndReactionController(UserRepository userRepository, ProgressService progressService) {
        super(userRepository);
        this.progressService = progressService;
    }

    @PostMapping("/reactions")
    public ResponseEntity<Void> recordReaction(@RequestBody StudyDto.ReactionRequest request) {
        User user = getAuthenticatedUser();
        progressService.recordReaction(user.getId(), request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/progress")
    public ResponseEntity<Progress> getProgress() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(progressService.getOrCreateProgress(user.getId()));
    }

    @GetMapping("/prediction")
    public ResponseEntity<Prediction> getPrediction() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(progressService.getLatestPrediction(user.getId()));
    }
}
