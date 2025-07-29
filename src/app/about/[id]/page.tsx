"use client";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
type Params = Promise<{ id: string }>;

export default function About(props: { params: Params }) {
  const router = useRouter();
  const [tagline, setTagline] = useState<string>("");
  const [about, setAbout] = useState<string>("");
  const [id, setId] = useState<string>(""); // State for error messages

  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      console.log(pid);
      setId(pid);
    };
    getIdFromParam();
  }, [props]);
  const [errors, setErrors] = useState({ tagline: false, about: false });

  const handleContinue = async () => {
    // Validation
    const hasErrors = {
      tagline: !tagline.trim(),
      about: !about.trim(),
    };

    setErrors(hasErrors);

    if (hasErrors.tagline || hasErrors.about) {
      return; // Stop submission if there are errors
    }

    try {
      const response = await fetch("/api/user/about", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pid: id, aboutme: about, tagline }),
      });

      if (response.ok) {
        router.push(`/plan/${id}`);
      } else {
        console.error("Error submitting form:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
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
            <Box>
              <Typography
                variant="body1"
                marginBottom={1}
                fontWeight="bold"
                sx={{ textAlign: "left", color: "#fff" }}
              >
                Tagline <span style={{ color: "#fff" }}>*</span>
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Tagline"
                variant="outlined"
                value={tagline}
                onChange={(e) => {
                  setTagline(e.target.value);
                  if (errors.tagline)
                    setErrors((prev) => ({ ...prev, tagline: false })); // Clear error on change
                }}
                error={errors.tagline}
                helperText={errors.tagline ? "Tagline is required." : ""}
                InputProps={{
                  style: {
                    backgroundColor: "#2e2e2e",
                    color: "#ffffff",
                  },
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="body1"
                marginBottom={1}
                fontWeight="bold"
                sx={{ textAlign: "left", color: "#fff", mt: 2 }}
              >
                About me <span style={{ color: "#fff" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="About me"
                variant="outlined"
                value={about}
                onChange={(e) => {
                  setAbout(e.target.value);
                  if (errors.about)
                    setErrors((prev) => ({ ...prev, about: false })); // Clear error on change
                }}
                error={errors.about}
                helperText={errors.about ? "About me is required." : ""}
                InputProps={{
                  style: {
                    backgroundColor: "#2e2e2e",
                    color: "#ffffff",
                  },
                }}
              />
            </Box>
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
                  mt: 2,
                  "&:hover": { backgroundColor: "#ad1457" },
                }}
                onClick={handleContinue}
              >
                <ArrowForwardIosIcon />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
