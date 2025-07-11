"use client";
import React, { useState, useEffect, Suspense } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { Password, Visibility, VisibilityOff } from "@mui/icons-material";

interface ValidationState {
  error: boolean;
  message: string;
}

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState<ValidationState>(
    { error: false, message: "" }
  );
  const [confirmPasswordValidation, setConfirmPasswordValidation] =
    useState<ValidationState>({ error: false, message: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const validatePassword = (value: string = password) => {
    if (!value) {
      setPasswordValidation({
        error: true,
        message: "Password is required",
      });
      return false;
    }
    setPasswordValidation({ error: false, message: "" });
    return true;
  };

  const validateConfirmPassword = (value: string = confirmPassword) => {
    if (!value) {
      setConfirmPasswordValidation({
        error: true,
        message: "Confirm Password is required",
      });
      return false;
    }
    if (password !== value) {
      setConfirmPasswordValidation({
        error: true,
        message: "Passwords do not match",
      });
      return false;
    }
    setConfirmPasswordValidation({ error: false, message: "" });
    return true;
  };

  const handleSubmit = async () => {
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/user/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: email,
          pwd: password,
        }),
      });

      const data = await response.json();
      setDialogMessage(data.message);
      setDialogOpen(true);

      if (response.ok) {
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (error) {
      setDialogMessage("An error occurred while resetting your password.");
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            background: "white",
            borderRadius: 2,
          }}
        >
          <Password sx={{ fontSize: 48, color: "#FF2D55", mb: 2 }} />
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Reset Your Password
          </Typography>

          <TextField
            fullWidth
            label="Email"
            value={email}
            disabled
            sx={{
              mb: 2,
              "& .MuiInputLabel-root": { color: "black !important" },
              "& .MuiOutlinedInput-root": { color: "black" },
            }}
          />

          <TextField
            fullWidth
            label="New Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
              validateConfirmPassword(confirmPassword);
            }}
            onBlur={() => validatePassword(password)}
            error={passwordValidation.error}
            helperText={passwordValidation.message}
            sx={{
              mb: 2,
              "& .MuiInputLabel-root": { color: "black !important" },
              "& .MuiOutlinedInput-root": { color: "black" },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              validateConfirmPassword(e.target.value);
            }}
            onBlur={() => validateConfirmPassword(confirmPassword)}
            error={confirmPasswordValidation.error}
            helperText={confirmPasswordValidation.message}
            sx={{
              mb: 3,
              "& .MuiInputLabel-root": { color: "black !important" },
              "& .MuiOutlinedInput-root": { color: "black" },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              background: "linear-gradient(45deg, #FF2D55, #7000FF)",
              py: 1.5,
              color: "white",
              "&:hover": {
                background: "linear-gradient(45deg, #FF2D55, #7000FF)",
                opacity: 0.9,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Reset Password"
            )}
          </Button>
        </Paper>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Password Reset</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        {/* <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions> */}
      </Dialog>
    </Container>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <Container
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Container>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
