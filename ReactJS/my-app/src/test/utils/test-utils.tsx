import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from '@/context/LanguageContext'
import { CartProvider } from '@/context/CartContext'

// Mock data for testing
export const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 100000,
  discount: 10,
  image: 'test-image.jpg',
  description: 'Test product description',
  sizes: [
    { id: 1, name: 'S' },
    { id: 2, name: 'M' },
    { id: 3, name: 'L' }
  ],
  colors: [
    { id: 1, name: 'Đỏ' },
    { id: 2, name: 'Xanh' },
    { id: 3, name: 'Đen' }
  ],
  variants: [
    { id: 1, sizeId: 1, colorId: 1, stock: 10 },
    { id: 2, sizeId: 1, colorId: 2, stock: 5 },
    { id: 3, sizeId: 2, colorId: 1, stock: 8 },
    { id: 4, sizeId: 2, colorId: 2, stock: 0 },
    { id: 5, sizeId: 3, colorId: 3, stock: 15 }
  ]
}

export const mockCartItem = {
  id: '1-S-Đỏ',
  productId: 1,
  productName: 'Test Product',
  productImage: 'test-image.jpg',
  size: 'S',
  color: 'Đỏ',
  price: 90000,
  quantity: 1,
  stock: 10
}

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }



