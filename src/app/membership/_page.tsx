"use client"

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
} from "@mui/material";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

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

const BillingUpgrade: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        screenName: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        phoneNumber: "",
        membershipOption: "",
        cardNumber: "",
        expDate: "",
        cvv: "",
        promoCode: ""
    });

    const [profileId, setProfileId] = useState<any>("7c4cabe7-f7d2-4577-a9c2-de8b9c2af2c7");
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [promoCode, setPromoCode] = useState<any>('');
    const [promoCodeMessage, setPromocodeMessage] = useState<any>(null);
    const [promoCodeList, setPromoCodeList] = useState<any>([]);
    const [userName, setUsername] = useState<any>('');
    const [password, setPassword] = useState<any>('');

    const [isValidPromoCode, setValidPromoCode] = useState<any>(false);
    const handleGetAllPromoCodes = async () => {
        try {
            const apiUrl = `/api/user/promocode/check`;
            // Fetch event data from your API
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch event data');
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            // Set the fetched data
            setPromoCodeList(result.promocodes);
        } catch (error) {

        }
    }
    useEffect(() => {
        setUsername(localStorage.getItem('userName'))
        setPassword(localStorage.getItem('password'))
        handleGetAllPromoCodes();
    }, []);
    const handleChangePromoCode = (promoCodeText: string) => {
        console.log(promoCodeText, "======promoCodeText");
        handleGetAllPromoCodes();
        setPromoCode(promoCodeText);
        if (promoCodeText) {
            let filter = promoCodeList.filter((val: any) => val?.PromoCodeText === promoCodeText);
            if (filter?.length > 0) {
                console.log(filter[0].DisplayMessage, "=====filter");
                setPromocodeMessage(filter[0]?.DisplayMessage);
                setValidPromoCode(true);
            } else {
                setPromocodeMessage("Promo Code is Invalid");
                setValidPromoCode(false);
            }
        } else {
            setPromocodeMessage(null);
            setValidPromoCode(false);
        }
    }
    const handleSubmitPromoCode = async () => {
        try {
            const response = await fetch('/api/user/promocode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pid: profileId, promocode: promoCode }),
            });

            console.log(response)
        }
        catch (error) {
            console.error('Error submitting form:', error);
        }

    }

    // Handle changes for form fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear the error for the field once the user starts typing
        if (errors[name as keyof FormData]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    // Validate the form fields
    const validate = () => {
        let tempErrors: Partial<FormData> = {};

        if (!formData.firstName) tempErrors.firstName = "First Name is required.";
        if (!formData.lastName) tempErrors.lastName = "Last Name is required.";
        if (!formData.screenName) tempErrors.screenName = "Screen Name is required.";
        if (!formData.streetAddress) tempErrors.streetAddress = "Street Address is required.";
        if (!formData.city) tempErrors.city = "City is required.";
        if (!formData.state) tempErrors.state = "State is required.";
        if (!formData.zipCode) tempErrors.zipCode = "Zip Code is required.";
        if (!formData.phoneNumber) tempErrors.phoneNumber = "Phone Number is required.";
        if (!formData.membershipOption) tempErrors.membershipOption = "Membership Option is required.";
        if (!formData.cardNumber) tempErrors.cardNumber = "Card Number is required.";
        if (!formData.expDate) tempErrors.expDate = "Expiry Date is required.";
        if (!formData.cvv) tempErrors.cvv = "CVV is required.";

        setErrors(tempErrors);

        // Return true if no errors exist
        return Object.keys(tempErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validate()) {
            console.log("Form submitted successfully:", formData);
            // Add your submission logic here
            try {
                //get price and unit from  from option

                const match = formData?.membershipOption.match(/^([\w\s]+) - \$([\d.]+)$/);
                console.log(formData?.membershipOption,"======matchh");
                var unit = match?.[1]; // "Monthly"
                var planName = '';
                if (unit == "Monthly") {
                    unit = "months"
                    planName = "Premium Monthly";
                } else if (unit == "Quarterly") {
                    unit = "quarters";
                    planName = "Premium Quarterly";
                } else if (unit == "Yearly" || unit == "Annually") {
                    unit = "years";
                    planName = "Premium Annually";
                }
                const price = match?.[2]; // "17.95"

                console.log("Unit:", unit);
                console.log("Price:", price);
                const response = await fetch('/api/user/payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(
                        {
                            price: isValidPromoCode ? "$ 1" : price,
                            unit: unit,
                            cardNumber: formData.cardNumber,
                            expiry: formData?.expDate,
                            cvc: formData?.cvv,
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                            plan: planName,
                            isPromoCode:isValidPromoCode
                        }),
                });
                if (response.ok) {
                    // router.push(`/plan/${id}`);

                    toast.success('Transaction Successful');

                    // Show SweetAlert
                    Swal.fire({
                        title: `Thank you ${userName}! Your password is ${password}`,
                        text: 'Your membership has been upgraded successfully!',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        // Redirect after the user clicks "OK"
                        // window.location.href = 'https://app.swingsocial.co/login';
                        handleUpdateMembershipStatus(profileId);
                        handleSubmitPromoCode();
                    });
                }
            }
            catch (error) {
                console.error('Error submitting form:', error);
            }
        } else {
            console.log("Validation failed:", errors);
        }
    };

    const handleUpdateMembershipStatus = async (userid: string) => {
        try {
            // Check if t
            // he username exists
            const checkResponse = await fetch('/api/user/membership?id=' + userid, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const checkData = await checkResponse.json();

        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ mt: 2.5, mb: 2.5, color: "white" }}>
                <Typography variant="h4" gutterBottom>
                    Upgrade Your Membership
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We’re excited to have you take advantage of the premium features of Swing Social! While
                    we’re hard at work getting ready to roll out our apps, we are also upgrading our
                    membership system. That said, if you run into any difficulties upgrading your membership
                    after sign up, please fill out the form below and we will upgrade you. You’ll receive an
                    email after your account is upgraded.
                </Typography>
                <Typography variant="body2" color="error" gutterBottom>
                    Note that we do not accept American Express at this time.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        {/* First Name and Last Name */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                error={Boolean(errors.firstName)}
                                helperText={errors.firstName}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                error={Boolean(errors.lastName)}
                                helperText={errors.lastName}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>

                        {/* Screen Name */}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Swing Social Screen Name"
                                name="screenName"
                                value={formData.screenName}
                                onChange={handleChange}
                                error={Boolean(errors.screenName)}
                                helperText={errors.screenName}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>

                        {/* Billing Address */}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Street Address"
                                name="streetAddress"
                                value={formData.streetAddress}
                                onChange={handleChange}
                                error={Boolean(errors.streetAddress)}
                                helperText={errors.streetAddress}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                error={Boolean(errors.city)}
                                helperText={errors.city}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                required
                                fullWidth
                                label="State"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                error={Boolean(errors.state)}
                                helperText={errors.state}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                required
                                fullWidth
                                label="Zip Code"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                error={Boolean(errors.zipCode)}
                                helperText={errors.zipCode}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>

                        {/* Phone Number */}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Phone Number"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                error={Boolean(errors.phoneNumber)}
                                helperText={errors.phoneNumber}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>

                        {/* Membership Option */}
                        <Grid item xs={12}>
                            <TextField
                                select
                                required
                                fullWidth
                                label="Membership Option"
                                name="membershipOption"
                                value={formData.membershipOption}
                                onChange={handleChange}
                                error={Boolean(errors.membershipOption)}
                                helperText={errors.membershipOption}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                    "& .MuiSelect-select": {
                                        color: "white", // Selected text color
                                    },
                                    "& .MuiSvgIcon-root": {
                                        color: "white", // Dropdown arrow color
                                    },
                                }}
                            >
                                <MenuItem value="Monthly - $17.95">Monthly - $17.95</MenuItem>
                                <MenuItem value="Quarterly - $39.95">Quarterly - $39.95</MenuItem>
                                <MenuItem value="Annually - $69.95">Bi-Annually - $69.95</MenuItem>
                                <MenuItem value="Annually - $129.95">Annually - $129.95</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Payment Details */}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Card Number"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleChange}
                                error={Boolean(errors.cardNumber)}
                                helperText={errors.cardNumber}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Expiry Date (MM/YY)"
                                name="expDate"
                                value={formData.expDate}
                                onChange={handleChange}
                                error={Boolean(errors.expDate)}
                                helperText={errors.expDate}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="CVV"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleChange}
                                error={Boolean(errors.cvv)}
                                helperText={errors.cvv}
                                style={{ color: "white" }}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        {/* Billing Address */}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Promo Code"
                                name="promoCode"
                                value={promoCode}
                                onChange={(e: any) => handleChangePromoCode(e.target.value)}
                                error={Boolean(errors.promoCode)}
                                helperText={errors.promoCode}
                                sx={{
                                    input: {
                                        color: "white"
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: "white", // Default border color
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#E91E63", // Hover border color
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#E91E63", // Focus border color
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#E91E63", // Error border color
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        {promoCodeMessage &&
                            <Grid item xs={12}>
                                <Typography>
                                    {promoCodeMessage}
                                </Typography>
                            </Grid>
                        }
                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Upgrade Membership
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default BillingUpgrade;