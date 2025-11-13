package org.example.graduationproject.services.adapters;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.example.graduationproject.services.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Adapter cho Cloudinary - Adaptee
 * Chuyển đổi từ ImageService interface sang Cloudinary API
 */
@Service("cloudinaryImageService")
public class CloudinaryAdapter implements ImageService {

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map<String, Object> params = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto",
                "public_id", generatePublicId(file.getOriginalFilename())
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), params);
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Lỗi upload file lên Cloudinary: " + e.getMessage());
        }
    }

    @Override
    public List<String> uploadMultipleImages(List<MultipartFile> files, String folder) {
        return files.stream()
            .map(file -> uploadImage(file, folder))
            .toList();
    }

    @Override
    public boolean deleteImage(String imageUrl) {
        try {
            String publicId = getPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                return "ok".equals(result.get("result"));
            }
            return false;
        } catch (IOException e) {
            return false;
        }
    }

    @Override
    public boolean deleteMultipleImages(List<String> imageUrls) {
        return imageUrls.stream()
            .allMatch(this::deleteImage);
    }

    @Override
    public String getProviderName() {
        return "Cloudinary";
    }

    /**
     * Tạo public ID cho file
     */
    private String generatePublicId(String originalFilename) {
        if (originalFilename == null || originalFilename.isEmpty()) {
            return "file_" + System.currentTimeMillis();
        }
        
        String nameWithoutExtension = originalFilename;
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            nameWithoutExtension = originalFilename.substring(0, lastDotIndex);
        }
        
        return nameWithoutExtension + "_" + System.currentTimeMillis();
    }

    /**
     * Lấy public ID từ Cloudinary URL
     */
    private String getPublicIdFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
        String[] parts = url.split("/upload/");
        if (parts.length > 1) {
            String[] pathParts = parts[1].split("/");
            if (pathParts.length > 1) {
                // Bỏ qua version number (v1234567890) nếu có
                if (pathParts[1].startsWith("v")) {
                    return pathParts[2] + "/" + pathParts[3];
                } else {
                    return pathParts[1] + "/" + pathParts[2];
                }
            }
        }
        return null;
    }
}








