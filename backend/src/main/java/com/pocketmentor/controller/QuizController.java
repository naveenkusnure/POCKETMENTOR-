package com.pocketmentor.controller;

import com.pocketmentor.dto.StudyDto;
import com.pocketmentor.model.Quiz;
import com.pocketmentor.model.QuizAttempt;
import com.pocketmentor.model.User;
import com.pocketmentor.repository.UserRepository;
import com.pocketmentor.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController extends BaseController {

    private final QuizService quizService;

    public QuizController(UserRepository userRepository, QuizService quizService) {
        super(userRepository);
        this.quizService = quizService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Quiz> generateQuiz(@RequestBody StudyDto.QuizGenerateRequest request) {
        User user = getAuthenticatedUser();
        Quiz quiz = quizService.generateQuiz(user.getId(), request);
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizAttempt> submitQuiz(@RequestBody StudyDto.QuizSubmitRequest request) {
        User user = getAuthenticatedUser();
        QuizAttempt attempt = quizService.submitQuiz(user.getId(), request);
        return ResponseEntity.ok(attempt);
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getQuizzes() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(quizService.getUserQuizzes(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable String id) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(quizService.getQuizById(user.getId(), id));
    }

    @GetMapping("/attempts")
    public ResponseEntity<List<QuizAttempt>> getAttempts() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(quizService.getUserAttempts(user.getId()));
    }
}
