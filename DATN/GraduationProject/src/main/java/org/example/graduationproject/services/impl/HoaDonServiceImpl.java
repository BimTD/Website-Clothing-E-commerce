package org.example.graduationproject.services.impl;

import org.example.graduationproject.dto.CheckoutDTO;
import org.example.graduationproject.dto.CheckoutRequestDTO;
import org.example.graduationproject.enums.PaymentType;
import org.example.graduationproject.models.*;
import org.example.graduationproject.repositories.ChiTietHoaDonRepository;
import org.example.graduationproject.repositories.HoaDonRepository;
import org.example.graduationproject.repositories.SanPhamBienTheRepository;
import org.example.graduationproject.services.GioHangService;
import org.example.graduationproject.services.HoaDonService;
import org.example.graduationproject.events.OrderEventPublisher;
import org.example.graduationproject.events.OrderStatusChangedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class HoaDonServiceImpl implements HoaDonService {

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private ChiTietHoaDonRepository chiTietHoaDonRepository;

    @Autowired
    private GioHangService gioHangService;

    @Autowired
    private SanPhamBienTheRepository sanPhamBienTheRepository;
    
    @Autowired
    private OrderEventPublisher orderEventPublisher;

    @Override
    @Transactional
    public HoaDon createOrderFromCart(User user, CheckoutDTO checkoutDTO) {
        // Lấy giỏ hàng active của user
        GioHang activeCart = gioHangService.getActiveCart(user);
        if (activeCart == null || activeCart.getChiTietGioHangs() == null || activeCart.getChiTietGioHangs().isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống, không thể tạo đơn hàng");
        }

        // Validate payment method trước khi tạo hóa đơn
        String paymentMethod = checkoutDTO.getLoaiThanhToan();
        if (!PaymentType.CASH.getCode().equals(paymentMethod)) {
            throw new RuntimeException("Phương thức thanh toán không được hỗ trợ: " + paymentMethod + ". Hiện tại chỉ hỗ trợ thanh toán tiền mặt (" + PaymentType.CASH.getCode() + ").");
        }
        
        // Tạo hóa đơn mới
        HoaDon hoaDon = new HoaDon();
        hoaDon.setUser(user);
        hoaDon.setNgayTao(LocalDateTime.now());
        hoaDon.setGhiChu(checkoutDTO.getGhiChu());
        hoaDon.setTrangThai("PENDING"); // PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED
        hoaDon.setLoaiThanhToan(paymentMethod); // Đã validate ở trên, chỉ CASH
        hoaDon.setDaLayTien("NO"); // NO, YES
        
        // Lưu thông tin địa chỉ giao hàng
        hoaDon.setDiaChiGiaoHang(checkoutDTO.getDiaChiGiaoHang());
        hoaDon.setTenNguoiNhan(checkoutDTO.getTenNguoiNhan());
        hoaDon.setSoDienThoaiGiaoHang(checkoutDTO.getSoDienThoai());
        
        // Tính tổng tiền
        BigDecimal tongTien = activeCart.getChiTietGioHangs().stream()
                .map(ChiTietGioHang::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Cộng phí giao hàng
        if (checkoutDTO.getPhiGiaoHang() != null) {
            tongTien = tongTien.add(checkoutDTO.getPhiGiaoHang());
        }
        
        hoaDon.setTongTien(tongTien);
        
        // Lưu hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);

        // Tạo chi tiết hóa đơn
        List<ChiTietHoaDon> chiTietHoaDons = new ArrayList<>();
        for (ChiTietGioHang cartItem : activeCart.getChiTietGioHangs()) {
            ChiTietHoaDon chiTietHoaDon = new ChiTietHoaDon();
            chiTietHoaDon.setHoaDon(hoaDon);
            chiTietHoaDon.setSanPhamBienThe(cartItem.getSanPhamBienThe());
            chiTietHoaDon.setSoLuong(cartItem.getSoLuong());
            chiTietHoaDon.setThanhTien(cartItem.getThanhTien());
            
            chiTietHoaDons.add(chiTietHoaDon);
        }
        
        // Lưu chi tiết hóa đơn
        chiTietHoaDonRepository.saveAll(chiTietHoaDons);
        
        // Cập nhật trạng thái giỏ hàng thành "ordered"
        activeCart.setTrangThai("ordered");
        activeCart.setNgayCapNhat(LocalDateTime.now());
        gioHangService.updateCartStatus(activeCart);

        // Publish event cho Observer Pattern
        publishOrderStatusEvent(hoaDon, "NEW", "PENDING");

        return hoaDon;
    }

    @Override
    @Transactional
    public HoaDon createOrderFromCheckout(User user, CheckoutRequestDTO checkoutRequestDTO) {
        // Validate dữ liệu đầu vào
        if (checkoutRequestDTO.getItems() == null || checkoutRequestDTO.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống, không thể tạo đơn hàng");
        }

        // Validate payment method
        String paymentMethod = checkoutRequestDTO.getLoaiThanhToan();
        if (!PaymentType.CASH.getCode().equals(paymentMethod)) {
            throw new RuntimeException("Phương thức thanh toán không được hỗ trợ: " + paymentMethod + ". Hiện tại chỉ hỗ trợ thanh toán tiền mặt (" + PaymentType.CASH.getCode() + ").");
        }
        
        // Tạo hóa đơn mới
        HoaDon hoaDon = new HoaDon();
        hoaDon.setUser(user);
        hoaDon.setNgayTao(LocalDateTime.now());
        hoaDon.setGhiChu(checkoutRequestDTO.getGhiChu());
        hoaDon.setTrangThai("PENDING");
        hoaDon.setLoaiThanhToan(paymentMethod);
        hoaDon.setDaLayTien("NO");
        
        // Lưu thông tin địa chỉ giao hàng
        hoaDon.setDiaChiGiaoHang(checkoutRequestDTO.getDiaChiGiaoHang());
        hoaDon.setTenNguoiNhan(checkoutRequestDTO.getTenNguoiNhan());
        hoaDon.setSoDienThoaiGiaoHang(checkoutRequestDTO.getSoDienThoai());
        
        // Tính tổng tiền từ items
        BigDecimal tongTien = checkoutRequestDTO.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Cộng phí giao hàng
        if (checkoutRequestDTO.getPhiGiaoHang() != null) {
            tongTien = tongTien.add(checkoutRequestDTO.getPhiGiaoHang());
        }
        
        hoaDon.setTongTien(tongTien);
        
        // Lưu hóa đơn
        hoaDon = hoaDonRepository.save(hoaDon);

        // Tạo chi tiết hóa đơn từ items
        List<ChiTietHoaDon> chiTietHoaDons = new ArrayList<>();
        for (CheckoutRequestDTO.CartItemDTO item : checkoutRequestDTO.getItems()) {
            // Tìm sản phẩm biến thể dựa trên productId, size, color
            SanPhamBienThe variant = findProductVariant(item.getProductId(), item.getSize(), item.getColor());
            if (variant == null) {
                throw new RuntimeException("Không tìm thấy sản phẩm biến thể: " + item.getProductName() + " - " + item.getSize() + " - " + item.getColor());
            }
            
            ChiTietHoaDon chiTietHoaDon = new ChiTietHoaDon();
            chiTietHoaDon.setHoaDon(hoaDon);
            chiTietHoaDon.setSanPhamBienThe(variant);
            chiTietHoaDon.setSoLuong(item.getQuantity());
            chiTietHoaDon.setThanhTien(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            
            chiTietHoaDons.add(chiTietHoaDon);
        }
        
        // Lưu chi tiết hóa đơn
        chiTietHoaDonRepository.saveAll(chiTietHoaDons);

        // Publish event cho Observer Pattern
        publishOrderStatusEvent(hoaDon, "NEW", "PENDING");

        return hoaDon;
    }

    /**
     * Tìm sản phẩm biến thể dựa trên productId, size, color
     */
    private SanPhamBienThe findProductVariant(Integer productId, String sizeName, String colorName) {
        // Tìm tất cả biến thể của sản phẩm
        List<SanPhamBienThe> variants = sanPhamBienTheRepository.findAll().stream()
                .filter(v -> v.getSanPham() != null && v.getSanPham().getId().equals(productId))
                .collect(java.util.stream.Collectors.toList());
        
        // Tìm biến thể phù hợp với size và color
        for (SanPhamBienThe variant : variants) {
            boolean sizeMatch = variant.getSize() != null && variant.getSize().getTenSize().equals(sizeName);
            boolean colorMatch = variant.getMauSac() != null && variant.getMauSac().getMaMau().equals(colorName);
            
            if (sizeMatch && colorMatch) {
                return variant;
            }
        }
        
        return null;
    }

    @Override
    public List<HoaDon> getUserOrders(User user) {
        return hoaDonRepository.findByUserOrderByNgayTaoDesc(user);
    }

    @Override
    public Page<HoaDon> getAllInvoices(Pageable pageable) {
        return hoaDonRepository.findAll(pageable);
    }

    @Override
    public HoaDon getOrderById(Integer orderId) {
        return hoaDonRepository.findById(orderId).orElse(null);
    }

    @Override
    public HoaDon getUserOrderById(User user, Integer orderId) {
        HoaDon hoaDon = hoaDonRepository.findById(orderId).orElse(null);
        if (hoaDon != null && hoaDon.getUser().getId().equals(user.getId())) {
            return hoaDon;
        }
        return null;
    }

    @Override
    @Transactional
    public boolean updateOrderStatus(Integer orderId, String newStatus) {
        HoaDon hoaDon = hoaDonRepository.findById(orderId).orElse(null);
        if (hoaDon != null) {
            String currentStatus = hoaDon.getTrangThai();
            String oldStatus = currentStatus; // Lưu status cũ

            // Nếu chuyển từ PENDING -> CONFIRMED thì kiểm tra và trừ tồn kho
            if ("PENDING".equalsIgnoreCase(currentStatus) && "CONFIRMED".equalsIgnoreCase(newStatus)) {
                List<ChiTietHoaDon> chiTietList = chiTietHoaDonRepository.findByHoaDon(hoaDon);

                // Gom số lượng theo từng biến thể để kiểm tra 1 lần
                Map<Integer, Integer> variantIdToRequiredQty = new HashMap<>();
                for (ChiTietHoaDon cthd : chiTietList) {
                    if (cthd.getSanPhamBienThe() == null) continue;
                    Integer variantId = cthd.getSanPhamBienThe().getId();
                    if (variantId == null) continue;
                    int required = cthd.getSoLuong() != null ? cthd.getSoLuong() : 0;
                    variantIdToRequiredQty.merge(variantId, required, Integer::sum);
                }

                // Kiểm tra tồn kho đủ
                List<org.example.graduationproject.models.SanPhamBienThe> toUpdate = new ArrayList<>();
                for (Map.Entry<Integer, Integer> entry : variantIdToRequiredQty.entrySet()) {
                    org.example.graduationproject.models.SanPhamBienThe variant = sanPhamBienTheRepository.findById(entry.getKey()).orElse(null);
                    if (variant == null) {
                        return false; // biến thể không tồn tại
                    }
                    int stock = variant.getSoLuongTon() != null ? variant.getSoLuongTon() : 0;
                    int need = entry.getValue() != null ? entry.getValue() : 0;
                    if (stock < need) {
                        return false; // không đủ hàng
                    }
                    variant.setSoLuongTon(stock - need);
                    toUpdate.add(variant);
                }

                // Cập nhật tồn kho
                if (!toUpdate.isEmpty()) {
                    sanPhamBienTheRepository.saveAll(toUpdate);
                }
            }

            hoaDon.setTrangThai(newStatus);
            
            // Cập nhật trường daLayTien khi trạng thái là COMPLETED
            if ("COMPLETED".equalsIgnoreCase(newStatus)) {
                hoaDon.setDaLayTien("YES");
            }
            
            hoaDonRepository.save(hoaDon);
            
            // Publish event cho Observer Pattern
            publishOrderStatusEvent(hoaDon, oldStatus, newStatus);
            
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public boolean updateOrderStatusAndRestoreStock(Integer orderId, String newStatus) {
        HoaDon hoaDon = hoaDonRepository.findById(orderId).orElse(null);
        if (hoaDon != null) {
            String currentStatus = hoaDon.getTrangThai();

            // Nếu chuyển từ CONFIRMED sang CANCELLED thì hoàn lại tồn kho
            if ("CONFIRMED".equalsIgnoreCase(currentStatus) && "CANCELLED".equalsIgnoreCase(newStatus)) {
                List<ChiTietHoaDon> chiTietList = chiTietHoaDonRepository.findByHoaDon(hoaDon);

                // Gom số lượng theo từng biến thể để hoàn lại tồn kho
                Map<Integer, Integer> variantIdToRestoreQty = new HashMap<>();
                for (ChiTietHoaDon cthd : chiTietList) {
                    if (cthd.getSanPhamBienThe() == null) continue;
                    Integer variantId = cthd.getSanPhamBienThe().getId();
                    if (variantId == null) continue;
                    int restore = cthd.getSoLuong() != null ? cthd.getSoLuong() : 0;
                    variantIdToRestoreQty.merge(variantId, restore, Integer::sum);
                }

                // Hoàn lại tồn kho
                List<org.example.graduationproject.models.SanPhamBienThe> toUpdate = new ArrayList<>();
                for (Map.Entry<Integer, Integer> entry : variantIdToRestoreQty.entrySet()) {
                    org.example.graduationproject.models.SanPhamBienThe variant = sanPhamBienTheRepository.findById(entry.getKey()).orElse(null);
                    if (variant != null) {
                        int stock = variant.getSoLuongTon() != null ? variant.getSoLuongTon() : 0;
                        int restore = entry.getValue() != null ? entry.getValue() : 0;
                        variant.setSoLuongTon(stock + restore);
                        toUpdate.add(variant);
                    }
                }

                // Cập nhật tồn kho

                if (!toUpdate.isEmpty()) {
                    sanPhamBienTheRepository.saveAll(toUpdate);
                }
            }

            String oldStatus = hoaDon.getTrangThai();
            hoaDon.setTrangThai(newStatus);
            
            // Cập nhật trường daLayTien khi trạng thái là COMPLETED
            if ("COMPLETED".equalsIgnoreCase(newStatus)) {
                hoaDon.setDaLayTien("YES");
            }
            
            hoaDonRepository.save(hoaDon);
            
            // Publish event cho Observer Pattern
            publishOrderStatusEvent(hoaDon, oldStatus, newStatus);
            
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public boolean cancelOrder(User user, Integer orderId) {
        HoaDon hoaDon = getUserOrderById(user, orderId);
        if (hoaDon != null && "PENDING".equals(hoaDon.getTrangThai())) {
            String oldStatus = hoaDon.getTrangThai();
            hoaDon.setTrangThai("CANCELLED");
            hoaDonRepository.save(hoaDon);
            
            // Publish event cho Observer Pattern
            publishOrderStatusEvent(hoaDon, oldStatus, "CANCELLED");
            
            return true;
        }
        return false;
    }

    @Override
    public HoaDon saveOrder(HoaDon hoaDon) {
        return hoaDonRepository.save(hoaDon);
    }
    
    /**
     * Publish event cho Observer Pattern khi order status thay đổi
     */
    private void publishOrderStatusEvent(HoaDon hoaDon, String oldStatus, String newStatus) {
        try {
            OrderStatusChangedEvent event = OrderStatusChangedEvent.builder()
                    .orderId(hoaDon.getId())
                    .oldStatus(oldStatus)
                    .newStatus(newStatus)
                    .customerEmail(hoaDon.getUser() != null ? hoaDon.getUser().getEmail() : null)
                    .customerName(hoaDon.getUser() != null ? hoaDon.getUser().getHoTen() : null)
                    .customerPhone(hoaDon.getUser() != null ? hoaDon.getUser().getSoDienThoai() : null)
                    .orderTotal(hoaDon.getTongTien())
                    .timestamp(java.time.LocalDateTime.now())
                    .changeReason("SYSTEM_UPDATE")
                    .build();
            
            orderEventPublisher.publishOrderStatusChanged(event);
            
        } catch (Exception e) {
            // Log error nhưng không throw exception để không ảnh hưởng đến business logic
            System.err.println("Error publishing order status event: " + e.getMessage());
        }
    }
}
