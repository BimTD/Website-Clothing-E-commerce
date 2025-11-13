package org.example.graduationproject.controllers.api;

import org.example.graduationproject.dto.CheckoutDTO;
import org.example.graduationproject.dto.CheckoutRequestDTO;
import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.models.HoaDon;
import org.example.graduationproject.models.User;
import org.example.graduationproject.repositories.UserRepository;
import org.example.graduationproject.services.HoaDonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserOrderApiController {

    @Autowired
    private HoaDonService hoaDonService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Tạo đơn hàng từ thông tin checkout
     */
    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody CheckoutRequestDTO checkoutRequestDTO) {
        try {
            // Lấy user hiện tại
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Vui lòng đăng nhập"
                ));
            }

            // Tạo đơn hàng từ checkout data
            HoaDon order = hoaDonService.createOrderFromCheckout(currentUser, checkoutRequestDTO);

            // Trả về thông tin đơn hàng
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo đơn hàng thành công");
            response.put("orderId", order.getId());
            response.put("order", convertToOrderDTO(order));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Lấy danh sách đơn hàng của user hiện tại
     */
    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getUserOrders() {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Vui lòng đăng nhập"
                ));
            }

            var orders = hoaDonService.getUserOrders(currentUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orders", orders.stream().map(this::convertToOrderDTO).toArray());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Lấy chi tiết đơn hàng
     */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrderDetail(@PathVariable Integer orderId) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Vui lòng đăng nhập"
                ));
            }

            HoaDon order = hoaDonService.getUserOrderById(currentUser, orderId);
            if (order == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy đơn hàng"
                ));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order", convertToOrderDTO(order));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Hủy đơn hàng
     */
    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelOrder(@PathVariable Integer orderId) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Vui lòng đăng nhập"
                ));
            }

            boolean success = hoaDonService.cancelOrder(currentUser, orderId);
            if (!success) {
                return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "message", "Không thể hủy đơn hàng này"
                ));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Hủy đơn hàng thành công"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Lấy user hiện tại từ Security Context
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    /**
     * Convert HoaDon entity to DTO
     */
    private Map<String, Object> convertToOrderDTO(HoaDon order) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", order.getId());
        dto.put("ngayTao", order.getNgayTao());
        dto.put("ghiChu", order.getGhiChu());
        dto.put("trangThai", order.getTrangThai());
        dto.put("loaiThanhToan", order.getLoaiThanhToan());
        dto.put("daLayTien", order.getDaLayTien());
        dto.put("diaChiGiaoHang", order.getDiaChiGiaoHang());
        dto.put("tenNguoiNhan", order.getTenNguoiNhan());
        dto.put("soDienThoaiGiaoHang", order.getSoDienThoaiGiaoHang());
        dto.put("tongTien", order.getTongTien());

        // Chi tiết đơn hàng
        if (order.getChiTietHoaDons() != null) {
            dto.put("chiTietHoaDons", order.getChiTietHoaDons().stream().map(this::convertToOrderItemDTO).toArray());
        }

        return dto;
    }

    /**
     * Convert ChiTietHoaDon entity to DTO
     */
    private Map<String, Object> convertToOrderItemDTO(org.example.graduationproject.models.ChiTietHoaDon item) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", item.getId());
        dto.put("soLuong", item.getSoLuong());
        dto.put("thanhTien", item.getThanhTien());

        // Thông tin sản phẩm biến thể
        if (item.getSanPhamBienThe() != null) {
            Map<String, Object> variant = new HashMap<>();
            variant.put("id", item.getSanPhamBienThe().getId());
            variant.put("soLuongTon", item.getSanPhamBienThe().getSoLuongTon());
            variant.put("giaBan", item.getSanPhamBienThe().getSanPham() != null ? 
                item.getSanPhamBienThe().getSanPham().getGiaBan() : null);

            // Thông tin sản phẩm
            if (item.getSanPhamBienThe().getSanPham() != null) {
                Map<String, Object> product = new HashMap<>();
                product.put("id", item.getSanPhamBienThe().getSanPham().getId());
                product.put("ten", item.getSanPhamBienThe().getSanPham().getTen());
                product.put("hinhAnh", item.getSanPhamBienThe().getSanPham().getImages() != null && 
                    !item.getSanPhamBienThe().getSanPham().getImages().isEmpty() ? 
                    item.getSanPhamBienThe().getSanPham().getImages().get(0).getImageName() : null);
                variant.put("sanPham", product);
            }

            // Thông tin kích thước
            if (item.getSanPhamBienThe().getSize() != null) {
                Map<String, Object> size = new HashMap<>();
                size.put("id", item.getSanPhamBienThe().getSize().getId());
                size.put("ten", item.getSanPhamBienThe().getSize().getTenSize());
                variant.put("kichThuoc", size);
            }

            // Thông tin màu sắc
            if (item.getSanPhamBienThe().getMauSac() != null) {
                Map<String, Object> color = new HashMap<>();
                color.put("id", item.getSanPhamBienThe().getMauSac().getId());
                color.put("ten", item.getSanPhamBienThe().getMauSac().getMaMau());
                variant.put("mauSac", color);
            }

            dto.put("sanPhamBienThe", variant);
        }

        return dto;
    }
}
