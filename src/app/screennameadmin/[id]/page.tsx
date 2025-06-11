"use client";
import React, { useState, Suspense, useEffect } from "react";
import { Box, Grid, Button, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation'
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
type Params = Promise<{ id: string }>

export default function ScreenName(props: { params: Params }) {
  const router: any = useRouter();
  const [errors, setErrors] = useState<any>({}); // State for error messages
  const [id, setId] = useState<string>(''); // State for error messages
  const [username, setUsername] = useState<string>(""); // State for error messages
    const [email, setEmail] = useState<any>('');

  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      console.log(pid);
      setId(pid)
    }
    getIdFromParam();
   
  }, [props]);


  const handleContinue = async () => {
    const newErrors: any = {};
  
    if (!username) {
      newErrors.username = "Username is required";
      setErrors(newErrors);
      return;
    }
  
    try {
      // Check if the username exists
      const checkResponse = await fetch('/api/user/screenname/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search:username }), // Pass the username to check
      });
      localStorage.setItem('userName',username);
  
      const checkData = await checkResponse.json();
      
      if (checkData.exists) {
        // Username is already taken
        newErrors.username = "Username already taken";
        setErrors(newErrors);
        return;
      }
  
      // Proceed with submitting the username
      const response = await fetch('/api/user/screenname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pid: id, username }),
      });
  
      if (response.ok) {
        router.push(`/intrestedadmin/${id}`);
      } else {
        console.error('Error submitting username:', await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
      newErrors.username = "An error occurred. Please try again.";
    }
  
    setErrors(newErrors);
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
            maxWidth: "600px",
            padding: "32px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Grid item xs={8} sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{
                color: "#fff",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              Create a screen name
            </Typography>
            <TextField
              fullWidth
              label="Username"
              variant="filled"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!errors.username}
              helperText={errors.username}
              size="small"
              sx={{
                backgroundColor: "#2a2a2a",
                input: { color: "#fff" },
                mb: 2,
                borderRadius: "4px",
              }}
            />
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
                "&:hover": { backgroundColor: "#ad1457" },
              }}
              onClick={handleContinue}
            >
              <ArrowForwardIosIcon />
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
            <Typography
              sx={{ color: "#c2185b", fontWeight: "bold", fontSize: "1rem" }}
            >
              Come party with us
            </Typography>
            <Typography
              sx={{
                color: "#aaa",
                fontSize: "0.85rem",
                mt: 1,
              }}
            >
              {/* This text should arrive between 23s */}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Suspense>
  );
}
