"use client";
import React, { useState, Suspense, useEffect } from "react";
import { Box, Button, Grid, Checkbox, FormControlLabel, Typography } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter, useSearchParams } from "next/navigation";
type Params = Promise<{ id: string }>

export default function ShowInterest(props: { params: Params }) {

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

 
  const [interests, setInterests] = useState([]);

console.log(JSON.stringify(interests));
  const [error, setError] = useState(false);

  const handleCheckboxChange = (event:any) => {
    const { value, checked } = event.target;
  
    setInterests((prevInterests:any) => {
      if (checked) {
        // Add the interest if it's checked and not already in the array
        return prevInterests.includes(value) ? prevInterests : [...prevInterests, value];
      } else {
        // Remove the interest if it's unchecked
        return prevInterests.filter((interest:any) => interest !== value);
      }
    });
  
    // Clear error when a checkbox is checked
    if (error) setError(false);
  };
  

  const router = useRouter();

  const handleContinue = async () => {
    if (interests?.length>0) {
      setError(false); // Clear any previous error
      try {
        const response = await fetch("/api/user/looingfor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pid: id, interests }),
        });

        if (response.ok) {
          router.push(`/swing/${id}`);
        } else {
          console.error("Error submitting form:", response.statusText);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    } else {
      setError(true); // Set error when no checkbox is selected
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
            maxWidth: "400px",
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
              Interested in?
            </Typography>
            <Typography
              sx={{
                color: "#aaa",
                fontSize: "0.85rem",
                mt: 1,
              }}
            >
              What kind of play partners are you interested in?
            </Typography>
          </Grid>

          {/* Checkboxes */}
          <Grid item xs={12} sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
        Select your interests:
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            value={"Males"}
            name="male"
            onChange={handleCheckboxChange}
            sx={{
              color: "#fff",
              "&.Mui-checked": { color: "#c2185b" },
            }}
          />
        }
        label="Male"
        sx={{ color: "#fff" }}
      />
      <FormControlLabel
        control={
          <Checkbox
          value={"Females"}
            name="female"
            onChange={handleCheckboxChange}
            sx={{
              color: "#fff",
              "&.Mui-checked": { color: "#c2185b" },
            }}
          />
        }
        label="Female"
        sx={{ color: "#fff" }}
      />
      <FormControlLabel
        control={
          <Checkbox
          value={"Couples"}
            name="couple"
            onChange={handleCheckboxChange}
            sx={{
              color: "#fff",
              "&.Mui-checked": { color: "#c2185b" },
            }}
          />
        }
        label="Couple"
        sx={{ color: "#fff" }}
      />
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          Please select at least one option to continue.
        </Typography>
      )}
    </Box>
          </Grid>

          {/* Continue Button */}
          <Grid item xs={12} sx={{ alignItems: "center", textAlign: "center", mt: 4 }}>
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
    </Suspense>
  );
}
