import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const yourTextFieldSx = {
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

const AffiliatePayment: React.FC = () => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [paymentInfo, setPaymentInfo] = React.useState({
    affiliateId: "",
    minThreshold: "$50",
    businessName: "",
    yourName: "",
    makePayableTo: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    city: "",
    state: "",
    postal: "",
    taxIndividual: { part1: "", part2: "", part3: "" },
    taxBusiness: { ein: "" },
    paymentEmail: "",
  });

  const handlePaymentChange = (field: string, value: any) => {
    setPaymentInfo((s) => ({ ...s, [field]: value }));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid rgba(255,255,255,0.04)",
        maxWidth: "900px",
        mx: "auto",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: { xs: 1.5, sm: 2 },
          fontSize: { xs: "1rem", sm: "1.125rem" },
        }}
      >
        Your Payment Information
      </Typography>

      <Typography variant="body2" sx={{ mb: 1 }}>
        Affiliate ID: <strong>{paymentInfo.affiliateId}</strong>
      </Typography>
      <Typography variant="body2" sx={{ mb: { xs: 1.5, sm: 2 } }}>
        Minimum Payment Threshold: <strong>{paymentInfo.minThreshold}</strong>
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Business Name (optional)"
            fullWidth
            value={paymentInfo.businessName}
            onChange={(e) =>
              handlePaymentChange("businessName", e.target.value)
            }
            sx={yourTextFieldSx}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Your Name"
            fullWidth
            value={paymentInfo.yourName}
            onChange={(e) => handlePaymentChange("yourName", e.target.value)}
            sx={yourTextFieldSx}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Make Payable to
          </Typography>
          <RadioGroup
            row={!isSm}
            value={paymentInfo.makePayableTo}
            onChange={(e) =>
              handlePaymentChange("makePayableTo", e.target.value)
            }
            sx={{
              flexDirection: isSm ? "column" : "row",
              gap: isSm ? 1 : 2,
            }}
          >
            <FormControlLabel
              value="business"
              control={<Radio />}
              label="Business Name"
            />
            <FormControlLabel
              value="your"
              control={<Radio />}
              label="Your Name"
            />
          </RadioGroup>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Email"
            fullWidth
            value={paymentInfo.email}
            onChange={(e) => handlePaymentChange("email", e.target.value)}
            sx={yourTextFieldSx}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Phone"
            fullWidth
            value={paymentInfo.phone}
            onChange={(e) => handlePaymentChange("phone", e.target.value)}
            sx={yourTextFieldSx}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Mailing Address"
            fullWidth
            value={paymentInfo.address}
            onChange={(e) => handlePaymentChange("address", e.target.value)}
            sx={yourTextFieldSx}
            multiline
            rows={isSm ? 2 : 1}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Country"
            fullWidth
            value={paymentInfo.country}
            onChange={(e) => handlePaymentChange("country", e.target.value)}
            sx={yourTextFieldSx}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="City"
            fullWidth
            value={paymentInfo.city}
            onChange={(e) => handlePaymentChange("city", e.target.value)}
            sx={yourTextFieldSx}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="State / Province"
            fullWidth
            value={paymentInfo.state}
            onChange={(e) => handlePaymentChange("state", e.target.value)}
            sx={yourTextFieldSx}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Zip / Postal Code"
            fullWidth
            value={paymentInfo.postal}
            onChange={(e) => handlePaymentChange("postal", e.target.value)}
            sx={yourTextFieldSx}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 2.5 },
              bgcolor: "transparent",
              borderColor: "rgba(255,255,255,0.04)",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 1, fontSize: { xs: 12, sm: 13 } }}
            >
              Tax ID: (only needed if payments are sent to US located
              individuals or businesses.)
            </Typography>

            <Grid container spacing={1} mt={2}>
              <Grid item xs={12} md={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  If you are an individual
                </Typography>

                <Stack
                  direction={isSm ? "column" : "row"}
                  spacing={1}
                  sx={{ mt: 1 }}
                >
                  <TextField
                    label="Part 1"
                    value={paymentInfo.taxIndividual.part1}
                    onChange={(e) =>
                      setPaymentInfo((s) => ({
                        ...s,
                        taxIndividual: {
                          ...s.taxIndividual,
                          part1: e.target.value,
                        },
                      }))
                    }
                    sx={yourTextFieldSx}
                  />
                  <TextField
                    label="Part 2"
                    value={paymentInfo.taxIndividual.part2}
                    onChange={(e) =>
                      setPaymentInfo((s) => ({
                        ...s,
                        taxIndividual: {
                          ...s.taxIndividual,
                          part2: e.target.value,
                        },
                      }))
                    }
                    sx={yourTextFieldSx}
                  />
                  <TextField
                    label="Part 3"
                    value={paymentInfo.taxIndividual.part3}
                    onChange={(e) =>
                      setPaymentInfo((s) => ({
                        ...s,
                        taxIndividual: {
                          ...s.taxIndividual,
                          part3: e.target.value,
                        },
                      }))
                    }
                    sx={yourTextFieldSx}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={12} mt={2}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  If you are a business
                </Typography>
                <TextField
                  label="EIN"
                  value={paymentInfo.taxBusiness.ein}
                  onChange={(e) =>
                    setPaymentInfo((s) => ({
                      ...s,
                      taxBusiness: { ein: e.target.value },
                    }))
                  }
                  sx={yourTextFieldSx}
                />
              </Grid>
            </Grid>

            <Typography
              variant="body2"
              sx={{
                mt: 2,
                fontSize: { xs: 12, sm: 13 },
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.5,
                whiteSpace: "pre-line",
                userSelect: "text",
              }}
            >
              {`Substitute W9: Under penalties of perjury I hereby certify that the Tax ID number shown above is my/our correct taxpayer identification number and that I am/we are not subject to backup withholding and that I am/we are a U.S. person (including a U.S. resident alien). I will inform you immediately if I become subject to backup withholding.`}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Payments are sent via email - Enter your email here"
            fullWidth
            value={paymentInfo.paymentEmail}
            onChange={(e) =>
              handlePaymentChange("paymentEmail", e.target.value)
            }
            sx={yourTextFieldSx}
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
            }}
          >
            <Button
              variant="outlined"
              sx={{
                textTransform: "none",
                width: { xs: "100%", sm: "auto" },
                px: { xs: 2, sm: 3 },
              }}
            >
              Request Payout
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AffiliatePayment;
