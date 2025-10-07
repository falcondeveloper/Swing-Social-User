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
import React, { memo, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

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

const phoneRegExp = /^[0-9]{7,15}$/;
const zipRegExp = /^[0-9A-Za-z\s-]{4,10}$/;
const websiteRegExp = /^(https?:\/\/)?([\w\d-]+\.){1,2}[\w-]+(\/[^\s]*)?$/i;
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
    .matches(phoneRegExp, "Enter a valid phone number (7–15 digits).")
    .required("Mobile phone number is required."),
  businessPhone: Yup.string()
    .matches(phoneRegExp, "Enter a valid business phone number.")
    .nullable()
    .notRequired(),
  address: Yup.string()
    .min(5, "Address must be at least 5 characters.")
    .required("Street address is required."),
  city: Yup.string()
    .matches(nameRegExp, "Enter a valid city name.")
    .required("City is required."),
  state: Yup.string()
    .matches(nameRegExp, "Enter a valid state/region name.")
    .required("State/Region is required."),
  zip: Yup.string()
    .matches(zipRegExp, "Enter a valid ZIP or postal code.")
    .required("ZIP/Postal code is required."),
  country: Yup.string()
    .matches(nameRegExp, "Enter a valid country name.")
    .required("Country is required."),
  website: Yup.string()
    .matches(websiteRegExp, "Enter a valid website URL.")
    .nullable()
    .notRequired(),
  whatsapp: Yup.string()
    .matches(phoneRegExp, "Enter a valid WhatsApp number.")
    .nullable()
    .notRequired(),
  paymentMethod: Yup.string().required("Please select a payment method."),
  paypalEmail: Yup.string().when(
    "paymentMethod",
    (paymentMethod: unknown, schema) => {
      const method = paymentMethod as string;
      return method === "paypal"
        ? schema
            .email("Enter a valid PayPal email address.")
            .required("PayPal email is required for PayPal payments.")
        : schema.notRequired();
    }
  ),
  agreeToTerms: Yup.boolean().oneOf(
    [true],
    "You must agree to the terms before submitting."
  ),
});

const ReferalForm = () => {
  return (
    <>
      <Formik
        initialValues={{
          organizationType: "",
          companyName: "",
          firstName: "",
          lastName: "",
          email: "",
          mobilePhone: "",
          businessPhone: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          country: "",
          website: "",
          whatsapp: "",
          paymentMethod: "paypal",
          paypalEmail: "",
          agreeToTerms: false,
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          const res = await fetch("/api/affiliate/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          if (res.ok) alert("Application submitted. Pending admin review.");
          else alert("Something went wrong. Try again later.");
          resetForm();
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Box
              sx={{
                maxWidth: "1000px",
                mx: "auto",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: "20px",
                p: { xs: 2, sm: 2, md: 4 },
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
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 0, sm: 0, md: 2 },
                }}
              >
                <TextField
                  fullWidth
                  select
                  label="Organization Type *"
                  name="organizationType"
                  value={values.organizationType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.organizationType && Boolean(errors.organizationType)
                  }
                  helperText={
                    touched.organizationType && errors.organizationType
                  }
                  margin="normal"
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
                  value={values.companyName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.companyName && Boolean(errors.companyName)}
                  helperText={touched.companyName && errors.companyName}
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
                  label="First Name *"
                  name="firstName"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstName && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  margin="normal"
                  sx={fieldSx}
                />
                <TextField
                  fullWidth
                  label="Last Name *"
                  name="lastName"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
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
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  margin="normal"
                  sx={fieldSx}
                />
                <TextField
                  fullWidth
                  label="Mobile Phone *"
                  name="mobilePhone"
                  value={values.mobilePhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.mobilePhone && Boolean(errors.mobilePhone)}
                  helperText={touched.mobilePhone && errors.mobilePhone}
                  margin="normal"
                  sx={fieldSx}
                />
                <TextField
                  fullWidth
                  label="Business Phone"
                  name="businessPhone"
                  value={values.businessPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  margin="normal"
                  sx={fieldSx}
                />
              </Box>

              <TextField
                fullWidth
                label="Street Address *"
                name="address"
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address}
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
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.city && Boolean(errors.city)}
                  helperText={touched.city && errors.city}
                  margin="normal"
                  sx={fieldSx}
                />

                <TextField
                  fullWidth
                  label="Country *"
                  name="country"
                  value={values.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.country && Boolean(errors.country)}
                  helperText={touched.country && errors.country}
                  margin="normal"
                  sx={fieldSx}
                />

                <TextField
                  label="Zip *"
                  name="zip"
                  value={values.zip}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.zip && Boolean(errors.zip)}
                  helperText={touched.zip && errors.zip}
                  margin="normal"
                  sx={fieldSx}
                />
              </Box>

              <TextField
                fullWidth
                label="Website"
                name="website"
                value={values.website}
                onChange={handleChange}
                onBlur={handleBlur}
                margin="normal"
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="WhatsApp"
                name="whatsapp"
                value={values.whatsapp}
                onChange={handleChange}
                onBlur={handleBlur}
                margin="normal"
                sx={fieldSx}
              />
              <TextField
                select
                fullWidth
                label="Payment Method *"
                name="paymentMethod"
                value={values.paymentMethod}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.paymentMethod && Boolean(errors.paymentMethod)}
                helperText={touched.paymentMethod && errors.paymentMethod}
                margin="normal"
                sx={fieldSx}
              >
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="ach">ACH / Bank Transfer</MenuItem>
              </TextField>

              {values.paymentMethod === "paypal" && (
                <TextField
                  fullWidth
                  label="PayPal Email *"
                  name="paypalEmail"
                  value={values.paypalEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.paypalEmail && Boolean(errors.paypalEmail)}
                  helperText={touched.paypalEmail && errors.paypalEmail}
                  margin="normal"
                  sx={fieldSx}
                />
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeToTerms"
                    checked={values.agreeToTerms}
                    onChange={handleChange}
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
              {touched.agreeToTerms && errors.agreeToTerms && (
                <Typography color="error" variant="caption">
                  {errors.agreeToTerms}
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
                  <strong>
                    notified via the email address and phone number
                  </strong>{" "}
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
                  <strong>landing page</strong> for your promotions. You can
                  share these links to earn commissions — all sales will be
                  tracked automatically to your account.
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
                disabled={isSubmitting}
                variant="contained"
                sx={{
                  mt: 3,
                  py: 1.4,
                  borderRadius: "30px",
                  background: "linear-gradient(90deg,#7000FF,#FF2D55)",
                  fontWeight: "bold",
                }}
              >
                Submit Application
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default ReferalForm;
