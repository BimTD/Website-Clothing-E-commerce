package org.example.graduationproject.services;

import org.example.graduationproject.dto.ImportRequestDTO;
import org.example.graduationproject.dto.ServiceResult;

import java.util.Map;

public interface AdminImportService {
    
    /**
     * Lấy danh sách phiếu nhập hàng với filter và pagination
     */
    ServiceResult<Map<String, Object>> getImportsWithFilters(String search, int page, int size);
    
    /**
     * Tạo phiếu nhập hàng
     */
    ServiceResult<Map<String, Object>> createImport(ImportRequestDTO request);
    
    /**
     * Lấy chi tiết phiếu nhập hàng
     */
    ServiceResult<Map<String, Object>> getImportDetail(Integer importId);
    
    /**
     * Xóa phiếu nhập hàng
     */
    ServiceResult<Void> deleteImport(Integer importId);
    
    /**
     * Export phiếu nhập hàng ra Excel
     */
    ServiceResult<byte[]> exportImportToExcel(Integer importId);
    
    /**
     * Export phiếu nhập hàng ra PDF
     */
    ServiceResult<byte[]> exportImportToPdf(Integer importId);
}













