package com.pocketmentor.controller;

import com.pocketmentor.dto.StudyDto;
import com.pocketmentor.model.Material;
import com.pocketmentor.model.User;
import com.pocketmentor.repository.UserRepository;
import com.pocketmentor.service.MaterialService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
public class MaterialController extends BaseController {

    private final MaterialService materialService;

    public MaterialController(UserRepository userRepository, MaterialService materialService) {
        super(userRepository);
        this.materialService = materialService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Material> uploadMaterial(@RequestParam("file") MultipartFile file) throws IOException {
        User user = getAuthenticatedUser();
        Material saved = materialService.uploadPdf(user.getId(), file);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<StudyDto.MaterialResponse>> getMaterials() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(materialService.getUserMaterials(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> getMaterial(@PathVariable String id) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(materialService.getMaterial(user.getId(), id));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadMaterial(@PathVariable String id) throws IOException {
        User user = getAuthenticatedUser();
        Material material = materialService.getMaterial(user.getId(), id);
        byte[] bytes = materialService.getMaterialFileBytes(user.getId(), id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + material.getFileName() + "\"")
                .body(new ByteArrayResource(bytes));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable String id) {
        User user = getAuthenticatedUser();
        materialService.deleteMaterial(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
