"use client";
import React, { useState, useEffect, Suspense } from "react";
import {
  Box,
  Grid,
  Button,
  TextField,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/navigation";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useFormik } from "formik";
import * as Yup from "yup";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type Params = Promise<{ id: string }>;

export default function ScreenName(props: { params: Params }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      setId(params.id);
    };
    getIdFromParam();
  }, [props]);

  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .test("checkUsername", "Username already taken", async function (value) {
        if (!value) return false;
        try {
          const res = await fetch("/api/user/screenname/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search: value }),
          });
          const data = await res.json();
          return !data.exists;
        } catch (err) {
          return this.createError({ message: "Error checking username" });
        }
      }),
  });

  const formik = useFormik({
    initialValues: { username: "" },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        localStorage.setItem("userName", values.username);
        const response = await fetch("/api/user/screenname", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pid: id, username: values.username }),
        });

        if (response.ok) {
          router.push(`/intrestedadmin/${id}`);
        } else {
          console.error("Error submitting username:", await response.text());
        }
      } catch (err) {
        console.error("Submit error:", err);
      }
      setLoading(false);
    },
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Box
        sx={{
          backgroundColor: "#000",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: "#121212",
            borderRadius: "16px",
            width: "100%",
            maxWidth: 500,
            p: { xs: 3, sm: 4 },
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Button
              onClick={() => router.back()}
              startIcon={<ArrowBackIcon />}
              sx={{
                color: "#fff",
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#2e2e2e",
                },
              }}
            >
              Back
            </Button>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                color: "#fff",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              Create a screen name
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                variant="filled"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.username && Boolean(formik.errors.username)
                }
                helperText={formik.touched.username && formik.errors.username}
                size="small"
                sx={{
                  backgroundColor: "#2a2a2a",
                  input: { color: "#fff" },
                  mb: 3,
                  borderRadius: "4px",
                }}
              />

              <Button
                type="submit"
                disabled={loading}
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "#c2185b",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mx: "auto",
                  "&:hover": { backgroundColor: "#ad1457" },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  <ArrowForwardIosIcon />
                )}
              </Button>
            </form>
          </Grid>

          <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#c2185b",
                fontWeight: "bold",
              }}
            >
              Come party with us
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Suspense>
  );
}
