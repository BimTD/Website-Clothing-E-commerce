import { useAuth as useAuthContext } from '@/context/AuthContext';


// Hook quản lý authentication state
export const useAuth = () => {
  return useAuthContext();
};