"use client";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Carousel from "@/commonPage/Carousel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type Params = Promise<{ id: string }>;

export default function About(props: { params: Params }) {
  const router = useRouter();
  const [id, setId] = useState<string>("");

  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      setId(pid);
    };
    getIdFromParam();
  }, [props]);

  const validationSchema = Yup.object({
    tagline: Yup.string().required("Tagline is required."),
    about: Yup.string().required("About me is required."),
  });

  const formik = useFormik({
    initialValues: {
      tagline: "",
      about: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch("/api/user/about", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pid: id,
            aboutme: values.about,
            tagline: values.tagline,
          }),
        });

        if (response.ok) {
          router.push(`/plan/${id}`);
        } else {
          console.error("Error submitting form:", response.statusText);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  return (
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
          padding: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Grid item xs={12}>
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
          <form onSubmit={formik.handleSubmit}>
            {/* Tagline Instructions */}
            <Box sx={{ color: "#fff", mb: 2 }}>
              <Typography variant="body2">
                Enter a short tagline other users can see when swiping through
                pics.
              </Typography>
              {/* <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                <li style={{ marginBottom: "5px" }}>New to the Lifestyle</li>
                <li style={{ marginBottom: "5px" }}>We love Dancing</li>
                <li>We love 3sums!</li>
              </ul> */}
            </Box>

            {/* Tagline Field */}
            <Typography
              variant="body1"
              fontWeight="bold"
              sx={{ color: "#fff", textAlign: "left" }}
            >
              Tagline <span style={{ color: "#fff" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Enter your tagline"
              variant="outlined"
              name="tagline"
              value={formik.values.tagline}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.tagline && Boolean(formik.errors.tagline)}
              helperText={formik.touched.tagline && formik.errors.tagline}
              sx={{ mt: 1, mb: 3 }}
              InputProps={{
                style: {
                  backgroundColor: "#2e2e2e",
                  color: "#ffffff",
                },
              }}
            />

            {/* About Instructions */}
            <Typography variant="body2" sx={{ color: "#fff", mb: 1 }}>
              Enter a short description about yourself or yourselves, such as
              <em>
                {" "}
                "We love boating and camping on the weekends and speed
                dating..."
              </em>
            </Typography>

            {/* About Field */}
            <Typography
              variant="body1"
              fontWeight="bold"
              sx={{ color: "#fff", textAlign: "left" }}
            >
              About <span style={{ color: "#fff" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write about yourself"
              variant="outlined"
              name="about"
              value={formik.values.about}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.about && Boolean(formik.errors.about)}
              helperText={formik.touched.about && formik.errors.about}
              sx={{ mt: 1 }}
              InputProps={{
                style: {
                  backgroundColor: "#2e2e2e",
                  color: "#ffffff",
                },
              }}
            />

            {/* Continue Button */}
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Button
                type="submit"
                disabled={formik.isSubmitting}
                sx={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#e91e63",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "0 auto",
                  mt: 3,
                  "&:hover": { backgroundColor: "#d81b60" },
                }}
              >
                {formik.isSubmitting ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  <ArrowForwardIosIcon />
                )}
              </Button>
            </Grid>
          </form>
        </Grid>
        <Carousel title="This is the last screen!" />
      </Grid>
    </Box>
  );
}
