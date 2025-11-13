import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockProduct } from '@/test/utils/test-utils'

// Mock axios before importing anything else
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '1' }),
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
}))

// Import component after mocking
import ProductDetail from '../ProductDetail'
import axios from 'axios'

describe('ProductDetail Component', () => {
  const user = userEvent.setup()

  // Setup trước mỗi test
  beforeEach(() => {
    vi.clearAllMocks()  // Xóa tất cả call history và reset state của tất cả mocks
    vi.mocked(axios.get).mockResolvedValue({ data: mockProduct }) // etup mock response cho axios.get trước mỗi test
    localStorage.clear() // Xóa tất cả data trong localStorage
  })

  // Cleanup sau mỗi test
  afterEach(() => {
    vi.clearAllMocks() // Cleanup mock state sau khi test hoàn thành
    localStorage.clear()  // Xóa localStorage sau test
  })


  // Test các trạng thái cơ bản mà component có thể có (success, loading, error)
  describe('Basic Functionality', () => {
    // khi API call thành công
    it('should render product information when loaded', async () => {
      render(<ProductDetail />)
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Test Product' })).toBeInTheDocument()
      })
      
      // Check price display
      expect(screen.getByText('90.000₫')).toBeInTheDocument() // Discounted price
      expect(screen.getByText('100.000₫')).toBeInTheDocument() // Original price
      expect(screen.getByText('-10%')).toBeInTheDocument() // Discount badge
    })

    // trước khi API call hoàn thành
    it('should show loading state initially', () => {
      render(<ProductDetail />)
      expect(screen.getByText('Đang tải...')).toBeInTheDocument()
    })


    //  khi API call thất bại
    it('should show error message when API fails', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('API Error'))
      
      render(<ProductDetail />)
      
      await waitFor(() => {
        expect(screen.getByText('Không thể tải chi tiết sản phẩm')).toBeInTheDocument()
      })
    })
  })

  // Đảm bảo options được hiển thị đúng, Đảm bảo user có thể select size/color, Đảm bảo UI thay đổi khi user chọn
  describe('Size and Color Selection', () => {


    // đảm bảo tất cả options được hiển thị
    it('should render size and color options', async () => {
      render(<ProductDetail />)
      
      await waitFor(() => {
        expect(screen.getByText('Chọn size')).toBeInTheDocument()
        expect(screen.getByText('Chọn màu sắc')).toBeInTheDocument()
      })
      
      // Check size options
      expect(screen.getByText('S')).toBeInTheDocument()
      expect(screen.getByText('M')).toBeInTheDocument()
      expect(screen.getByText('L')).toBeInTheDocument()
      
      // Check color options
      expect(screen.getByText('Đỏ')).toBeInTheDocument()
      expect(screen.getByText('Xanh')).toBeInTheDocument()
      expect(screen.getByText('Đen')).toBeInTheDocument()
    })


    // đảm bảo user có thể click và có visual feedback
    it('should allow selecting size and color', async () => {
      render(<ProductDetail />)
      
      await waitFor(() => {
        expect(screen.getByText('S')).toBeInTheDocument()
      })
      
      // Select size
      const sizeButton = screen.getByText('S')
      await user.click(sizeButton)
      expect(sizeButton).toHaveClass('border-primary', 'bg-primary', 'text-white')
      
      // Select color
      const colorButton = screen.getByText('Đỏ')
      await user.click(colorButton)
      expect(colorButton).toHaveClass('border-primary', 'bg-primary', 'text-white')
    })
  })


  // Kiểm tra logic hiển thị stock dựa trên size/color selection, Xử lý trường hợp hết hàng, Đảm bảo user được thông báo rõ ràng về tình trạng hàng
  describe('Stock Display', () => {

    // hiển thị stock khi user đã chọn đủ size và color
    it('should show stock information when size and color are selected', async () => {
      render(<ProductDetail />)
      
      await waitFor(() => {
        expect(screen.getByText('S')).toBeInTheDocument()
      })
      
      // Select size and color
      await user.click(screen.getByText('S'))
      await user.click(screen.getByText('Đỏ'))
      
      await waitFor(() => {
        expect(screen.getByText('Còn 10 sản phẩm')).toBeInTheDocument()
        expect(screen.getByText('Còn hàng')).toBeInTheDocument()
      })
    })


    // xử lý trường hợp hết hàng
    it('should show out of stock when selected variant has no stock', async () => {
      render(<ProductDetail />)
      
      await waitFor(() => {
        expect(screen.getByText('M')).toBeInTheDocument()
      })
      
      // Select size M and color Xanh (stock: 0)
      await user.click(screen.getByText('M'))
      await user.click(screen.getByText('Xanh'))
      
      await waitFor(() => {
        expect(screen.getByText('Hết hàng')).toBeInTheDocument()
      })
    })
  })

  // Kiểm tra buttons được enable/disable đúng logic, Đảm bảo user không thể mua khi chưa chọn size/color, Visual feedback rõ ràng về trạng thái buttons
  describe('Button States', () => {

    // buttons bị disable khi chưa chọn size/color
    it('should disable buttons when no selection made', async () => {
      render(<ProductDetail />)
      
      await waitFor(() => {
        expect(screen.getByText('Thêm vào giỏ hàng')).toBeInTheDocument()
      })
      
      const addToCartButton = screen.getByText('Thêm vào giỏ hàng')
      const buyNowButton = screen.getByText('Mua ngay')
      
      expect(addToCartButton).toBeDisabled()
      expect(buyNowButton).toBeDisabled()
    })


    // buttons được enable sau khi chọn đủ size/color
    it('should enable buttons when valid selection made', async () => {
      render(<ProductDetail />)
      
      await waitFor(() => {
        expect(screen.getByText('S')).toBeInTheDocument()
      })
      
      // Select size and color
      await user.click(screen.getByText('S'))
      await user.click(screen.getByText('Đỏ'))
      
      const addToCartButton = screen.getByText('Thêm vào giỏ hàng')
      const buyNowButton = screen.getByText('Mua ngay')
      
      expect(addToCartButton).not.toBeDisabled()
      expect(buyNowButton).not.toBeDisabled()
    })
  })


  // Kiểm tra user có thể tăng/giảm số lượng, Đảm bảo quantity không được dưới 1, Kiểm tra buttons được enable/disable đúng logic
  describe('Quantity Selection', () => {

    // user có thể tăng/giảm số lượng
    it('should allow increasing and decreasing quantity', async () => {
      render(<ProductDetail />)
      
      await waitFor(() => {
        expect(screen.getByText('S')).toBeInTheDocument()
      })
      
      // Select size and color first
      await user.click(screen.getByText('S'))
      await user.click(screen.getByText('Đỏ'))
      
      const increaseButton = screen.getByText('+')
      const decreaseButton = screen.getByText('-')
      
      // Test increasing quantity
      await user.click(increaseButton)
      expect(screen.getByText('2')).toBeInTheDocument()
      
      // Test decreasing quantity
      await user.click(decreaseButton)
      expect(screen.getByText('1')).toBeInTheDocument()
    })


    // quantity không được dưới 1
    it('should not allow quantity below 1', async () => {
      render(<ProductDetail />)
      
      await waitFor(() => {
        expect(screen.getByText('S')).toBeInTheDocument()
      })
      
      // Select size and color first
      await user.click(screen.getByText('S'))
      await user.click(screen.getByText('Đỏ'))
      
      const decreaseButton = screen.getByText('-')
      await user.click(decreaseButton)
      
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(decreaseButton).toBeDisabled()
    })
  })


  // Kiểm tra user được redirect đến checkout page
  describe('Buy Now Functionality', () => {
    it('should navigate to checkout when buy now is clicked', async () => {
      render(<ProductDetail />)
      
      await waitFor(() => {
        expect(screen.getByText('S')).toBeInTheDocument()
      })
      
      // Select size and color
      await user.click(screen.getByText('S'))
      await user.click(screen.getByText('Đỏ'))
      
      const buyNowButton = screen.getByText('Mua ngay')
      await user.click(buyNowButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/checkout')
    })
  })
})
