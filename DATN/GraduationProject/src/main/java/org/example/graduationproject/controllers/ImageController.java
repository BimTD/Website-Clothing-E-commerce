package org.example.graduationproject.controllers;

import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.services.ImageService;
import org.example.graduationproject.services.ImageServiceFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST Controller cho Image Service
 * Sử dụng Adapter Pattern để abstract image operations
 */
@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private ImageServiceFactory imageServiceFactory;
    
    private ImageService getImageService() {
        return imageServiceFactory.getDefaultImageService();
    }

    /**
     * Upload một image
     */
    @PostMapping("/upload")
    public ResponseEntity<ServiceResult<String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "clothes/images") String folder) {
        
        try {
            String url = getImageService().uploadImage(file, folder);
            return ResponseEntity.ok(ServiceResult.ok("Upload thành công", url));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ServiceResult.serverError("Lỗi upload image: " + e.getMessage()));
        }
    }

    /**
     * Upload nhiều images
     */
    @PostMapping("/upload-multiple")
    public ResponseEntity<ServiceResult<List<String>>> uploadMultipleImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "folder", defaultValue = "clothes/images") String folder) {
        
        try {
            List<String> urls = getImageService().uploadMultipleImages(files, folder);
            return ResponseEntity.ok(ServiceResult.ok("Upload thành công", urls));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ServiceResult.serverError("Lỗi upload images: " + e.getMessage()));
        }
    }

    /**
     * Xóa image
     */
    @DeleteMapping("/delete")
    public ResponseEntity<ServiceResult<Boolean>> deleteImage(@RequestParam("url") String imageUrl) {
        try {
            boolean deleted = getImageService().deleteImage(imageUrl);
            if (deleted) {
                return ResponseEntity.ok(ServiceResult.ok("Xóa image thành công", true));
            } else {
                return ResponseEntity.badRequest()
                    .body(ServiceResult.serverError("Không thể xóa image"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ServiceResult.serverError("Lỗi xóa image: " + e.getMessage()));
        }
    }

    /**
     * Xóa nhiều images
     */
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<ServiceResult<Boolean>> deleteMultipleImages(@RequestBody List<String> imageUrls) {
        try {
            boolean deleted = getImageService().deleteMultipleImages(imageUrls);
            if (deleted) {
                return ResponseEntity.ok(ServiceResult.ok("Xóa images thành công", true));
            } else {
                return ResponseEntity.badRequest()
                    .body(ServiceResult.serverError("Không thể xóa một số images"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ServiceResult.serverError("Lỗi xóa images: " + e.getMessage()));
        }
    }

    /**
     * Lấy thông tin provider
     */
    @GetMapping("/provider")
    public ResponseEntity<ServiceResult<String>> getProviderInfo() {
        String providerName = getImageService().getProviderName();
        return ResponseEntity.ok(ServiceResult.ok("Provider info", providerName));
    }




}
