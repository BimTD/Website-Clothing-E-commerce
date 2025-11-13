export const API_BASE_URL = 'http://localhost:8080/api';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/home',
  UNAUTHORIZED: '/unauthorized',
  SHOP: '/shop',
  NEWS: '/news',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRODUCT_DETAIL: '/product',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order-success',
  ORDERS: '/orders',
  ORDER_DETAIL: '/order-detail',
  ADMIN: '/admin',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_BRANDS: '/admin/brands',
  ADMIN_SUPPLIERS: '/admin/suppliers',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_SIZES: '/admin/sizes',
  ADMIN_COLORS: '/admin/colors',
  ADMIN_VARIANTS: '/admin/variants',
  ADMIN_IMPORTS: '/admin/imports',
  ADMIN_INVOICES: '/admin/invoices'
} as const;

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER'
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_info'
} as const;

// Constants và configuration