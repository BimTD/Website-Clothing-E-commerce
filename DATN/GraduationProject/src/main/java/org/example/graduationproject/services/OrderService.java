package org.example.graduationproject.services;

import org.example.graduationproject.dto.ServiceResult;
import org.example.graduationproject.models.HoaDon;

import java.util.List;

public interface OrderService {
    
    /**
     * Lấy danh sách đơn hàng của user hiện tại
     */
    ServiceResult<List<HoaDon>> getUserOrders();
    
    /**
     * Lấy chi tiết đơn hàng theo ID
     */
    ServiceResult<HoaDon> getOrderDetail(Integer orderId);
    
    /**
     * Hủy đơn hàng
     */
    ServiceResult<Void> cancelOrder(Integer orderId);
}






