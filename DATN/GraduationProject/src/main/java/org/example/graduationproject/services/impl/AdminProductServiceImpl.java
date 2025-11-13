package org.example.graduationproject.services.impl;

import org.example.graduationproject.dto.ProductDTO;
import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.exceptions.NotFoundException;
import org.example.graduationproject.models.Loai;
import org.example.graduationproject.models.NhaCungCap;
import org.example.graduationproject.models.NhanHieu;
import org.example.graduationproject.models.SanPham;
import org.example.graduationproject.repositories.LoaiRepository;
import org.example.graduationproject.repositories.NhaCungCapRepository;
import org.example.graduationproject.repositories.NhanHieuRepository;
import org.example.graduationproject.services.AdminProductService;
import org.example.graduationproject.services.SanPhamService;
import org.example.graduationproject.services.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminProductServiceImpl implements AdminProductService {
    


    @Autowired
    private LoaiRepository loaiRepository;

    @Autowired
    private NhanHieuRepository nhanHieuRepository;

    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;

    @Autowired
    private SanPhamService sanPhamService;

    @Autowired
    @Qualifier("cloudinaryImageService")
    private ImageService imageService;
    


    @Override
    public ServiceResult<Map<String, Object>> getProductFormData() {
        List<Loai> loais = loaiRepository.findAll();
        List<NhanHieu> nhanHieus = nhanHieuRepository.findAll();
        List<NhaCungCap> nhaCungCaps = nhaCungCapRepository.findAll();
        
        Map<String, Object> result = new HashMap<>();
        result.put("loais", loais);
        result.put("nhanHieus", nhanHieus);
        result.put("nhaCungCaps", nhaCungCaps);
        result.put("editMode", false);
        
        return ServiceResult.ok("Lấy dữ liệu form thành công", result);
    }

    @Override
    public ServiceResult<Map<String, Object>> getProductEditFormData(Integer productId) {
        Optional<ProductDTO> productDTOOpt = sanPhamService.getProductDTOById(productId);
        if (productDTOOpt.isEmpty()) {
            throw new NotFoundException("Không tìm thấy sản phẩm");
        }
        
        Optional<SanPham> sanPhamOpt = sanPhamService.findById(productId);
        if (sanPhamOpt.isEmpty()) {
            throw new NotFoundException("Không tìm thấy sản phẩm");
        }
        
        List<Loai> loais = loaiRepository.findAll();
        List<NhanHieu> nhanHieus = nhanHieuRepository.findAll();
        List<NhaCungCap> nhaCungCaps = nhaCungCapRepository.findAll();
        
        Map<String, Object> result = new HashMap<>();
        result.put("product", productDTOOpt.get());
        result.put("editMode", true);
        result.put("existingImages", sanPhamOpt.get().getImages());
        result.put("loais", loais);
        result.put("nhanHieus", nhanHieus);
        result.put("nhaCungCaps", nhaCungCaps);
        
        return ServiceResult.ok("Lấy dữ liệu form sửa thành công", result);
    }

    @Override
    public ServiceResult<Void> createProduct(ProductDTO productDTO, String imageUrls) {
        try {
            sanPhamService.saveProductWithUrls(productDTO, imageUrls);
            return ServiceResult.ok("Tạo sản phẩm thành công", null);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo sản phẩm: " + e.getMessage());
        }
    }

    @Override
    public ServiceResult<Void> updateProduct(ProductDTO productDTO, String imageUrls) {
        try {
            sanPhamService.updateProductWithUrls(productDTO, imageUrls);
            return ServiceResult.ok("Cập nhật sản phẩm thành công", null);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật sản phẩm: " + e.getMessage());
        }
    }

    @Override
    public ServiceResult<Void> deleteProductImage(Integer imageId) {
        try {
            // Lấy image URL từ database trước khi xóa
            String imageUrl = sanPhamService.getImageUrlById(imageId);
            
            // Xóa image từ Cloudinary
            if (imageUrl != null) {
                boolean deletedFromCloudinary = imageService.deleteImage(imageUrl);
                if (!deletedFromCloudinary) {
                    System.out.println("Không thể xóa image từ Cloudinary: " + imageUrl);
                }
            }
            
            // Xóa record từ database
            sanPhamService.deleteImageById(imageId);
            return ServiceResult.ok("Xóa ảnh thành công", null);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa ảnh: " + e.getMessage());
        }
    }

    @Override
    public ServiceResult<Void> toggleProductActiveStatus(Integer productId, boolean active) {
        try {
            sanPhamService.toggleProductActiveStatus(productId, active);
            return ServiceResult.ok("Cập nhật trạng thái sản phẩm thành công", null);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật trạng thái sản phẩm: " + e.getMessage());
        }
    }

    @Override
    public ServiceResult<Void> deleteProduct(Integer productId) {
        try {
            sanPhamService.deleteProductById(productId);
            return ServiceResult.ok("Xóa sản phẩm thành công", null);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa sản phẩm: " + e.getMessage());
        }
    }
}





