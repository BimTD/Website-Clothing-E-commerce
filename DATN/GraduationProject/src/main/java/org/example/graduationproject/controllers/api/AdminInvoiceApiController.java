package org.example.graduationproject.controllers.api;

import org.example.graduationproject.models.HoaDon;
import org.example.graduationproject.services.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminInvoiceApiController {

    @Autowired
    private HoaDonService hoaDonService;

    /**
     * Lấy danh sách tất cả hóa đơn với phân trang và lọc
     */
    @GetMapping("/invoices")
    public ResponseEntity<Map<String, Object>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        try {
            // Tạo Pageable với sắp xếp theo ngày tạo giảm dần
            Pageable pageable = PageRequest.of(page, size, Sort.by("ngayTao").descending());
            
            // Lấy danh sách hóa đơn (tạm thời lấy tất cả, có thể thêm filter sau)
            Page<HoaDon> invoicePage = hoaDonService.getAllInvoices(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", invoicePage.getContent().stream().map(this::convertToInvoiceDTO).toArray());
            response.put("totalPages", invoicePage.getTotalPages());
            response.put("totalElements", invoicePage.getTotalElements());
            response.put("currentPage", invoicePage.getNumber());
            response.put("size", invoicePage.getSize());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Lấy chi tiết hóa đơn theo ID
     */
    @GetMapping("/invoices/{id}")
    public ResponseEntity<Map<String, Object>> getInvoiceById(@PathVariable Integer id) {
        try {
            HoaDon invoice = hoaDonService.getOrderById(id);
            if (invoice == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy hóa đơn"
                ));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", convertToInvoiceDTO(invoice));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Duyệt hóa đơn (chuyển từ PENDING sang CONFIRMED)
     */
    @PostMapping("/invoices/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveInvoice(@PathVariable Integer id) {
        try {
            boolean success = hoaDonService.updateOrderStatus(id, "CONFIRMED");
            if (!success) {
                return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "message", "Không thể duyệt hóa đơn này"
                ));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Duyệt hóa đơn thành công"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Hủy hóa đơn
     */
    @PostMapping("/invoices/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelInvoice(@PathVariable Integer id) {
        try {
            boolean success = hoaDonService.updateOrderStatusAndRestoreStock(id, "CANCELLED");
            if (!success) {
                return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "message", "Không thể hủy hóa đơn này"
                ));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Hủy hóa đơn thành công"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Cập nhật trạng thái hóa đơn
     */
    @PostMapping("/invoices/{id}/update-status")
    public ResponseEntity<Map<String, Object>> updateInvoiceStatus(
            @PathVariable Integer id,
            @RequestParam String newStatus) {
        try {
            boolean success = hoaDonService.updateOrderStatus(id, newStatus);
            if (!success) {
                return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "message", "Không thể cập nhật trạng thái hóa đơn này"
                ));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cập nhật trạng thái hóa đơn thành công"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Convert HoaDon entity to DTO for admin
     */
    private Map<String, Object> convertToInvoiceDTO(HoaDon invoice) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", invoice.getId());
        dto.put("ngayTao", invoice.getNgayTao());
        dto.put("ghiChu", invoice.getGhiChu());
        dto.put("trangThai", invoice.getTrangThai());
        dto.put("loaiThanhToan", invoice.getLoaiThanhToan());
        dto.put("daLayTien", invoice.getDaLayTien());
        dto.put("diaChiGiaoHang", invoice.getDiaChiGiaoHang());
        dto.put("tenNguoiNhan", invoice.getTenNguoiNhan());
        dto.put("soDienThoaiGiaoHang", invoice.getSoDienThoaiGiaoHang());
        dto.put("tongTien", invoice.getTongTien());
        dto.put("userId", invoice.getUser() != null ? invoice.getUser().getId() : null);
        dto.put("userTen", invoice.getUser() != null ? invoice.getUser().getHoTen() : null);
        dto.put("userEmail", invoice.getUser() != null ? invoice.getUser().getEmail() : null);

        // Chi tiết hóa đơn
        if (invoice.getChiTietHoaDons() != null) {
            dto.put("chiTietHoaDons", invoice.getChiTietHoaDons().stream().map(this::convertToInvoiceDetailDTO).toArray());
        }

        return dto;
    }

    /**
     * Convert ChiTietHoaDon entity to DTO
     */
    private Map<String, Object> convertToInvoiceDetailDTO(org.example.graduationproject.models.ChiTietHoaDon detail) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", detail.getId());
        dto.put("soLuong", detail.getSoLuong());
        dto.put("thanhTien", detail.getThanhTien());
        dto.put("hoaDonId", detail.getHoaDon() != null ? detail.getHoaDon().getId() : null);
        dto.put("sanPhamBienTheId", detail.getSanPhamBienThe() != null ? detail.getSanPhamBienThe().getId() : null);

        // Thông tin sản phẩm
        if (detail.getSanPhamBienThe() != null && detail.getSanPhamBienThe().getSanPham() != null) {
            dto.put("sanPhamTen", detail.getSanPhamBienThe().getSanPham().getTen());
            dto.put("giaBan", detail.getSanPhamBienThe().getSanPham().getGiaBan());
            
            // Thông tin biến thể
            StringBuilder variantInfo = new StringBuilder();
            if (detail.getSanPhamBienThe().getSize() != null) {
                variantInfo.append("Size: ").append(detail.getSanPhamBienThe().getSize().getTenSize());
            }
            if (detail.getSanPhamBienThe().getMauSac() != null) {
                if (variantInfo.length() > 0) variantInfo.append(", ");
                variantInfo.append("Màu: ").append(detail.getSanPhamBienThe().getMauSac().getMaMau());
            }
            dto.put("variantInfo", variantInfo.toString());
        }

        return dto;
    }
}




