"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Button,
  Box,
  ThemeProvider,
  createTheme,
  Autocomplete,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const theme = createTheme({
  palette: {
    primary: {
      main: "#E91E63", // Setting the main color to #E91E63
    },
  },
});

// Define the form's data structure using a TypeScript interface
interface FormData {
  firstName: string;
  lastName: string;
  screenName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  membershipOption: string;
  cardNumber: string;
  expDate: string;
  cvv: string;
  promoCode: string;
}
interface UserProfile {
  Id: any;
  Username: any;
}

const BillingUpgrade: any = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    qstreetAddress: "",
    qzipCode: "",
    qcity: "",
    qcountry: "",
    phone: "",
  });
  const [eventName, setEventName] = useState<string>("");
  const [ticketQuantity, setTicketQuantity] = useState<any>(0);
  const [ticketPrice, setTicketPrice] = useState<string>("");
  const [ticketName, setTicketName] = useState<string>("");
  const [ticketType, setTicketType] = useState<string>("");
  const [eventId, setEventId] = useState<string>("");
  const [storedEventDetails, setStoredEventDetails] = useState<any>([]);
  const [eventDetails, setEventDetails] = useState<any[]>([]);
  const [eventDescription, setEventDescription] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTicketEmail = async (x: any) => {
    const template = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h1 style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">${
                x == "1"
                  ? "Ticket Purchase Successful"
                  : "Sorry, we were unable to process your card request"
              }</h1>
              <p style="margin: 5px 0;"><strong>Event:</strong> ${eventName}</p>
              
              ${
                eventDescription
                  ? `
              <h1 style="font-weight: bold; font-size: 18px; margin: 20px 0 10px;">Event Description</h1>
              <div style="margin: 5px 0;">${eventDescription}</div>
              `
                  : ""
              }
              
              <h1 style="font-weight: bold; font-size: 18px; margin: 20px 0 10px;">User Information</h1>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${
                userProfile?.Email || "N/A"
              }</p>
              <p style="margin: 5px 0;"><strong>First Name:</strong> ${
                formData.firstName || "N/A"
              }</p>
              <p style="margin: 5px 0;"><strong>Last Name:</strong> ${
                formData.lastName || "N/A"
              }</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${
                formData.phone || "N/A"
              }</p>
              <p style="margin: 5px 0;"><strong>Username:</strong> ${
                userProfile.Username || "N/A"
              }</p>
              <p style="margin: 5px 0;"><strong>Partner Name:</strong> ${
                userProfile.PartnerName || "N/A"
              }</p>
              
              <h1 style="font-weight: bold; font-size: 18px; margin: 20px 0 10px;">Ticket Details</h1>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                  <thead>
                      <tr>
                          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4; text-align: left;">Name</th>
                          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4; text-align: left;">Type</th>
                          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4; text-align: left;">Price</th>
                          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f4f4f4; text-align: left;">Quantity</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td style="border: 1px solid #ddd; padding: 8px;">${
                            ticketName || "N/A"
                          }</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${
                            ticketType || "N/A"
                          }</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${
                            ticketPrice || "N/A"
                          }</td>
                          <td style="border: 1px solid #ddd; padding: 8px;">${
                            ticketQuantity || "N/A"
                          }</td>
                      </tr>
                  </tbody>
              </table>
          </div>
      `;

    // Send the email
    const response = await fetch("/api/user/events/ticket/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title:
          x == "1"
            ? `Ticket Confirmation for : ${eventName}`
            : "Sorry, we were unable to process your card request",
        eventName: eventName,
        email: userProfile.Email,
        eventDescription: eventDescription,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        userName: userProfile.Username,
        userPartnerName: userProfile.PartnerName,
        ticketName: ticketName,
        ticketType: ticketType,
        ticketPrice: ticketPrice,
        ticketQuantity: ticketQuantity,
        country: formData.qcountry,
        city: formData?.qcity,
        streetAddress: formData?.qstreetAddress,
        zipCode: formData?.qzipCode,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email. Status: ${response.status}`);
    }

    // alert("Emails sent successfully!");
    setOpen(false);

    return template;
  };

  const fetchData = async (userId: string) => {
    if (userId) {
      console.log(userId, "======userId in view");
      setLoading(true);
      try {
        const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
        if (!response.ok) {
          console.error(
            "Failed to fetch advertiser data:",
            response.statusText
          );
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { user: userData } = await response.json();
        if (!userData) {
          console.error("Advertiser not found");
        } else {
          console.log(userData, "=========advertiser data");
          setUserProfile(userData);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const [errors, setErrors] = useState<any>({});
  const [phone, setPhone] = useState("");

  const handlePhoneChange = (event: any) => {
    let value = event.target.value.replace(/\D/g, ""); // Remove all non-numeric characters
    if (value.length > 10) value = value.substring(0, 10); // Limit to 10 digits

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

    setPhone(value);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name == "phone") {
      console.log("sd");
      handlePhoneChange(e);
    }
    setFormData({ ...formData, [name]: value });
  };

  const [profileId, setProfileId] = useState<any>(null);

  useEffect(() => {
    if (profileId) {
      fetchData(profileId);
    }
  }, [profileId]);
  const [promoCode, setPromoCode] = useState<any>("");
  const [promoCodeMessage, setPromocodeMessage] = useState<any>(null);
  const [promoCodeList, setPromoCodeList] = useState<any>([]);
  const [userName, setUsername] = useState<any>("");
  const [password, setPassword] = useState<any>("");

  var existingUser = true;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setProfileId(localStorage.getItem("logged_in_profile"));
    }
  }, []);

  const [isValidPromoCode, setIsValidPromoCode] = useState<any>(true);

  useEffect(() => {
    const storedEventName = localStorage.getItem("event_name");
    const storedTicketPrice = localStorage.getItem("ticketPrice");
    const storedTicketName = localStorage.getItem("ticketName");
    const storedEventEmailDescription =
      localStorage.getItem("event_description");
    const storedTicketType = localStorage.getItem("ticketType");
    const ticketQuantity = localStorage.getItem("ticketQuantity");
    const storedEventId = localStorage.getItem("eventId");
    const storedEventDetails = localStorage.getItem("ticketDetails");

    const token = localStorage.getItem("loginInfo");
    if (token) {
      const decodeToken = jwtDecode<any>(token);
      console.log(decodeToken);
    }

    console.log("profile", localStorage.getItem("loginInfo"));

    setUsername(localStorage.getItem("profileUsername"));
    if (storedEventName) setEventName(storedEventName);
    if (ticketQuantity) setTicketQuantity(ticketQuantity);
    if (storedTicketPrice) setTicketPrice(storedTicketPrice);
    if (storedTicketName) setTicketName(storedTicketName);
    if (storedTicketType) setTicketType(storedTicketType);
    if (storedEventId) setEventId(storedEventId);
    if (storedEventDetails) setStoredEventDetails(storedEventDetails);
    if (storedEventEmailDescription)
      setEventDescription(storedEventEmailDescription);
    if (storedEventDetails && typeof storedEventDetails === "string") {
      console.log(JSON.parse(storedEventDetails));
      setEventDetails(JSON.parse(storedEventDetails));
    }
  }, []);

  const [profileUsername, setProfileUsername] = useState<any>("");
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);

  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First Name is required.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last Name is required.";
    }

    if (!formData.qstreetAddress.trim()) {
      newErrors.streetAddress = "Street Address is required.";
    }

    if (!formData.qzipCode.trim() || !/^\d{5}$/.test(formData.qzipCode)) {
      newErrors.zipCode = "Valid Zip Code is required (5 digits).";
    }

    if (!formData.qcity.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formData.qcountry.trim()) {
      newErrors.country = "Country is required.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required (format: (123) 456-7890).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
  };

  const handlePaymentProcess = () => {
    console.log(eventDetails);
    if (validateForm()) {
      // Proceed with payment processing
      console.log("Payment data:", formData);
      setOpen(true);
    }
  };

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [perrors, setPErrors] = useState<any>({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const handleCardNumberChange = (e: any) => {
    const input = e.target.value.replace(/\D/g, ""); // Remove all non-digit characters
    const formatted = input.replace(/(\d{4})(?=\d)/g, "$1 "); // Add a space every 4 digits
    setCardNumber(formatted.trim()); // Update the state with the formatted value

    if (input.length !== 16) {
      setPErrors((prev: any) => ({
        ...prev,
        cardNumber: "Invalid card number. Must be 16 digits.",
      }));
    } else {
      setPErrors((prev: any) => ({ ...prev, cardNumber: "" }));
    }
  };

  const handleExpiryChange = (e: any) => {
    const input = e.target.value.replace(/\D/g, ""); // Remove all non-digit characters
    let formatted = input;

    // Automatically format as MM/YY
    if (input.length >= 2) {
      formatted = `${input.substring(0, 2)}/${input.substring(2, 4)}`;
    }

    setExpiry(formatted);

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formatted)) {
      setPErrors((prev: any) => ({
        ...prev,
        expiry: "Invalid expiry date. Use MM/YY format.",
      }));
    } else {
      setPErrors((prev: any) => ({ ...prev, expiry: "" }));
    }
  };

  const handleCvcChange = (e: any) => {
    const value = e.target.value;
    setCvc(value);

    if (!/^\d{3,4}$/.test(value)) {
      setPErrors((prev: any) => ({
        ...prev,
        cvc: "Invalid CVC. Must be 3-4 digits.",
      }));
    } else {
      setPErrors((prev: any) => ({ ...prev, cvc: "" }));
    }
  };

  const handleConfirm = async () => {
    if (!cardNumber || !expiry || !cvc) {
      setPErrors({
        cardNumber: cardNumber ? "" : "Card number is required.",
        expiry: expiry ? "" : "Expiry date is required.",
        cvc: cvc ? "" : "CVC is required.",
      });
      return;
    }

    if (!errors.cardNumber && !errors.expiry && !errors.cvc) {
      try {
        setIsProcessing(true); // Set loading state
        console.log("price");

        console.log("storedEventDetails", storedEventDetails);

        var ticketDetailsArray = storedEventDetails;
        console.log("ticketDetailsArray", ticketDetailsArray);
        if (typeof storedEventDetails === "string") {
          ticketDetailsArray = JSON.parse(storedEventDetails);
          console.log("ticketDetailsArray1", ticketDetailsArray);
        }
        console.log("ticketDetailsArray2", ticketDetailsArray);
        console.log(isValidPromoCode);
        console.log(promoCode);
        const addAttendeeStatusResponse = await fetch(
          "/api/user/events/ticket/status",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profileId: profileId,
              payload: ticketDetailsArray,
            }),
          }
        );
        const status = await addAttendeeStatusResponse.json();
        console.log(status);
        if (status.message === "0") {
          const response = await fetch("/api/user/payment/ticket", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              pprice: parseFloat(ticketPrice),
              cardNumber: cardNumber,
              expiry: expiry,
              cvc: cvc,
              firstName: formData.firstName,
              lastName: formData.lastName,
              city: formData?.qcity,
              state: "",
              streetAddress: formData?.qstreetAddress,
              phone: formData?.phone,
              zipCode: formData?.qzipCode,
              username: profileUsername,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const respondCode = data.respondCode;
            console.log("*********");
            console.log(data);
            console.log(respondCode);
            if (respondCode === "1") {
              setOpen(false);

              console.log(
                "before createTicket",
                typeof ticketDetailsArray,
                ticketDetailsArray
              );

              createTicket(ticketDetailsArray);

              console.log(
                "After createTicket",
                typeof ticketDetailsArray,
                ticketDetailsArray
              );

              const addAttendeeResponse = await fetch(
                "/api/user/events/attendee",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    profileId: profileId,
                    payload: ticketDetailsArray,
                  }),
                }
              );

              if (addAttendeeResponse.ok) {
                console.log("Add attendee succesfully!");
                Swal.fire({
                  title: `Thank you ${userName}!`,
                  text: "You have purchased ticket successfully!",
                  icon: "success",
                  confirmButtonText: "OK",
                });
              } else {
                throw new Error("Add attendees is failed");
              }

              router.push("/events");
            } else {
              await handleTicketEmail("2");
              setOpen(false);

              Swal.fire({
                title: `Failed`,
                text: `We're sorry, the card card has been declined, Ticket(s) not purchased.`,
                icon: "error",
                confirmButtonText: "Edit the card",
              });
            }
          } else {
            console.log("2222222222222222222222222222222222");
            await handleTicketEmail("2");
            setOpen(false);
            Swal.fire({
              title: `Failed`,
              text: `We're sorry, the card card has been declined, Ticket(s) not purchased.`,
              icon: "error",
              confirmButtonText: "Edit the card",
            });
          }
        } else {
          console.log("1111111111111111111");
          setOpen(false);
          Swal.fire({
            title: `Failed`,
            text: `You have already purchased the ticket.`,
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsProcessing(false); // Reset loading state
      }
      // setOpen(false);
    }
  };

  const createTicket = async (storedEventDetails: any) => {
    try {
      console.log("createTicket1: ", storedEventDetails);

      var ticketDetailsArray = storedEventDetails;
      if (typeof storedEventDetails === "string") {
        ticketDetailsArray = JSON.parse(storedEventDetails);
      }
      
      ticketDetailsArray = ticketDetailsArray.map((ticket: any) => ({
        ...ticket,
        profileId: profileId
      }));
      
      console.log("Sending tickets with profileId:", ticketDetailsArray);
      
      // Send POST request to the backend
      const response = await fetch("/api/user/events/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storedEventDetails: ticketDetailsArray }),
      });

      // Check for successful response
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to create ticket:", errorData.error);
        return { success: false, error: errorData.error };
      }

      // Get the result and log success
      const result = await response.json();
      await handleTicketEmail("1");

      console.log("Ticket created successfully:", result.ticket);
      return { success: true, data: result.ticket };
    } catch (error) {
      await handleTicketEmail("2");
      console.error("An error occurred while creating the ticket:", error);
      return { success: false, error: "Internal Error" };
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ mt: 2.5, mb: 2.5, color: "white" }}>
        <Button
          onClick={() => router.back()}
          startIcon={<ArrowLeft />}
          sx={{
            textTransform: "none",
            color: "rgba(255, 255, 255, 0.7)",
            textAlign: "center",
            minWidth: "auto",
            fontSize: "16px",
            fontWeight: "medium",
            "&:hover": {
              color: "#fff",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
            },
          }}
        >
          Back
        </Button>
        <Typography variant="h4" gutterBottom>
          Payment Details
        </Typography>
        <Typography variant="body1" gutterBottom>
          Payment for Event: {eventName}
        </Typography>
        <Grid item xs={12} sm={12} sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: "bolder", color: "#aa1f72" }}
          >
            $ {ticketPrice} usd
          </Typography>
        </Grid>

        <Typography variant="body2" color="error" gutterBottom>
          Note that we do not accept American Express at this time.
        </Typography>

        <Grid container spacing={2}>
          {/* First Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
              variant="outlined"
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#fff" },
                  "&:hover fieldset": { borderColor: "#61dafb" },
                },
                input: { color: "#fff" },
              }}
            />
          </Grid>

          {/* Last Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              error={!!errors.lastName}
              helperText={errors.lastName}
              variant="outlined"
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#fff" },
                  "&:hover fieldset": { borderColor: "#61dafb" },
                },
                input: { color: "#fff" },
              }}
            />
          </Grid>

          {/* Street Address */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="qstreetAddress"
              value={formData.qstreetAddress}
              onChange={handleInputChange}
              error={!!errors.streetAddress}
              helperText={errors.streetAddress}
              variant="outlined"
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#fff" },
                  "&:hover fieldset": { borderColor: "#61dafb" },
                },
                input: { color: "#fff" },
              }}
            />
          </Grid>

          {/* Zip Code */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Zip Code"
              name="qzipCode"
              value={formData.qzipCode}
              onChange={handleInputChange}
              error={!!errors.zipCode}
              helperText={errors.zipCode}
              variant="outlined"
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#fff" },
                  "&:hover fieldset": { borderColor: "#61dafb" },
                },
                input: { color: "#fff" },
              }}
            />
          </Grid>

          {/* City */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="qcity"
              value={formData.qcity}
              onChange={handleInputChange}
              error={!!errors.city}
              helperText={errors.city}
              variant="outlined"
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#fff" },
                  "&:hover fieldset": { borderColor: "#61dafb" },
                },
                input: { color: "#fff" },
              }}
            />
          </Grid>

          {/* Country */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Country"
              name="qcountry"
              value={formData.qcountry}
              onChange={handleInputChange}
              error={!!errors.country}
              helperText={errors.country}
              variant="outlined"
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#fff" },
                  "&:hover fieldset": { borderColor: "#61dafb" },
                },
                input: { color: "#fff" },
              }}
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={phone}
              onChange={handleInputChange}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="(123) 456-7890"
              variant="outlined"
              InputLabelProps={{ style: { color: "#fff" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#fff" },
                  "&:hover fieldset": { borderColor: "#61dafb" },
                },
                input: { color: "#fff" },
              }}
            />
          </Grid>
        </Grid>
        {/* Pay Button */}
        <Grid item xs={12} sm={12}>
          <Button
            onClick={handlePaymentProcess}
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              mt: 5,
              textTransform: "none",
              backgroundColor: "#f50057",
              py: 1.5,
              fontSize: "16px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#c51162",
              },
            }}
            startIcon={<CreditCardIcon />}
          >
            Pay with Card
          </Button>
        </Grid>
      </Container>

      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #fff",
          },
        }}
      >
        {isProcessing ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 4,
              gap: 2,
            }}
          >
            <CircularProgress size={40} />
            <Typography>Please wait, authorizing...</Typography>
          </Box>
        ) : (
          <>
            <DialogTitle sx={{ color: "#fff" }}>
              Enter Payment Information
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                {/* Card Number */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Card Number"
                    name="cardNumber"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    variant="outlined"
                    InputLabelProps={{ style: { color: "#fff" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#fff" },
                        "&:hover fieldset": { borderColor: "#61dafb" },
                      },
                      input: { color: "#fff" },
                    }}
                    error={Boolean(perrors.cardNumber)}
                    helperText={perrors.cardNumber}
                  />
                </Grid>

                {/* Expiry */}
                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    placeholder="MM/YY"
                    name="expiry"
                    value={expiry}
                    onChange={handleExpiryChange}
                    variant="outlined"
                    InputLabelProps={{ style: { color: "#fff" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#fff" },
                        "&:hover fieldset": { borderColor: "#61dafb" },
                      },
                      input: { color: "#fff" },
                    }}
                    error={Boolean(perrors.expiry)}
                    helperText={perrors.expiry}
                  />
                </Grid>

                {/* CVC */}
                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    placeholder="CVC"
                    name="cvc"
                    value={cvc}
                    onChange={handleCvcChange}
                    variant="outlined"
                    InputLabelProps={{ style: { color: "#fff" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#fff" },
                        "&:hover fieldset": { borderColor: "#61dafb" },
                      },
                      input: { color: "#fff" },
                    }}
                    error={Boolean(perrors.cvc)}
                    helperText={perrors.cvc}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={onClose}
                variant="contained"
                color="secondary"
                sx={{
                  textTransform: "none",
                  py: 1.5,
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#444" },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                variant="contained"
                color="primary"
                sx={{
                  textTransform: "none",
                  py: 1.5,
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#61dafb" },
                }}
              >
                Confirm Payment
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
};

export default BillingUpgrade;
