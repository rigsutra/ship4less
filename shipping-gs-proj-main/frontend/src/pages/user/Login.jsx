import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {
  createTheme,
  ThemeProvider,
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
  Link,
  Grid,
} from "@mui/material";
import { setToken, userExists } from "../../redux/reducer/auth";
import { useNavigate } from "react-router-dom";
import imageuse from "../../../src/assets/logomain1.png";

const baseUrl = import.meta.env.VITE_BASE_URL;

// Custom hook for input validation
const useInputValidation = (initialValue, validator) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);

  const changeHandler = (e) => {
    setValue(e.target.value);
    if (validator) {
      const validationError = validator(e.target.value);
      setError(validationError);
    }
  };

  return { value, error, changeHandler };
};

// Main Login Component
function Login() {
  const dispatch = useDispatch();
  const defaultTheme = createTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Input hooks
  const name = useInputValidation("");
  const username = useInputValidation("");
  const password = useInputValidation("");
  const email = useInputValidation("");

  // Toggle login/signup form
  const toggleLogin = () => setIsLogin((prev) => !prev);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Logging In...");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${baseUrl}/api/login`,
        { username: username.value, password: password.value },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const { success, user, message, role } = response.data;
      if (success) {
        dispatch(userExists(user));
        toast.success(message, { id: toastId });
        localStorage.setItem(
          "ship_token",
          JSON.stringify(response?.data?.token)
        );
        dispatch(setToken(response?.data?.token));
        navigate(role === "admin" ? "/admin-dashboard" : "/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Signing Up...");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${baseUrl}/api/signup`,
        {
          name: name.value,
          username: username.value,
          password: password.value,
          email: email.value,
          role: "user", // Assigning a default role
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const { success, message } = response.data;
      if (success) {
        toast.success(message, { id: toastId });
        toggleLogin(); // Switch to login after successful signup
      } else {
        toast.error("Signup failed", { id: toastId });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "background.default",
        }}
      >
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ width: { xs: "90%", sm: "70%", md: "50%", lg: "30%" } }}
        >
          <Paper elevation={6}>
            <Box
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={imageuse}
                alt="logo"
                style={{ width: "200px", height: "40px" }}
              />
              {/* <Avatar sx={{ m: 1, bgcolor: "secondary.main" }} /> */}
              {/* <Typography component="h1" variant="h5">
                {isLogin ? "Sign In" : "Sign Up"}
              </Typography> */}
              <Box
                component="form"
                noValidate
                sx={{ mt: 3 }}
                onSubmit={isLogin ? handleLogin : handleSignUp}
              >
                {!isLogin && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Name"
                    name="name"
                    autoFocus
                    value={name.value}
                    onChange={name.changeHandler}
                  />
                )}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoFocus={isLogin}
                  value={username.value}
                  onChange={username.changeHandler}
                />
                {username.error && (
                  <Typography color="error" variant="caption">
                    {username.error}
                  </Typography>
                )}
                {!isLogin && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    value={email.value}
                    onChange={email.changeHandler}
                  />
                )}
                {!isLogin && email.error && (
                  <Typography color="error" variant="caption">
                    {email.error}
                  </Typography>
                )}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password.value}
                  onChange={password.changeHandler}
                />
                {password.error && (
                  <Typography color="error" variant="caption">
                    {password.error}
                  </Typography>
                )}
                {isLogin && (
                  <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label="Remember me"
                  />
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                >
                  {isLogin ? "Sign In" : "Sign Up"}
                </Button>
                {isLogin && (
                  <Button
                    // fullWidth
                    justifyContent="left"
                    variant="text"
                    onClick={() => navigate("/forgot_password")}
                    sx={{ mb: 2 }}
                  >
                    Forgot Password?
                  </Button>
                )}
                <Grid container>
                  <Grid item>
                    <Link
                      disabled={isLoading}
                      onClick={toggleLogin}
                      style={{ cursor: "pointer" }}
                    >
                      {isLogin
                        ? "Don't have an account? Sign Up"
                        : "Already have an account? Sign In"}
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default Login;
