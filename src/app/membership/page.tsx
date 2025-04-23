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
} from "@mui/material";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
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
	country: string;
	city: string;
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

const BillingUpgrade: React.FC = () => {
	const [formData, setFormData] = useState<FormData>({
		firstName: "",
		lastName: "",
		screenName: "",
		streetAddress: "",
		country: "",
		city: "",
		zipCode: "",
		phoneNumber: "",
		membershipOption: "",
		cardNumber: "",
		expDate: "",
		cvv: "",
		promoCode: "",
	});

	const [profileId, setProfileId] = useState<any>(null);
	const [errors, setErrors] = useState<Partial<FormData>>({});
	const [promoCode, setPromoCode] = useState<any>("");
	const [promoCodeMessage, setPromocodeMessage] = useState<any>(null);
	const [promoCodeList, setPromoCodeList] = useState<any>([]);
	const [userName, setUsername] = useState<any>("");
	const [password, setPassword] = useState<any>("");
	const [membership, setMembership] = useState(0);
	const [showAlert, setShowAlert] = useState(false);
	const [advertiser, setAdvertiser] = useState<any>({});
	const [state, setState] = useState<any>("");
	const [firstMonthFree, setFirstMonthFree] = useState(false);

	const router = useRouter();
	var existingUser = true;

	// useEffect(() => {
	//     if (typeof window !== 'undefined') {
	//         setProfileId(localStorage.getItem('logged_in_profile'));
	//     }
	// }, []);

	const [isValidPromoCode, setIsValidPromoCode] = useState<any>(true);
	const handleGetAllPromoCodes = async () => {
		try {
			const apiUrl = `/api/user/promocode/check`;
			// Fetch event data from your API
			const response = await fetch(apiUrl);
			if (!response.ok) {
				throw new Error("Failed to fetch event data");
			}

			const result = await response.json();

			if (result.error) {
				throw new Error(result.error);
			}

			// Set the fetched data
			setPromoCodeList(result.promocodes);
		} catch (error) {}
	};
	useEffect(() => {
		handleGetAllPromoCodes();
	}, []);
	useEffect(() => {
		const userid = localStorage.getItem("logged_in_profile");
		setProfileId(userid);
		const getState = async () => {
			const response = await fetch(`/api/user/state?userid=${userid}`);
			if (!response.ok) {
				console.log("Error : please check it out");
			}
			const { user: advertiserData } = await response.json();
			console.log(advertiserData);
			const [city, state] = advertiserData.Location.split(", ");
			setState(state);
			const result = await fetch("/api/user/promostate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					state: state,
				}),
			});
			const data = await result.json();
			if (data.result == 1) {
				setFirstMonthFree(true);
				console.log("Free Month");
			} else {
				console.log("Premium Month");
				setFirstMonthFree(false);
			}
		};
		getState();
	}, []);
	useEffect(() => {
		setUsername(localStorage.getItem("profileUsername"));
		setPassword(localStorage.getItem("password"));
		const token = localStorage.getItem("loginInfo");
		if (token) {
			const decodeToken = jwtDecode<any>(token);
			setMembership(decodeToken?.membership);
		}
		const id = localStorage.getItem("logged_in_profile");
		const getData = async () => {
			const response = await fetch(`/api/user/sweeping/user?id=${id}`);
			if (!response.ok) {
				console.error("Failed to fetch advertiser data:", response.statusText);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const { user: advertiserData } = await response.json();
			setAdvertiser(advertiserData);

			console.log("here is the data: ", advertiserData);
		};
		getData();

		handleGetAllPromoCodes();
	}, []);

	const handleChangePromoCode = (promoCodeText: string) => {
		console.log(promoCodeText, "======promoCodeText");
		// handleGetAllPromoCodes();
		setPromoCode(promoCodeText);
		if (promoCodeText) {
			let filter = promoCodeList.filter(
				(val: any) => val?.PromoCodeText === promoCodeText
			);
			if (filter?.length > 0) {
				console.log(filter[0].DisplayMessage, "=====filter");
				setPromocodeMessage(filter[0]?.DisplayMessage);
				setIsValidPromoCode(true);
			} else {
				setPromocodeMessage("Promo Code is Invalid");
				setIsValidPromoCode(false);
			}
		} else {
			setPromocodeMessage(null);
			setIsValidPromoCode(true);
		}
	};
	const handleSubmitPromoCode = async () => {
		try {
			const response = await fetch("/api/user/promocode", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ pid: profileId, promocode: promoCode }),
			});

			console.log(response);
		} catch (error) {
			console.error("Error submitting form:", error);
		}
	};

	// Handle changes for form fields
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
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
		// if (profileUsername === "") tempErrors.screenName = "Profile Name is required.";
		if (!formData.streetAddress)
			tempErrors.streetAddress = "Street Address is required.";
		if (!formData.country) tempErrors.country = "Country is required.";
		if (!formData.city) tempErrors.city = "City is required.";
		// if (!formData.state) tempErrors.state = "State is required.";
		if (!formData.zipCode) tempErrors.zipCode = "Zip Code is required.";
		if (!formData.phoneNumber)
			tempErrors.phoneNumber = "Phone Number is required.";
		if (!formData.membershipOption)
			tempErrors.membershipOption = "Membership Option is required.";
		if (!formData.cardNumber)
			tempErrors.cardNumber = "Card Number is required.";
		if (!formData.expDate) tempErrors.expDate = "Expiry Date is required.";
		if (!formData.cvv) tempErrors.cvv = "CVV is required.";

		setErrors(tempErrors);

		// Return true if no errors exist
		return Object.keys(tempErrors).length === 0;
	};

	// const handleGetProfileId = async () => {
	//     try {
	//         // Check if the username exists
	//         const checkResponse = await fetch('/api/user/profile/search', {
	//             method: 'POST',
	//             headers: {
	//                 'Content-Type': 'application/json',
	//             },
	//             body: JSON.stringify({ search: id }), // Pass the username to check
	//         });

	//         const checkData = await checkResponse.json();
	//         console.log(checkData);
	//         console.log(profileId);
	//         if (!checkData.detail) {
	//             existingUser = false;
	//         } else {
	//             existingUser = true;
	//             setProfileId(checkData?.detail?.Id);
	//             setUsername(checkData?.detail?.Username);
	//         }
	//         console.log(profileId);
	//     } catch (error) {
	//         console.log(error);
	//     }
	// }

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			console.log("Form submitted successfully:", formData);
			// Add your submission logic here
			try {
				//get price and unit from  from option
				// await handleGetProfileId();
				const match = formData?.membershipOption.match(
					/^([\w\s]+) - \$([\d.]+)$/
				);
				console.log(formData?.membershipOption, "======matchh");
				var unit = match?.[1]; // "Monthly"
				var length = "1";
				var planName = "";
				var pprice = "17.95";
				console.log(unit);
				if (unit == "Monthly") {
					length = "1";
					planName = "Premium Monthly";
					pprice = "17.95";
				} else if (unit == "Quarterly") {
					length = "3";
					planName = "Premium Quarterly";
					pprice = "39.95";
				} else if (unit == "BiAnnually") {
					length = "6";
					planName = "BiAnnually";
					pprice = "69.95";
				} else if (unit == "Annually") {
					length = "12";
					planName = "Annually";
					pprice = "129.95";
				}

				console.log("Unit:", unit);

				if (existingUser == false) {
					Swal.fire({
						title: `Error`,
						text: `Sorry, we can not find you. Please sign up to the website.`,
						icon: "error",
						showCancelButton: true,
						confirmButtonText: "Ok",
					}).then(() => {
						console.log("Your Promo Code is Invalid");
					});
				} else {
					console.log(isValidPromoCode);
					console.log(length);
					if (isValidPromoCode) {
						if (promoCode !== "") {
							pprice = "1";
						}
						// console.log(price);
						const response = await fetch("/api/user/payment", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								price: pprice,
								pprice: pprice,
								length: length,
								cardNumber: formData.cardNumber,
								expiry: formData?.expDate,
								cvc: formData?.cvv,
								firstName: formData.firstName,
								lastName: formData.lastName,
								plan: planName,
								isPromoCode: isValidPromoCode,
								country: formData?.country,
								// screenName: profileUsername,
								city: formData?.city,
								state: state,
								streetAddress: formData?.streetAddress,
								phone: formData?.phoneNumber,
								zipCode: formData?.zipCode,
								promocode: promoCode,
								email: advertiser.Email,
								username: advertiser.Username,
								firstMonthFree: firstMonthFree,
								userid: profileId,
							}),
						});
						console.log(response);
						if (response.ok) {
							const data = await response.json();
							const respondCode = data.respondCode;
							console.log("////////");
							console.log(data);
							console.log(respondCode);

							if (respondCode === "1") {
								if (promoCode === "") {
									Swal.fire({
										title: `Thank you=`,
										text: "Your membership has been upgraded successfully!",
										icon: "success",
										confirmButtonText: "OK",
									}).then(async () => {
										await handleUpdateMembershipStatus(profileId, pprice);

										router.push("/members");
										setShowAlert(true);

										// Automatically hide the alert after 3 seconds
										setTimeout(() => {
											setShowAlert(false);
										}, 3000);
									});
								} else {
									Swal.fire({
										title: `Thank you=`,
										text: "Your membership has been upgraded successfully!",
										icon: "success",
										confirmButtonText: "OK",
									}).then(async () => {
										await handleSubmitPromoCode();
										await handleUpdateMembershipStatus(profileId, pprice);
										router.push("/members");
										setShowAlert(true);

										// Automatically hide the alert after 3 seconds
										setTimeout(() => {
											setShowAlert(false);
										}, 3000);
									});
								}
							} else {
								console.log(
									"----------------------Promocodemessage",
									promoCodeMessage,
									promoCode
								);
								Swal.fire({
									title: `Error`,
									text: `Sorry, we are unable to process.`,
									icon: "error",
									showCancelButton: true,
									confirmButtonText: "Edit the card",
									cancelButtonText: "Go to the homepage",
								}).then((result) => {
									if (result.dismiss === Swal.DismissReason.cancel) {
										window.location.href = "https://app.swingsocial.co/";
									}
								});
							}
						}
					} else {
						Swal.fire({
							title: `Your Promo Code is Invalid`,
							text: `Sorry, promo code is not valid. Please check and try again.`,
							icon: "error",
							showCancelButton: true,
							confirmButtonText: "Ok",
						}).then(() => {
							console.log("error");
						});
					}
				}
			} catch (error) {
				console.error("Error submitting form:", error);
			}
		} else {
			console.log("Validation failed:", errors);
		}
	};

	const handleUpdateMembershipStatus = async (userid: string, pprice: any) => {
		try {
			const response = await fetch("/api/user/membership", {
				method: "POST", // Specify the HTTP method
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ profileId: userid, price: pprice }), // Pass profileId and selected upgrade option
			});

			const checkData = await response.json();
			localStorage.setItem('memberShip', "1");
		} catch (error) {
			console.error("Error:", error);
		}
	};

	// const [profileUsername, setProfileUsername] = useState<any>("");
	const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [hasMore, setHasMore] = useState<boolean>(true);

	useEffect(() => {
		const fetchUserProfiles = async () => {
			if (loading || !hasMore || searchQuery.length < 2) return; // Require at least 2 characters

			try {
				setLoading(true);
				const response = await fetch(
					`/api/user/sweeping?page=${page}&size=50&search=${encodeURIComponent(
						searchQuery
					)}`
				);
				const data = await response.json();

				if (data?.profiles?.length > 0) {
					setUserProfiles((prevProfiles) =>
						page === 1 ? data.profiles : [...prevProfiles, ...data.profiles]
					);
				} else {
					setHasMore(false); // No more results
				}

				setLoading(false);
			} catch (error) {
				console.error("Error fetching user profiles:", error);
				setLoading(false);
			}
		};

		fetchUserProfiles();
	}, [page, searchQuery]);

	const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
		const target = event.target as HTMLDivElement;
		if (
			target.scrollHeight - target.scrollTop === target.clientHeight &&
			!loading &&
			hasMore
		) {
			setPage((prevPage) => prevPage + 1);
		}
	};

	const debounce = (func: Function, delay: number) => {
		let timer: NodeJS.Timeout;
		return (...args: any[]) => {
			clearTimeout(timer);
			timer = setTimeout(() => func(...args), delay);
		};
	};

	const handleSearchChange = debounce((value: string) => {
		setPage(1); // Reset to first page for new search
		setHasMore(true); // Reset pagination
		setSearchQuery(value);
	}, 300);

	return (
		<ThemeProvider theme={theme}>
			{showAlert && (
				<div
					style={{
						position: "fixed",
						top: "1rem",
						right: "1rem",
						backgroundColor: "green",
						color: "white",
						padding: "1rem 2rem",
						borderRadius: "5px",
						boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
						zIndex: 1000,
					}}
				>
					Congratulation! You qualify for one month premium membership only $1
					and $17.95 thereafter!
				</div>
			)}
			{membership === 1 ? (
				<Container
					maxWidth="md"
					sx={{
						mt: 2.5,
						mb: 2.5,
						color: "white",
						minHeight: "100vh", // Ensures the container takes the full height of the viewport
						display: "flex",
						flexDirection: "column", // Arrange children in a column
						justifyContent: "center", // Center the Box vertically
					}}
				>
					{/* Back button positioned at the top */}
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
							position: "absolute", // Position it at the top
							top: "20px", // Adjust the distance from the top
							left: "20px", // Adjust the distance from the left
							"&:hover": {
								color: "#fff",
								backgroundColor: "rgba(255, 255, 255, 0.08)",
							},
						}}
					>
						Back
					</Button>

					{/* Centered Box */}
					<Box
						sx={{
							p: 3,
							borderRadius: 2,
							backgroundColor: "rgba(255, 255, 255, 0.08)",
							boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
							textAlign: "center",
							color: "white",
						}}
					>
						<Typography
							variant="h6"
							gutterBottom
							sx={{
								fontWeight: "bold",
								fontSize: "18px",
								color: "#fff",
							}}
						>
							Premium Membership
						</Typography>
						<Typography
							variant="body1"
							gutterBottom
							sx={{
								fontSize: "16px",
								color: "rgba(255, 255, 255, 0.7)",
							}}
						>
							You are a Premium member. If you wish to downgrade to free or
							cancel, please email:
						</Typography>
						<Typography
							component="a"
							href="mailto:info@swingsocial.co"
							sx={{
								fontSize: "16px",
								fontWeight: "bold",
								color: "#E91E63",
								textDecoration: "none",
								"&:hover": {
									textDecoration: "underline",
									color: "#FF4081",
								},
							}}
						>
							info@swingsocial.co
						</Typography>
					</Box>
				</Container>
			) : (
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
						{userName} - Upgrade Your Membership
					</Typography>
					<Typography variant="body1" gutterBottom>
						We’re excited to have you take advantage of the premium features of
						Swing Social! While we’re hard at work getting ready to roll out our
						apps, we are also upgrading our membership system. That said, if you
						run into any difficulties upgrading your membership after sign up,
						please fill out the form below and we will upgrade you. You’ll
						receive an email after your account is upgraded.
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
											color: "white",
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
											color: "white",
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
							{/* <Grid item xs={12}>
                                <Autocomplete
                                    value={userProfiles.find((user) => user.Id === profileId) || null}
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            existingUser = true;
                                            setProfileId(newValue.Id);
                                            setProfileUsername(newValue?.Username);
                                        } else {
                                            existingUser = false;
                                            setProfileId("");
                                            setProfileUsername("");
                                        }
                                    }}
                                    options={searchQuery.length >= 2 ? userProfiles : []} // Show options only if 2+ characters are typed
                                    getOptionLabel={(option) => option.Username || ""}
                                    isOptionEqualToValue={(option, value) => option.Id === value.Id}
                                    loading={loading}
                                    onScroll={handleScroll}
                                    filterOptions={(options, { inputValue }) => {
                                        if (inputValue.length < 2) return []; // Prevent showing results
                                        const normalizedInput = inputValue.toLowerCase();
                                        return options.sort((a, b) => {
                                            const aStartsWith = a.Username.toLowerCase().startsWith(normalizedInput);
                                            const bStartsWith = b.Username.toLowerCase().startsWith(normalizedInput);
                                            if (aStartsWith && !bStartsWith) return -1;
                                            if (!aStartsWith && bStartsWith) return 1;
                                            return a.Username.toLowerCase().localeCompare(b.Username.toLowerCase());
                                        });
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            required
                                            {...params}
                                            label="Profile Name"
                                            name="screenName"
                                            variant="outlined"
                                            error={Boolean(errors.screenName)}
                                            helperText={errors.screenName}
                                            fullWidth
                                            InputProps={{
                                                ...params.InputProps,
                                                style: { color: "white" },
                                            }}
                                            style={{
                                                backgroundColor: "#333",
                                            }}
                                            onChange={(e) => {
                                                handleSearchChange(e.target.value);
                                                if (e.target.value.length < 2) setUserProfiles([]); // Clear list for less than 2 characters
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.Id} style={{ color: "white", backgroundColor: "#333" }}>
                                            {option.Username}
                                        </li>
                                    )}
                                    noOptionsText={searchQuery.length < 2 ? "Please search profile names" : "No users found"}
                                    style={{
                                        backgroundColor: "#333",
                                        width: "100%",
                                    }}
                                />
    
                                {/* <TextField
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
                            </Grid> */}

							<Grid item xs={12} sm={6}>
								<TextField
									required
									fullWidth
									label="Country"
									name="country"
									value={formData.country}
									onChange={handleChange}
									error={Boolean(errors.country)}
									helperText={errors.country}
									sx={{
										input: {
											color: "white",
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
									label="City"
									name="city"
									value={formData.city}
									onChange={handleChange}
									error={Boolean(errors.city)}
									helperText={errors.city}
									sx={{
										input: {
											color: "white",
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
							{/* <Grid item xs={12} sm={3}>
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
                            </Grid> */}
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
											color: "white",
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
											color: "white",
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
											color: "white",
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
									<MenuItem value="Quarterly - $39.95">
										Quarterly - $39.95
									</MenuItem>
									<MenuItem value="BiAnnually - $69.95">
										Bi-Annually - $69.95
									</MenuItem>
									<MenuItem value="Annually - $129.95">
										Annually - $129.95
									</MenuItem>
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
											color: "white",
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
											color: "white",
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
											color: "white",
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
											color: "white",
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
							{promoCodeMessage && (
								<Grid item xs={12}>
									<Typography>{promoCodeMessage}</Typography>
								</Grid>
							)}
							{/* Submit Button */}
							<Grid item xs={12}>
								<Button
									type="submit"
									variant="contained"
									color="primary"
									fullWidth
								>
									Upgrade Membership
								</Button>
							</Grid>
						</Grid>
					</Box>
				</Container>
			)}
		</ThemeProvider>
	);
};

export default BillingUpgrade;
