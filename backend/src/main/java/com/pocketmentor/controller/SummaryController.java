package com.pocketmentor.controller;

import com.pocketmentor.dto.StudyDto;
import com.pocketmentor.model.Summary;
import com.pocketmentor.model.User;
import com.pocketmentor.repository.UserRepository;
import com.pocketmentor.service.SummaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
public class SummaryController extends BaseController {

    private final SummaryService summaryService;

    public SummaryController(UserRepository userRepository, SummaryService summaryService) {
        super(userRepository);
        this.summaryService = summaryService;
    }

    @PostMapping("/{id}/summarize")
    public ResponseEntity<Summary> summarize(@PathVariable String id,
                                             @RequestBody(required = false) StudyDto.SummarizeRequest request) {
        User user = getAuthenticatedUser();
        String level = (request != null && request.getSummaryLevel() != null) ? request.getSummaryLevel() : "Standard";
        Summary summary = summaryService.summarizeMaterial(user.getId(), id, level);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<Summary> getSummary(@PathVariable String id) {
        User user = getAuthenticatedUser();
        Summary summary = summaryService.getSummaryByMaterial(user.getId(), id);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/summaries")
    public ResponseEntity<List<Summary>> getAllSummaries() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(summaryService.getUserSummaries(user.getId()));
    }
}
