"use client";
import React, { useEffect, Suspense, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Typography,
  FormHelperText,
  FormGroup,
  CircularProgress,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";

type Params = Promise<{ id: string }>;

export default function ShowInterest(props: { params: Params }) {
  const [id, setId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      setId(pid);
    };
    getIdFromParam();
  }, [props]);

  const validationSchema = Yup.object().shape({
    interests: Yup.array()
      .min(1, "Please select at least one option to continue.")
      .of(Yup.string().required()),
  });

  const formik = useFormik({
    initialValues: {
      interests: [] as string[],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch("/api/user/lookingfor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pid: id, interests: values.interests }),
        });

        if (response.ok) {
          router.push(`/swingadmin/${id}`);
        } else {
          console.error("Error submitting form:", response.statusText);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      formik.setFieldValue("interests", [...formik.values.interests, value]);
    } else {
      formik.setFieldValue(
        "interests",
        formik.values.interests.filter((i) => i !== value)
      );
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
        <form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{
              backgroundColor: "#121212",
              borderRadius: "16px",
              maxWidth: "400px",
              margin: "0 auto",
              padding: "32px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Title */}
            <Grid item xs={12} sx={{ textAlign: "center", mb: 2 }}>
              <Typography
                variant="h5"
                sx={{ color: "#fff", fontWeight: "bold" }}
              >
                Interested in?
              </Typography>
              <Typography sx={{ color: "#aaa", fontSize: "0.85rem", mt: 1 }}>
                What kind of play partners are you interested in?
              </Typography>
            </Grid>

            {/* Checkboxes */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#fff", fontWeight: "bold" }}
                >
                  Select your interests:
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value="Males"
                        checked={formik.values.interests.includes("Males")}
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
                        value="Females"
                        checked={formik.values.interests.includes("Females")}
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
                        value="Couples"
                        checked={formik.values.interests.includes("Couples")}
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
                </FormGroup>
                {formik.errors.interests && formik.touched.interests && (
                  <FormHelperText error>
                    {formik.errors.interests}
                  </FormHelperText>
                )}
              </Box>
            </Grid>

            {/* Continue Button */}
            <Grid
              item
              xs={12}
              sx={{ alignItems: "center", textAlign: "center", mt: 4 }}
            >
              <Button
                type="submit"
                disabled={formik.isSubmitting}
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
              >
                {formik.isSubmitting ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  <ArrowForwardIosIcon />
                )}
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
        </form>
      </Box>
    </Suspense>
  );
}
