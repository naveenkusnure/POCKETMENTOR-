package com.pocketmentor.service;

import com.pocketmentor.dto.StudyDto;
import com.pocketmentor.model.Material;
import com.pocketmentor.repository.MaterialRepository;
import com.pocketmentor.repository.SummaryRepository;
import com.pocketmentor.util.PdfParserUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final SummaryRepository summaryRepository;
    private final PdfParserUtil pdfParserUtil;

    @Value("${app.storage.upload-dir:uploads}")
    private String uploadDir;

    public Material uploadPdf(String userId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are supported");
        }

        // Limit check (e.g. 25MB)
        if (file.getSize() > 25 * 1024 * 1024) {
            throw new IllegalArgumentException("PDF file size must not exceed 25MB");
        }

        // Create upload directory if not present
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String storedFileName = UUID.randomUUID().toString() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path destination = uploadPath.resolve(storedFileName);
        Files.copy(file.getInputStream(), destination);

        // Extract text and page count via PDFBox
        PdfParserUtil.ExtractedPdf extracted;
        try {
            extracted = pdfParserUtil.extractText(destination.toFile());
        } catch (Exception e) {
            log.error("Failed to extract PDF text: {}", e.getMessage());
            extracted = new PdfParserUtil.ExtractedPdf("Text could not be automatically extracted from this PDF.", 1);
        }

        Material material = Material.builder()
                .userId(userId)
                .fileName(originalFilename)
                .storedFileName(storedFileName)
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .pageCount(extracted.pageCount())
                .extractedText(extracted.text())
                .uploadedAt(Instant.now())
                .build();

        return materialRepository.save(material);
    }

    public List<StudyDto.MaterialResponse> getUserMaterials(String userId) {
        return materialRepository.findByUserIdOrderByUploadedAtDesc(userId).stream()
                .map(m -> StudyDto.MaterialResponse.builder()
                        .id(m.getId())
                        .fileName(m.getFileName())
                        .fileSize(m.getFileSize())
                        .pageCount(m.getPageCount())
                        .uploadedAt(m.getUploadedAt())
                        .hasSummary(summaryRepository.findFirstByMaterialIdOrderByCreatedAtDesc(m.getId()).isPresent())
                        .build())
                .collect(Collectors.toList());
    }

    public Material getMaterial(String userId, String materialId) {
        return materialRepository.findByIdAndUserId(materialId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Material not found or access denied"));
    }

    public void deleteMaterial(String userId, String materialId) {
        Material material = getMaterial(userId, materialId);
        try {
            Path file = Paths.get(uploadDir).resolve(material.getStoredFileName());
            Files.deleteIfExists(file);
        } catch (Exception e) {
            log.warn("Could not delete physical file: {}", e.getMessage());
        }
        materialRepository.delete(material);
    }

    public byte[] getMaterialFileBytes(String userId, String materialId) throws IOException {
        Material material = getMaterial(userId, materialId);
        Path file = Paths.get(uploadDir).resolve(material.getStoredFileName());
        if (!Files.exists(file)) {
            throw new IllegalArgumentException("File content not found on server");
        }
        return Files.readAllBytes(file);
    }
}
