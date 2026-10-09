package com.pocketmentor.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chatSessions")
public class ChatSession {
    @Id
    private String id;

    private String userId;

    private String materialId;

    private String topic;

    private List<ChatMessage> messages;

    @CreatedDate
    private Instant createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private String sender; // "USER" or "AI"
        private String text;
        private String mode; // Simple, Detailed, Exam, Revision
        private Instant timestamp;
    }
}
