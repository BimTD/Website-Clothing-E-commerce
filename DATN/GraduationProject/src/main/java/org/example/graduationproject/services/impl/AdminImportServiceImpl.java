package org.example.graduationproject.services.impl;

import org.example.graduationproject.dto.ImportRequestDTO;
import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.exceptions.BadRequestException;
import org.example.graduationproject.exceptions.NotFoundException;
import org.example.graduationproject.models.ChiTietPhieuNhapHang;
import org.example.graduationproject.models.NhaCungCap;
import org.example.graduationproject.models.PhieuNhapHang;
import org.example.graduationproject.models.SanPhamBienThe;
import org.example.graduationproject.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PreDestroy;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class AdminImportServiceImpl implements AdminImportService {

    @Autowired
    private NhaCungCapService nhaCungCapService;
    
    @Autowired
    private SanPhamService sanPhamService;
    
    @Autowired
    private SanPhamBienTheService sanPhamBienTheService;
    
    @Autowired
    private PhieuNhapHangService phieuNhapHangService;
    
    @Autowired
    private ChiTietPhieuNhapHangService chiTietPhieuNhapHangService;
    
    @Autowired
    private ExcelExportService excelExportService;
    
    @Autowired
    private PdfExportService pdfExportService;

    @Override
    public ServiceResult<Map<String, Object>> getImportsWithFilters(String search, int page, int size) {
        // Lấy danh sách phiếu nhập hàng từ database với phân trang và tìm kiếm
        Page<PhieuNhapHang> phieuNhapHangPage;
        if (search != null && !search.trim().isEmpty()) {
            // Tìm kiếm theo số chứng từ hoặc tên nhà cung cấp
            phieuNhapHangPage = phieuNhapHangService.searchBySoChungTuContainingIgnoreCase(search, PageRequest.of(page, size));
            if (phieuNhapHangPage.getTotalElements() == 0) {
                // Nếu không tìm thấy theo số chứng từ, tìm theo tên nhà cung cấp
                phieuNhapHangPage = phieuNhapHangService.searchByNhaCungCapTenContainingIgnoreCase(search, PageRequest.of(page, size));
            }
        } else {
            phieuNhapHangPage = phieuNhapHangService.getAllPaging(PageRequest.of(page, size));
        }

        // Tính toán các trang cho navigation
        int lastPage = phieuNhapHangPage.getTotalPages() > 0 ? phieuNhapHangPage.getTotalPages() - 1 : 0;
        int prevPage = page > 0 ? page - 1 : 0;
        int nextPage = (page + 1 < phieuNhapHangPage.getTotalPages()) ? page + 1 : lastPage;

        Map<String, Object> result = new HashMap<>();
        result.put("phieuNhapHangs", phieuNhapHangPage.getContent());
        result.put("phieuNhapHangPage", phieuNhapHangPage);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", phieuNhapHangPage.getTotalPages());
        result.put("totalElements", phieuNhapHangPage.getTotalElements());
        result.put("lastPage", lastPage);
        result.put("prevPage", prevPage);
        result.put("nextPage", nextPage);
        result.put("search", search);

        return ServiceResult.ok("Lấy danh sách phiếu nhập hàng thành công", result);
    }

    @Override
    @Transactional
    public ServiceResult<Map<String, Object>> createImport(ImportRequestDTO request) {
        // 1. Validate request
        if (request.getSupplierId() == null || request.getDetails() == null || request.getDetails().isEmpty()) {
            throw new BadRequestException("Dữ liệu không hợp lệ!");
        }
        
        // 2. Get supplier
        Optional<NhaCungCap> supplierOpt = nhaCungCapService.findById(request.getSupplierId());
        if (supplierOpt.isEmpty()) {
            throw new NotFoundException("Không tìm thấy nhà cung cấp!");
        }
        NhaCungCap supplier = supplierOpt.get();
        
        // 3. Calculate total amount
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (var detail : request.getDetails()) {
            BigDecimal price = detail.getImportPrice() != null ? detail.getImportPrice() : BigDecimal.ZERO;
            totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(detail.getQuantity())));
        }
        
        // 4. Create PhieuNhapHang
        PhieuNhapHang phieuNhapHang = new PhieuNhapHang();
        phieuNhapHang.setSoChungTu("PN" + System.currentTimeMillis()); // Generate receipt number
        phieuNhapHang.setNgayTao(LocalDateTime.now());
        phieuNhapHang.setTongTien(totalAmount);
        phieuNhapHang.setNguoiLapPhieu(getCurrentUsername());
        phieuNhapHang.setGhiChu(request.getNote());
        phieuNhapHang.setNhaCungCap(supplier);
        
        // Save PhieuNhapHang
        phieuNhapHang = phieuNhapHangService.save(phieuNhapHang);
        
        // 5. Create ChiTietPhieuNhapHang for each detail
        for (var detail : request.getDetails()) {
            // Get SanPhamBienThe
            Optional<SanPhamBienThe> variantOpt = sanPhamBienTheService.getSanPhamBienTheById(detail.getVariantId());
            if (variantOpt.isEmpty()) {
                throw new NotFoundException("Không tìm thấy biến thể sản phẩm với ID: " + detail.getVariantId());
            }
            SanPhamBienThe variant = variantOpt.get();
            
            // Create ChiTietPhieuNhapHang
            ChiTietPhieuNhapHang chiTiet = new ChiTietPhieuNhapHang();
            chiTiet.setSoLuongNhap(detail.getQuantity());
            BigDecimal price = detail.getImportPrice() != null ? detail.getImportPrice() : BigDecimal.ZERO;
            chiTiet.setThanhTienNhap(price.multiply(BigDecimal.valueOf(detail.getQuantity())));
            chiTiet.setPhieuNhapHang(phieuNhapHang);
            chiTiet.setSanPhamBienThe(variant);
            
            // Save ChiTietPhieuNhapHang
            chiTietPhieuNhapHangService.save(chiTiet);
            
            // 6. Update product variant quantity
            int currentQuantity = variant.getSoLuongTon() != null ? variant.getSoLuongTon() : 0;
            variant.setSoLuongTon(currentQuantity + detail.getQuantity());
            sanPhamBienTheService.saveSanPhamBienThe(variant);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Tạo phiếu nhập thành công! Mã phiếu: " + phieuNhapHang.getSoChungTu());
        
        // Tạo response object đơn giản để tránh circular reference
        Map<String, Object> phieuResponse = new HashMap<>();
        phieuResponse.put("id", phieuNhapHang.getId());
        phieuResponse.put("soChungTu", phieuNhapHang.getSoChungTu());
        phieuResponse.put("ngayTao", phieuNhapHang.getNgayTao());
        phieuResponse.put("tongTien", phieuNhapHang.getTongTien());
        phieuResponse.put("nguoiLapPhieu", phieuNhapHang.getNguoiLapPhieu());
        phieuResponse.put("ghiChu", phieuNhapHang.getGhiChu());
        
        // Thêm thông tin nhà cung cấp đơn giản
        if (phieuNhapHang.getNhaCungCap() != null) {
            Map<String, Object> supplierInfo = new HashMap<>();
            supplierInfo.put("id", phieuNhapHang.getNhaCungCap().getId());
            supplierInfo.put("ten", phieuNhapHang.getNhaCungCap().getTen());
            phieuResponse.put("nhaCungCap", supplierInfo);
        }
        
        result.put("phieuNhapHang", phieuResponse);
        
        return ServiceResult.ok("Tạo phiếu nhập thành công", result);
    }

    @Override
    public ServiceResult<Map<String, Object>> getImportDetail(Integer importId) {
        Optional<PhieuNhapHang> phieuOpt = phieuNhapHangService.findById(importId);
        if (phieuOpt.isEmpty()) {
            throw new NotFoundException("Không tìm thấy phiếu nhập hàng");
        }
        
        PhieuNhapHang phieu = phieuOpt.get();
        List<ChiTietPhieuNhapHang> details = chiTietPhieuNhapHangService.findByPhieuNhapHangId(importId);
        
        // Tạo response object đơn giản để tránh circular reference
        Map<String, Object> phieuResponse = new HashMap<>();
        phieuResponse.put("id", phieu.getId());
        phieuResponse.put("soChungTu", phieu.getSoChungTu());
        phieuResponse.put("ngayTao", phieu.getNgayTao());
        phieuResponse.put("tongTien", phieu.getTongTien());
        phieuResponse.put("nguoiLapPhieu", phieu.getNguoiLapPhieu());
        phieuResponse.put("ghiChu", phieu.getGhiChu());
        
        // Thêm thông tin nhà cung cấp đơn giản
        if (phieu.getNhaCungCap() != null) {
            Map<String, Object> supplierInfo = new HashMap<>();
            supplierInfo.put("id", phieu.getNhaCungCap().getId());
            supplierInfo.put("ten", phieu.getNhaCungCap().getTen());
            supplierInfo.put("email", phieu.getNhaCungCap().getEmail());
            supplierInfo.put("sdt", phieu.getNhaCungCap().getSdt());
            supplierInfo.put("diaChi", phieu.getNhaCungCap().getDiaChi());
            phieuResponse.put("nhaCungCap", supplierInfo);
        }
        
        // Tạo danh sách chi tiết đơn giản
        List<Map<String, Object>> detailsResponse = details.stream().map(detail -> {
            Map<String, Object> detailMap = new HashMap<>();
            detailMap.put("id", detail.getId());
            detailMap.put("soLuongNhap", detail.getSoLuongNhap());
            detailMap.put("thanhTienNhap", detail.getThanhTienNhap());
            
                         // Thêm thông tin sản phẩm biến thể
             if (detail.getSanPhamBienThe() != null) {
                 Map<String, Object> variantInfo = new HashMap<>();
                 variantInfo.put("id", detail.getSanPhamBienThe().getId());
                 variantInfo.put("soLuongTon", detail.getSanPhamBienThe().getSoLuongTon());
                 
                 // Thêm thông tin sản phẩm
                 if (detail.getSanPhamBienThe().getSanPham() != null) {
                     Map<String, Object> productInfo = new HashMap<>();
                     productInfo.put("id", detail.getSanPhamBienThe().getSanPham().getId());
                     productInfo.put("ten", detail.getSanPhamBienThe().getSanPham().getTen());
                     variantInfo.put("sanPham", productInfo);
                 }
                 
                 // Thêm thông tin màu sắc
                 if (detail.getSanPhamBienThe().getMauSac() != null) {
                     Map<String, Object> colorInfo = new HashMap<>();
                     colorInfo.put("id", detail.getSanPhamBienThe().getMauSac().getId());
                     colorInfo.put("maMau", detail.getSanPhamBienThe().getMauSac().getMaMau());
                     if (detail.getSanPhamBienThe().getMauSac().getLoai() != null) {
                         colorInfo.put("loaiTen", detail.getSanPhamBienThe().getMauSac().getLoai().getTen());
                     }
                     variantInfo.put("mauSac", colorInfo);
                 }
                 
                 // Thêm thông tin size
                 if (detail.getSanPhamBienThe().getSize() != null) {
                     Map<String, Object> sizeInfo = new HashMap<>();
                     sizeInfo.put("id", detail.getSanPhamBienThe().getSize().getId());
                     sizeInfo.put("tenSize", detail.getSanPhamBienThe().getSize().getTenSize());
                     if (detail.getSanPhamBienThe().getSize().getLoai() != null) {
                         sizeInfo.put("loaiTen", detail.getSanPhamBienThe().getSize().getLoai().getTen());
                     }
                     variantInfo.put("size", sizeInfo);
                 }
                 
                 detailMap.put("sanPhamBienThe", variantInfo);
             }
            
            return detailMap;
        }).collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("phieu", phieuResponse);
        result.put("details", detailsResponse);
        
        return ServiceResult.ok("Lấy chi tiết phiếu nhập hàng thành công", result);
    }

    @Override
    @Transactional
    public ServiceResult<Void> deleteImport(Integer importId) {
        Optional<PhieuNhapHang> phieuOpt = phieuNhapHangService.findById(importId);
        if (phieuOpt.isEmpty()) {
            throw new NotFoundException("Không tìm thấy phiếu nhập hàng");
        }
        
        // Rollback tồn kho từ các chi tiết
        List<ChiTietPhieuNhapHang> details = chiTietPhieuNhapHangService.findByPhieuNhapHangId(importId);
        for (ChiTietPhieuNhapHang ct : details) {
            if (ct.getSanPhamBienThe() != null) {
                SanPhamBienThe variant = ct.getSanPhamBienThe();
                int currentQuantity = variant.getSoLuongTon() != null ? variant.getSoLuongTon() : 0;
                int newQuantity = currentQuantity - (ct.getSoLuongNhap() != null ? ct.getSoLuongNhap() : 0);
                variant.setSoLuongTon(Math.max(newQuantity, 0));
                sanPhamBienTheService.saveSanPhamBienThe(variant);
            }
        }
        
        // Xóa phiếu (cascade sẽ xóa chi tiết)
        phieuNhapHangService.deleteById(importId);
        
        return ServiceResult.ok("Xóa phiếu nhập hàng thành công", null);
    }

    @Override
    public ServiceResult<byte[]> exportImportToExcel(Integer importId) {
        try {
            Optional<PhieuNhapHang> phieuOpt = phieuNhapHangService.findById(importId);
            if (phieuOpt.isEmpty()) {
                throw new NotFoundException("Không tìm thấy phiếu nhập hàng");
            }
            
            PhieuNhapHang phieu = phieuOpt.get();
            List<ChiTietPhieuNhapHang> details = chiTietPhieuNhapHangService.findByPhieuNhapHangId(importId);
            
            // Sử dụng NIO version mới cho performance tốt hơn
            byte[] excelContent = excelExportService.exportImportDetailToExcel(phieu, details);
            
            return ServiceResult.ok("Export Excel thành công", excelContent);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi export Excel: " + e.getMessage(), e);
        }
    }
    
    /**
     * Export Excel với async processing cho data lớn
     */
    public ServiceResult<CompletableFuture<byte[]>> exportImportToExcelAsync(Integer importId) {
        try {
            Optional<PhieuNhapHang> phieuOpt = phieuNhapHangService.findById(importId);
            if (phieuOpt.isEmpty()) {
                throw new NotFoundException("Không tìm thấy phiếu nhập hàng");
            }
            
            PhieuNhapHang phieu = phieuOpt.get();
            List<ChiTietPhieuNhapHang> details = chiTietPhieuNhapHangService.findByPhieuNhapHangId(importId);
            
            // Sử dụng async version cho data lớn
            CompletableFuture<byte[]> future = excelExportService.exportImportDetailToExcelAsync(phieu, details);
            
            return ServiceResult.ok("Export Excel async đã được khởi tạo", future);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi khởi tạo export Excel async: " + e.getMessage(), e);
        }
    }
    
    /**
     * Export Excel với batch processing cho data rất lớn
     */
    public ServiceResult<CompletableFuture<byte[]>> exportImportToExcelBatch(Integer importId) {
        try {
            Optional<PhieuNhapHang> phieuOpt = phieuNhapHangService.findById(importId);
            if (phieuOpt.isEmpty()) {
                throw new NotFoundException("Không tìm thấy phiếu nhập hàng");
            }
            
            PhieuNhapHang phieu = phieuOpt.get();
            List<ChiTietPhieuNhapHang> details = chiTietPhieuNhapHangService.findByPhieuNhapHangId(importId);
            
            // Sử dụng batch version cho data rất lớn
            CompletableFuture<byte[]> future = excelExportService.exportImportDetailToExcelBatch(phieu, details);
            
            return ServiceResult.ok("Export Excel batch đã được khởi tạo", future);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi khởi tạo export Excel batch: " + e.getMessage(), e);
        }
    }

    @Override
    public ServiceResult<byte[]> exportImportToPdf(Integer importId) {
        try {
            Optional<PhieuNhapHang> phieuOpt = phieuNhapHangService.findById(importId);
            if (phieuOpt.isEmpty()) {
                throw new NotFoundException("Không tìm thấy phiếu nhập hàng");
            }
            
            PhieuNhapHang phieu = phieuOpt.get();
            List<ChiTietPhieuNhapHang> details = chiTietPhieuNhapHangService.findByPhieuNhapHangId(importId);
            
            byte[] pdfContent = pdfExportService.exportImportDetailToPdf(phieu, details);
            
            return ServiceResult.ok("Export PDF thành công", pdfContent);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi export PDF: " + e.getMessage(), e);
        }
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "Unknown";
    }
    
    /**
     * Lấy PhieuNhapHang entity trực tiếp
     */
    public Optional<PhieuNhapHang> getPhieuNhapHangById(Integer importId) {
        return phieuNhapHangService.findById(importId);
    }
    
    /**
     * Lấy danh sách ChiTietPhieuNhapHang
     */
    public List<ChiTietPhieuNhapHang> getChiTietPhieuNhapHangById(Integer importId) {
        return chiTietPhieuNhapHangService.findByPhieuNhapHangId(importId);
    }
    
    /**
     * Cleanup temp files khi application shutdown
     */
    @PreDestroy
    public void cleanup() {
        try {
            excelExportService.cleanupTempFiles();
        } catch (Exception e) {
            System.err.println("Lỗi cleanup temp files: " + e.getMessage());
        }
    }
}
