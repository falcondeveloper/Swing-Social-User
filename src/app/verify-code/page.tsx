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
  CircularProgress,
  Grid,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { Password } from "@mui/icons-material";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const OtpLoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [vcode, setCode] = useState<any>("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }

    const savedOtp = sessionStorage.getItem("loginOtp") || "";
    setCode(savedOtp);
  }, [searchParams]);

  const handleOtpChange = (value: string, index: number) => {
    setOtp((prevOtp) => {
      const newOtp = [...prevOtp];
      newOtp[index] = value.slice(-1);

      return newOtp;
    });

    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`
      ) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(
        `otp-${index - 1}`
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const checkEmailAndLogin = async (email: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/loginWithOutPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.status === 200) {
        sessionStorage.removeItem("loginOtp");
        localStorage.setItem("loginInfo", data.jwtToken);
        localStorage.setItem("logged_in_profile", data.currentProfileId);
        localStorage.setItem("profileUsername", data.currentuserName);
        localStorage.setItem("memberalarm", data.memberAlarm);
        localStorage.setItem("memberShip", data.memberShip);
        router.push("/home");
      } else {
        console.error(data.message);
        setDialogMessage(data.message);
        setDialogOpen(true);
      }
    } catch (err) {
      console.error(err);
      setDialogMessage("Something went wrong. Please try again.");
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (currentOtp: string[]) => {
    setLoading(true);

    const enteredCode = currentOtp.join("");
    const storedCode = vcode.toString();

    if (enteredCode === storedCode) {
      Swal.fire({
        title: "✅ OTP Verified!",
        text: "You have successfully logged in.",
        icon: "success",
        confirmButtonText: "Continue",
        allowOutsideClick: false,
      }).then(() => {
        checkEmailAndLogin(email);
      });
    } else {
      console.log("Verification code is incorrect");
      setDialogMessage("The OTP you entered is incorrect. Please try again.");
      setDialogOpen(true);
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
            p: 4,
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
            Login with Email OTP
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

          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, color: "text.secondary" }}
            >
              Enter the 4-digit code sent to your email
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mb: 4,
              }}
            >
              {otp.map((digit, index) => (
                <TextField
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  onChange={(e: any) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e: any) => handleKeyDown(e, index)}
                  inputProps={{
                    maxLength: 1,
                    style: {
                      textAlign: "center",
                      fontSize: "1.5rem",
                      padding: "10px",
                      color: "black",
                    },
                  }}
                  sx={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    "& .MuiInputBase-input": {
                      padding: "0",
                    },
                  }}
                />
              ))}
            </Box>
          </Grid>

          <Button
            fullWidth
            variant="contained"
            onClick={() => handleContinue(otp)}
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
              "Login"
            )}
          </Button>
        </Paper>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Login Failed</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

const EmailOtpLogin = () => {
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
      <OtpLoginContent />
    </Suspense>
  );
};

export default EmailOtpLogin;
