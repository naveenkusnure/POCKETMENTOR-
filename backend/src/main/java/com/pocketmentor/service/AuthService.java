package com.pocketmentor.service;

import com.pocketmentor.dto.AuthDto;
import com.pocketmentor.model.Progress;
import com.pocketmentor.model.User;
import com.pocketmentor.repository.ProgressRepository;
import com.pocketmentor.repository.UserRepository;
import com.pocketmentor.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .courseOrBranch(request.getCourseOrBranch() != null ? request.getCourseOrBranch().trim() : "Engineering")
                .yearOfStudy(request.getYearOfStudy() != null ? request.getYearOfStudy().trim() : "1st Year")
                .role("ROLE_STUDENT")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        user = userRepository.save(user);

        // Initialize progress record with sensible starting metrics
        List<Progress.WeeklyScore> initialTrend = new ArrayList<>();
        initialTrend.add(new Progress.WeeklyScore("Week 1", 65.0));
        initialTrend.add(new Progress.WeeklyScore("Week 2", 71.0));
        initialTrend.add(new Progress.WeeklyScore("Week 3", 78.0));
        initialTrend.add(new Progress.WeeklyScore("Week 4", 82.0));

        Progress initialProgress = Progress.builder()
                .userId(user.getId())
                .learningScore(75.0)
                .quizAccuracy(80.0)
                .totalQuizzesCompleted(0)
                .studyStreakDays(1)
                .lastActivityDate(Instant.now())
                .weakTopics(new ArrayList<>(List.of("Signals", "VLSI", "Microcontrollers")))
                .strongTopics(new ArrayList<>(List.of("Digital Logic", "Basic Electronics")))
                .weeklyTrend(initialTrend)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        progressRepository.save(initialProgress);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails, user.getId(), user.getFullName());

        return AuthDto.AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .courseOrBranch(user.getCourseOrBranch())
                .yearOfStudy(user.getYearOfStudy())
                .build();
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails, user.getId(), user.getFullName());

        return AuthDto.AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .courseOrBranch(user.getCourseOrBranch())
                .yearOfStudy(user.getYearOfStudy())
                .build();
    }
}
