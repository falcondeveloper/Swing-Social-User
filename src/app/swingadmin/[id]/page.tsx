"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter } from "next/navigation";
type Params = Promise<{ id: string }>

export default function Swing(props: { params: Params }) {
  const [interests, setInterests] = useState<any>({
    "Full Swap": false,
    "Soft Swap": false,
    "Voyeur": false,
  });

  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      console.log(pid);
      setId(pid)
    }
    getIdFromParam();
  }, [props]);

  const [error, setError] = useState(false);

  const handleCheckboxChange = (event: any) => {
    const { name, checked } = event.target;
    setInterests((prev: any) => ({
      ...prev,
      [name]: checked,
    }));
    if (error) setError(false); // Clear error when a checkbox is checked
  };
  const [id, setId] = useState<string>(''); // State for error messages
  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      console.log(pid);
      setId(pid)
    }
    getIdFromParam();
  }, [props]);

  const router = useRouter();
  const handleContinue = async() => {
    const selected = Object.values(interests).some((value) => value);
    if (!selected) {
      setError(true);
      return;
    }
    try {
      const response = await fetch('/api/user/swing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pid: id, swingstyle:interests
         }),
      });
      if (response.ok) {
        router.push(`/uploadadmin/${id}`);
      }
    }
    catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#000",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 3,
      }}
    >
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundColor: "#121212",
          borderRadius: "16px",
          maxWidth: "400px",
          width: "100%",
          padding: "32px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Title */}
        <Grid item xs={12} sx={{ textAlign: "center", mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Swing Style
          </Typography>
          <Typography
            sx={{
              color: "#aaa",
              fontSize: "0.85rem",
              mt: 1,
            }}
          >
            How do you swing?
          </Typography>
        </Grid>

        {/* Checkboxes */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              gap: 1,
            }}
          >
            {Object.keys(interests).map((key) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    name={key}
                    checked={interests[key]}
                    onChange={handleCheckboxChange}
                    sx={{
                      color: "#fff",
                      "&.Mui-checked": { color: "#c2185b" },
                    }}
                  />
                }
                label={key}
                sx={{ color: "#fff" }}
              />
            ))}
             {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          Please select at least one option to continue.
        </Typography>
      )}
          </Box>
        </Grid>

        {/* Continue Button */}
        <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
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
              "&:hover": { backgroundColor: "#ad1457" },
            }}
            onClick={handleContinue}
            aria-label="Continue"
          >
            <ArrowForwardIosIcon />
          </Button>
        </Grid>

        {/* Footer */}
        <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
          <Typography
            sx={{ color: "#c2185b", fontWeight: "bold", fontSize: "1rem" }}
          >
            Come party with us
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
