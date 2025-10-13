"use client";

import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";

interface ReferalFormProps {
  onSuccess?: (affiliateCode: string) => void;
}

const fieldSx = {
  mb: 2,
  "& .MuiOutlinedInput-root": {
    color: "white",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
} as const;

const phoneRegExp = /^[0-9]{10}$/;
const zipRegExp = /^[0-9A-Za-z\s-]{4,10}$/;
const nameRegExp = /^[A-Za-z\s'-]{2,40}$/;

const validationSchema = Yup.object().shape({
  organizationType: Yup.string().required(
    "Please select your organization type."
  ),
  companyName: Yup.string()
    .min(2, "Company name is too short.")
    .max(100, "Company name is too long.")
    .required("Company or group name is required."),
  firstName: Yup.string()
    .matches(nameRegExp, "Enter a valid first name.")
    .min(2, "First name must be at least 2 characters.")
    .required("First name is required."),
  lastName: Yup.string()
    .matches(nameRegExp, "Enter a valid last name.")
    .min(2, "Last name must be at least 2 characters.")
    .required("Last name is required."),
  email: Yup.string()
    .email("Enter a valid email address.")
    .required("Email is required."),
  mobilePhone: Yup.string()
    .transform((value) => value.replace(/\D/g, ""))
    .matches(phoneRegExp, "Enter a valid 10-digit phone number.")
    .required("Mobile phone number is required."),
  businessPhone: Yup.string()
    .transform((value) => (value ? value.replace(/\D/g, "") : value))
    .matches(phoneRegExp, "Enter a valid 10-digit business phone number.")
    .nullable(),
  address: Yup.string()
    .min(5, "Address must be at least 5 characters.")
    .required("Street address is required."),
  city: Yup.string()
    .matches(nameRegExp, "Enter a valid city name.")
    .required("City is required."),

  zip: Yup.string()
    .matches(zipRegExp, "Enter a valid ZIP or postal code.")
    .required("ZIP/Postal code is required."),
  country: Yup.string()
    .matches(nameRegExp, "Enter a valid country name.")
    .required("Country is required."),
  website: Yup.string().nullable(),
  whatsapp: Yup.string().nullable(),
  paymentMethod: Yup.string().required("Please select a payment method."),
  paypalEmail: Yup.string().when(
    "paymentMethod",
    (paymentMethod: unknown, schema) => {
      const method = paymentMethod as string;
      return method === "paypal"
        ? schema
            .email("Enter a valid PayPal email address.")
            .required("PayPal email is required.")
        : schema.notRequired();
    }
  ),

  agreeToTerms: Yup.boolean().oneOf(
    [true],
    "You must agree to the terms before submitting"
  ),
});

const ReferalForm: React.FC<ReferalFormProps> = ({ onSuccess }) => {
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tokenDevice = localStorage.getItem("loginInfo");
      if (tokenDevice) {
        const decodeToken = jwtDecode<any>(tokenDevice);
        setProfileId(decodeToken?.profileId);
      }
    }
  }, []);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.substring(0, 10);

    if (value.length > 6) {
      value = `(${value.substring(0, 3)}) ${value.substring(
        3,
        6
      )}-${value.substring(6)}`;
    } else if (value.length > 3) {
      value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    formik.setFieldValue("mobilePhone", value);
  };

  const handleBusinessPhoneChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.substring(0, 10);
    if (value.length > 6) {
      value = `(${value.substring(0, 3)}) ${value.substring(
        3,
        6
      )}-${value.substring(6)}`;
    } else if (value.length > 3) {
      value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    formik.setFieldValue("businessPhone", value);
  };

  const formik = useFormik({
    initialValues: {
      organizationType: "",
      companyName: "",
      firstName: "",
      lastName: "",
      email: "",
      mobilePhone: "",
      businessPhone: "",
      address: "",
      city: "",
      zip: "",
      country: "",
      website: "",
      whatsapp: "",
      paymentMethod: "paypal",
      paypalEmail: "",
      agreeToTerms: false,
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      console.log("🔥 onSubmit triggered with values:", values);
      try {
        const payload = { ...values, profileId };

        const res = await fetch("/api/user/affiliate-apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
          await Swal.fire({
            title: "Welcome to the Affiliate Program!",
            html: `
          <p>Your affiliate account has been created successfully.</p>
          ${
            data?.affiliateCode
              ? `<p><b>Your Affiliate Code:</b> ${data.affiliateCode}</p>`
              : ""
          }
          <p>You’ll be redirected to your dashboard shortly.</p>
        `,
            icon: "success",
            confirmButtonText: "Continue",
          });
          if (onSuccess && data?.affiliateCode) {
            onSuccess(data.affiliateCode);
          }
          resetForm();
        } else {
          const errorData = await res.json();
          await Swal.fire({
            title: "Submission failed",
            text: errorData.message || "Try again later.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#7000FF",
          });
        }
      } catch (err) {
        console.error("Affiliate apply error:", err);
        alert("Something went wrong. Please try again later.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <Box component="form" noValidate onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            maxWidth: "1000px",
            mx: "auto",
            bgcolor: "rgba(255,255,255,0.08)",
            borderRadius: "20px",
            p: { xs: 1, sm: 1, md: 2 },
            mb: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <Typography
            variant="h5"
            mb={3}
            fontWeight="bold"
            textAlign={"center"}
          >
            Affiliate Registration Form
          </Typography>
          <Box
            sx={{
              maxWidth: "1000px",
              mx: "auto",
              borderRadius: "20px",
              p: { xs: 1, sm: 1, md: 2 },
              mb: 8,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 0, sm: 0, md: 2 },
              }}
            >
              <TextField
                select
                fullWidth
                label="Organization Type *"
                name="organizationType"
                value={formik.values.organizationType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.organizationType &&
                  Boolean(formik.errors.organizationType)
                }
                helperText={
                  formik.touched.organizationType &&
                  formik.errors.organizationType
                }
                sx={fieldSx}
              >
                <MenuItem value="Licensed Travel Agency">
                  Licensed Travel Agency
                </MenuItem>
                <MenuItem value="Lifestyle Club">Lifestyle Club</MenuItem>
                <MenuItem value="Event Planner">Event Planner</MenuItem>
                <MenuItem value="Website">Website</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Company / Group Name *"
                name="companyName"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.companyName &&
                  Boolean(formik.errors.companyName)
                }
                helperText={
                  formik.touched.companyName && formik.errors.companyName
                }
                sx={fieldSx}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 0, sm: 0, md: 2 },
              }}
            >
              <TextField
                fullWidth
                label="First Name *"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
                margin="normal"
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="Last Name *"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
                margin="normal"
                sx={fieldSx}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 0, sm: 0, md: 2 },
              }}
            >
              <TextField
                fullWidth
                label="Email *"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                margin="normal"
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="Mobile Phone *"
                name="mobilePhone"
                value={formik.values.mobilePhone}
                onChange={handlePhoneChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.mobilePhone &&
                  Boolean(formik.errors.mobilePhone)
                }
                helperText={
                  formik.touched.mobilePhone && formik.errors.mobilePhone
                }
                margin="normal"
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="Business Phone"
                name="businessPhone"
                value={formik.values.businessPhone}
                onChange={handleBusinessPhoneChange}
                onBlur={formik.handleBlur}
                margin="normal"
                sx={fieldSx}
              />
            </Box>

            <TextField
              fullWidth
              label="Street Address *"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
              margin="normal"
              sx={fieldSx}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 0, sm: 0, md: 2 },
              }}
            >
              <TextField
                label="City *"
                name="city"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
                margin="normal"
                sx={fieldSx}
              />

              <TextField
                fullWidth
                label="Country *"
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.country && Boolean(formik.errors.country)}
                helperText={formik.touched.country && formik.errors.country}
                margin="normal"
                sx={fieldSx}
              />

              <TextField
                label="Zip *"
                name="zip"
                value={formik.values.zip}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.zip && Boolean(formik.errors.zip)}
                helperText={formik.touched.zip && formik.errors.zip}
                margin="normal"
                sx={fieldSx}
              />
            </Box>

            <TextField
              fullWidth
              label="Website"
              name="website"
              value={formik.values.website}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              margin="normal"
              sx={fieldSx}
            />

            <TextField
              select
              fullWidth
              label="Payment Method *"
              name="paymentMethod"
              value={formik.values.paymentMethod}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.paymentMethod &&
                Boolean(formik.errors.paymentMethod)
              }
              helperText={
                formik.touched.paymentMethod && formik.errors.paymentMethod
              }
              margin="normal"
              sx={fieldSx}
            >
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="ach">ACH / Bank Transfer</MenuItem>
            </TextField>

            {formik.values.paymentMethod === "paypal" && (
              <TextField
                fullWidth
                label="PayPal Email *"
                name="paypalEmail"
                value={formik.values.paypalEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.paypalEmail &&
                  Boolean(formik.errors.paypalEmail)
                }
                helperText={
                  formik.touched.paypalEmail && formik.errors.paypalEmail
                }
                margin="normal"
                sx={fieldSx}
              />
            )}

            <FormControlLabel
              control={
                <Checkbox
                  name="agreeToTerms"
                  checked={formik.values.agreeToTerms}
                  onChange={formik.handleChange}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{" "}
                  <a
                    href="/affiliate/terms"
                    target="_blank"
                    style={{ color: "#FF2D55" }}
                  >
                    Terms of Service
                  </a>
                </Typography>
              }
            />
            {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
              <Typography color="error" variant="caption">
                {formik.errors.agreeToTerms}
              </Typography>
            )}

            <Box
              sx={{
                mt: 4,
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                color="primary.main"
              >
                What Happens Next?
              </Typography>

              <Typography
                variant="body2"
                sx={{ mb: 2, color: "rgba(255,255,255,0.85)" }}
              >
                After you submit your application, our team will review your
                details to ensure everything is complete and accurate.
              </Typography>

              <Typography
                variant="body2"
                sx={{ mb: 2, color: "rgba(255,255,255,0.85)" }}
              >
                Once your application has been reviewed, you’ll be{" "}
                <strong>notified via the email address and phone number</strong>{" "}
                you provided. If your application is accepted, you’ll receive
                the <strong>Swing Social Affiliate Agreement</strong>{" "}
                electronically for signature.
              </Typography>

              <Typography
                variant="body2"
                sx={{ mb: 2, color: "rgba(255,255,255,0.85)" }}
              >
                After signing, we’ll create your{" "}
                <strong>unique affiliate code</strong> and personalized{" "}
                <strong>landing page</strong> for your promotions. You can share
                these links to earn commissions — all sales will be tracked
                automatically to your account.
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.85)" }}
              >
                If you’d like to review the full affiliate agreement before
                approval, please{" "}
                <a
                  href="/affiliate/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#FF2D55", textDecoration: "underline" }}
                >
                  click here
                </a>
                . (Please don’t sign this version.)
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              disabled={formik.isSubmitting}
              variant="contained"
              sx={{
                mt: 3,
                py: 1.4,
                borderRadius: "30px",
                background: "linear-gradient(90deg,#7000FF,#FF2D55)",
                fontWeight: "bold",
              }}
            >
              {formik.isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ReferalForm;
