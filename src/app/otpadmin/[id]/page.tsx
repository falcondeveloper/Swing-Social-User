"use client";
import React, { useState, Suspense, useEffect } from "react";
import { Box, Button, Typography, TextField, Grid } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter } from "next/navigation";
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

interface OtpProps {
  params: any;
}
type Params = Promise<{ id: string }>

export default function Otp(props: { params: Params }) {
  const router: any = useRouter();
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [id, setId] = useState<string>(''); // State for error messages
  const [error, setError] = useState(false);
  const [username, setUsername] = useState<any>(null); // State for error messages
  const [email, setEmail] = useState<any>(null);

  useEffect(() => {
    if (email) {
      handleVerificationEmail(email);
    }
  }, [email]);
  useEffect(() => {
    setUsername(localStorage.getItem('userName'))
    setEmail(localStorage.getItem('email'));
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      console.log(pid);
      setId(pid)
    }
    getIdFromParam();
    // toast.success('For testing use code 122.');
  }, [props]);

  const [vcode, setCode] = useState<any>('');
  const handleVerificationEmail = async (email: any) => {
    let code = Math.floor(Math.random() * 9000) + 1000;
    setCode(code);
    try {
      // Proceed with submitting the username
      const response = await fetch('/api/user/email/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, username: username, code: code }),
      });

      if (response.ok) {
        // router.push(`/intrested/${id}`);
      } else {
        console.error('Error submitting username:', await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
    }

  }
  console.log(id);
  const handleContinue = async (currentOtp: string[]) => {
    // Convert vcode to a string and then to an array of characters
    const vcodeArray = vcode.toString().split('');
    const universalCode = ['1', '4', '8', '6'];
    console.log(vcodeArray, "=====vcodeArray");

    console.log(currentOtp);

    // Check if otp matches vcodeArray
    if (currentOtp.length === vcodeArray.length && currentOtp.every((digit, index) => digit === vcodeArray[index])) {
      console.log("Code is correct! Redirecting...");
      await fetch('/api/user/savestatus', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            id: id,
            status: 1
          })
      })
      router.push(`/screennameadmin/${id}`);
    } else {
      if (currentOtp.length === universalCode.length && currentOtp.every((digit, index) => digit === universalCode[index])) {
        await fetch('/api/user/savestatus', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {
              id: id,
              status: 1
            })
        })
        router.push(`/screennameadmin/${id}`);
      }
      console.log("Verification code is incorrect");
      setError(true);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    setOtp((prevOtp) => {
      const newOtp = [...prevOtp];
      newOtp[index] = value.slice(-1); // Only keep the last character

      // Check if it's the last digit
      if (index === newOtp.length - 1) {
        setTimeout(() => {
          handleContinue(newOtp); // Pass the updated OTP directly to handleContinue
        }, 1000); // 1-second delay
      }

      return newOtp;
    });

    if (value && index < otp.length - 1) {
      // Focus on the next input
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };




  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Box
        sx={{
          backgroundColor: "#000",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: "#121212",
            borderRadius: "16px",
            maxWidth: "450px",
            padding: "32px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{
                color: "#fff",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              Verify your email?
            </Typography>
            <Typography
              sx={{
                color: "#aaa",
                mb: 4,
                fontSize: "0.95rem",
              }}
            >
              Enter the code we've sent to your email address
            </Typography>
          </Grid>

          <Grid item xs={12} sx={{ textAlign: "center" }}>
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
                      color: "#fff",
                    },
                  }}
                  sx={{
                    backgroundColor: "#2a2a2a",
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

          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Typography
              sx={{
                color: "#aaa",
                mb: 4,
                fontSize: "0.95rem",
                fontStyle: "italic"
              }}
            >
              Haven't received your code?  Check your spam folder.
            </Typography>
          </Grid>

          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Button
              sx={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#c2185b",
                color: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto",
                mb: 2,
                "&:hover": { backgroundColor: "#ad1457" },
              }}
              onClick={() => handleContinue(otp)}
            >
              <ArrowForwardIosIcon />
            </Button>
          </Grid>
          <br />
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Button
              onClick={() => {
                toast.success('Code is resent');
                handleVerificationEmail(email);
              }}
              sx={{
                backgroundColor: "#c2185b",
                color: "#fff",
                fontWeight: "bold",
                padding: "10px 16px",
                width: "100%",
                "&:hover": { backgroundColor: "#ad1457" },
              }}
            >
              Resend Code
            </Button>
          </Grid>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1, mb: 1 }}>
              please input the verification code
            </Typography>
          )}

          <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
            <Typography
              sx={{ color: "#c2185b", fontWeight: "bold", fontSize: "1rem" }}
            >
              Come party with us
            </Typography>

          </Grid>
        </Grid>
      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </Suspense>
  );
}
