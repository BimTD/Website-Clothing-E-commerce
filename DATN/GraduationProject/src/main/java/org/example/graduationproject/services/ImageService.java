package org.example.graduationproject.services;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Target Interface cho Adapter Pattern
 * Định nghĩa contract chung cho tất cả image providers
 */
public interface ImageService {

    /**
     * Upload một image
     * @param file file image cần upload
     * @param folder thư mục lưu trữ
     * @return URL của image đã upload
     */
    String uploadImage(MultipartFile file, String folder);

    /**
     * Upload nhiều images
     * @param files danh sách files cần upload
     * @param folder thư mục lưu trữ
     * @return danh sách URLs của images đã upload
     */
    List<String> uploadMultipleImages(List<MultipartFile> files, String folder);

    /**
     * Xóa image theo URL
     * @param imageUrl URL của image cần xóa
     * @return true nếu xóa thành công
     */
    boolean deleteImage(String imageUrl);

    /**
     * Xóa nhiều images
     * @param imageUrls danh sách URLs cần xóa
     * @return true nếu xóa thành công tất cả
     */
    boolean deleteMultipleImages(List<String> imageUrls);

    /**
     * Lấy provider name
     * @return tên của image provider
     */
    String getProviderName();
}








