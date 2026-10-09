package com.pocketmentor.controller;

import com.pocketmentor.dto.StudyDto;
import com.pocketmentor.model.ChatSession;
import com.pocketmentor.model.User;
import com.pocketmentor.repository.UserRepository;
import com.pocketmentor.service.MentorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentor")
public class MentorController extends BaseController {

    private final MentorService mentorService;

    public MentorController(UserRepository userRepository, MentorService mentorService) {
        super(userRepository);
        this.mentorService = mentorService;
    }

    @PostMapping("/ask")
    public ResponseEntity<StudyDto.MentorAskResponse> askMentor(@RequestBody StudyDto.MentorAskRequest request) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(mentorService.askMentor(user.getId(), request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatSession.ChatMessage>> getChatHistory() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(mentorService.getChatHistory(user.getId()));
    }
}
