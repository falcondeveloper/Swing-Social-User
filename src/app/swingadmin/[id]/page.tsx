"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Typography,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";

// ✅ Declare valid swing options
type SwingOption = "Full Swap" | "Soft Swap" | "Voyeur";

type Params = Promise<{ id: string }>;

interface FormValues {
  swingstyle: Record<SwingOption, boolean>;
}

export default function Swing(props: { params: Params }) {
  const [id, setId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: string = params.id;
      setId(pid);
    };
    getIdFromParam();
  }, [props]);

  const swingOptions: SwingOption[] = ["Full Swap", "Soft Swap", "Voyeur"];

  const validationSchema = Yup.object().shape({
    swingstyle: Yup.object()
      .test(
        "at-least-one-checked",
        "Please select at least one option to continue.",
        (value) => value && Object.values(value).some((v) => v === true)
      )
      .required(),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      swingstyle: {
        "Full Swap": false,
        "Soft Swap": false,
        Voyeur: false,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch("/api/user/swing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pid: id, swingstyle: values.swingstyle }),
        });

        if (response.ok) {
          router.push(`/uploadadmin/${id}`);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    formik.setFieldValue("swingstyle", {
      ...formik.values.swingstyle,
      [name as SwingOption]: checked,
    });
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
      <form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          margin="auto"
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
              {swingOptions.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      name={option}
                      checked={formik.values.swingstyle[option]}
                      onChange={handleCheckboxChange}
                      sx={{
                        color: "#fff",
                        "&.Mui-checked": { color: "#c2185b" },
                      }}
                    />
                  }
                  label={option}
                  sx={{ color: "#fff" }}
                />
              ))}
              {formik.errors.swingstyle &&
                typeof formik.errors.swingstyle === "string" && (
                  <FormHelperText error>
                    {formik.errors.swingstyle}
                  </FormHelperText>
                )}
            </Box>
          </Grid>

          {/* Continue Button */}
          <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
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
              aria-label="Continue"
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
  );
}
