package org.example.graduationproject.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

/**
 * Factory để tạo ImageService instance
 * Cho phép dễ dàng switch giữa các providers
 */
@Component
public class ImageServiceFactory {

    @Autowired
    @Qualifier("cloudinaryImageService")
    private ImageService cloudinaryImageService;



    /**
     * Lấy ImageService mặc định
     */
    public ImageService getDefaultImageService() {
        return cloudinaryImageService;
    }


}
