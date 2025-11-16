import { useSelector } from 'react-redux';

const useCurrentUser = () => {
  const user = useSelector((state) => state.auth.user);
  const loading = !user;
  
  return { 
    user, 
    loading,
    isAuthenticated: !!user && !user.isAnonymous
  };
};

export default useCurrentUser;
