package com.pocketmentor.controller;

import com.pocketmentor.dto.StudyDto;
import com.pocketmentor.model.User;
import com.pocketmentor.repository.UserRepository;
import com.pocketmentor.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController extends BaseController {

    private final DashboardService dashboardService;

    public DashboardController(UserRepository userRepository, DashboardService dashboardService) {
        super(userRepository);
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<StudyDto.DashboardResponse> getDashboard() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(dashboardService.getDashboardData(user.getId()));
    }
}
