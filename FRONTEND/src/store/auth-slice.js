// Barrel re-export so that @/store/auth-slice resolves correctly
export {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
  setUser,
  default,
} from "./auth/index";
