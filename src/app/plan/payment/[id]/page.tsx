"use client";
import React, { Suspense, useEffect, useState } from "react";
import {
	AcceptHosted,
	FormComponent,
	FormContainer,
} from "react-authorize-net";

import {
	Box,
	Typography,
	TextField,
	Button,
	Checkbox,
	FormControlLabel,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";

import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { Pi } from "lucide-react";
type ResponseType = Record<string, any>; // Adjust this based on the actual shape of the response if you have more details
type ErrorType = Record<string, any>; // Adjust this as well based on the error structure
type Params = Promise<{ id: string }>;

export default function Payment(props: { params: Params }) {
	const [id, setId] = useState<string>(""); // State for error messages
	const [location, setLocation] = useState("");
	useEffect(() => {
		const getIdFromParam = async () => {
			const params = await props.params;
			const pid: any = params.id;
			console.log(pid);
			setId(pid);
			const data = await fetch("/api/user/getlocation", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: pid }),
			}).then((result) => {
				return result.json();
			});
			let state = data.product.Location.split(", ")[1];
			setLocation(state);
			console.log(state);
		};

		getIdFromParam();
		handlePromoState();
	}, [props]);
	// const clientKey: string = "2Y2W7LXwFsCqaBpj723C7juMu7GquF8Aftc7E2U54zNd446T35BrPNLC87c5FHDn";
	// const apiLoginId: string = "8LqpS52cU3n";
	const clientKey: string =
		"42PTvHZ7UVcj6h5GKYG5nL6E7Fvmy9KY8kYVQ2Eek2JMg7Ltg3YXB55TX3Y6t9pE";
	const apiLoginId: string = "5n89FY2Wdn";
	const [promoCode, setPromoCode] = useState<any>("");
	const [promoCodeMessage, setPromocodeMessage] = useState<any>(null);
	const [promoCodeList, setPromoCodeList] = useState<any>([]);
	const [firstMonthFree, setFirstMonthFree] = useState(false);
	const [address, setAddress] = useState<any>("");
	const [state, setState] = useState<any>("");

	const [isValidPromoCode, setValidPromoCode] = useState<any>(true);

	const handleChangePromoCode = (promoCodeText: string) => {
		setPromoCode(promoCodeText);
		if (promoCodeText) {
			let filter = promoCodeList.filter(
				(val: any) => val?.PromoCodeText === promoCodeText
			);
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
			setValidPromoCode(true);
		}
	};
	const handleSubmitPromoCode = async () => {
		try {
			const response = await fetch("/api/user/promocode", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ pid: id, promocode: promoCode }),
			});

			console.log(response);
		} catch (error) {
			console.error("Error submitting form:", error);
		}
	};
	// const onSuccessHandler = async (response: ResponseType) => {
	// 	console.log("response", response);
	// 	toast.success("Transaction Successful");
	// 	sendEmail(userName, email);
	// 	setOpen(false);

	// 	if (promoCode) {
	// 		await handleSubmitPromoCode();
	// 	}

	// 	// Show SweetAlert
	// 	Swal.fire({
	// 		title: `Thank you ${userName}!`,
	// 		text: "You will now be directed to login again to confirm your account and start using Swingsocial!",
	// 		icon: "success",
	// 		confirmButtonText: "Tap here to login",
	// 	}).then(() => {
	// 		// Redirect after the user clicks "OK"
	// 		window.location.href = "https://swing-social-website.vercel.app/login";
	// 	});
	// };

	const sendEmail = async (username: string, email: string) => {
		try {
			const response = await fetch("/api/user/email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username: username, email: email }),
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}

			const data = await response.json();
			console.log("Email sent successfully:", data);
		} catch (error: any) {
			console.error("Error sending email:", error.message);
		}
	};

	// const sendEmail = async (username: string, email: string) => {
	//   try {
	//     const response = await fetch("https://api.postmarkapp.com/email/withTemplate", {
	//       method: "POST",
	//       headers: {
	//         Accept: "application/json",
	//         "Content-Type": "application/json",
	//         "X-Postmark-Server-Token": "dcd2cc9f-7ac2-4753-bf70-46cb9df05178", // Replace with your server token
	//       },
	//       body: JSON.stringify({
	//         From: "info@swingsocial.co",
	//         To: email,
	//         TemplateId: 32736568,
	//         TemplateModel: {
	//           user_name: username, // Replace with dynamic data as needed
	//         },
	//       }),
	//     });

	//     if (!response.ok) {
	//       throw new Error(`Error: ${response.statusText}`);
	//     }

	//     const data = await response.json();
	//     console.log("Email sent successfully:", data);
	//   } catch (error: any) {

	//   }
	// };

	const onErrorHandler = (error: ErrorType): void => {
		console.log("error", error);
		toast.error("Transaction Failed");
		// Show SweetAlert
		if (promoCode) {
			handleSubmitPromoCode();
		}
	};
	const router = useRouter();

	const [price, setPrice] = useState<any>("");
	const [plan, setPlan] = useState<any>("");
	const [unit, setUnit] = useState<any>("");
	const [email, setEmail] = useState<any>("");
	const [userName, setUsername] = useState<any>("");
	const [password, setPassword] = useState<any>("");

	const getLocationName = async (latitude: number, longitude: number) => {
		const apiKey = "AIzaSyAbs5Umnu4RhdgslS73_TKDSV5wkWZnwi0"; // Replace with your actual API key

		try {
			// Call the Google Maps Geocoding API
			const response = await fetch(
				`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
			);

			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}

			const data = await response.json();

			// Extract the location name from the response
			if (data.status === "OK" && data.results.length > 0) {
				return data.results[0].formatted_address; // Return the formatted address of the first result
			}

			console.error("No results found or status not OK:", data);
			return "Unknown Location";
		} catch (error) {
			console.error("Error fetching location name:", error);
			return "Unknown Location";
		}
	};

	const getCurrentLocation = async () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const { latitude, longitude } = position.coords;
					// Reverse geocoding to get the location name (you may need a third-party service here)
					const locationName = await getLocationName(latitude, longitude);
					setAddress(locationName);

					console.log(locationName);
					// await handlePromoState();
				},
				(error) => {
					console.error("Geolocation error:", error);
				}
			);
		} else {
			console.error("Geolocation is not supported by this browser.");
		}
	};

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
		if (typeof window !== "undefined") {
			// Ensure localStorage is accessed only in the browser
			setPrice(localStorage.getItem("ssprice"));
			setPlan(localStorage.getItem("ssplan"));
			setUnit(localStorage.getItem("ssunit"));
			setEmail(localStorage.getItem("email"));
			setUsername(localStorage.getItem("userName"));
			setPassword(localStorage.getItem("password"));
		}
		getCurrentLocation();
		handleGetAllPromoCodes();
	}, [address]);
	const [selectedTab, setSelectedTab] = useState(0);
	const [billingCycle, setBillingCycle] = useState("1");

	const handleTabChange = (event: any, newValue: any) => {
		setSelectedTab(newValue);
	};

	const handleBillingCycleChange = (event: any, newCycle: any) => {
		if (newCycle) {
			setBillingCycle(newCycle);
		}
	};

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

	const [open, setOpen] = useState(false);
	const onClose = () => {
		setOpen(false);
	};
	const onConfirm = () => {
		setOpen(false);
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

	const handleLogin = async (userName: string, password: string) => {
		const payload = {
			email: userName,
			pwd: password,
		};

		const result = await fetch("/api/user/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		const data = await result.json();
		console.log(data);

		const decoded = jwtDecode(data.jwtToken);
		console.log(decoded);

		localStorage.setItem("loginInfo", data.jwtToken);
		localStorage.setItem("logged_in_profile", data.currentProfileId);
		localStorage.setItem("profileUsername", data.currentuserName);
		localStorage.setItem("memberalarm", "0");
		router.push("/home");
	};

	const extractState = (address: string) => {
		const match = address.match(/,\s([A-Z]{2})\s\d{5}/);
		return match ? match[1] : null; // Return the state or null if not found
	};

	const handlePromoState = async () => {
		const params = await props.params;
      	const userid: any = params.id;

		const response = await fetch(`/api/user/state?userid=${userid}`);
		if (!response.ok) {
			console.log("Error : please check it out");
		}
		const { user: advertiserData } = await response.json();
		console.log(advertiserData);
		const [city, state] = advertiserData.Location.split(", ");
		setState(state);
		console.log(state);
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
			// Process payment

			try {
				console.log("price");
				console.log(price);

				var ssunit = unit;
				var planName = "";
				var billingCycle = "1";
				var pprice = "17.95";
				if (ssunit == "1") {
					planName = plan + " Monthly";
					billingCycle = "1";
					pprice = "17.95";
				} else if (ssunit == "12") {
					planName = plan + " Annually";
					billingCycle = "12";
					pprice = "129.95";
				} else if (ssunit == "3") {
					planName = plan + " Quarterly";
					billingCycle = "3";
					pprice = "39.95";
				} else {
					planName = plan + "Bi-Annually";
					billingCycle = "6";
					pprice = "69.95";
				}

				if (isValidPromoCode) {
					if (promoCode !== "") {
						setPrice("$ 1");
						console.log(price);
					}
				}
				console.log(isValidPromoCode);
				console.log(promoCode);
				console.log({
					price: price,
					pprice: pprice,
					length: billingCycle,
					cardNumber: cardNumber,
					expiry: expiry,
					cvc: cvc,
					firstName: formData.firstName,
					lastName: formData.lastName,
					plan: planName,
					isPromoCode: isValidPromoCode,
					city: formData?.qcity,
					country: formData?.qcountry,
					state: state,
					streetAddress: formData?.qstreetAddress,
					phone: formData?.phone,
					zipCode: formData?.qzipCode,
					firstMonthFree: firstMonthFree,
					username: userName,
					email: email,
					promocode: promoCode,
					userid: id,
				})
				if (isValidPromoCode) {
					const response = await fetch("/api/user/payment", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							price: price,
							pprice: pprice,
							length: billingCycle,
							cardNumber: cardNumber,
							expiry: expiry,
							cvc: cvc,
							firstName: formData.firstName,
							lastName: formData.lastName,
							plan: planName,
							isPromoCode: isValidPromoCode,
							city: formData?.qcity,
							country: formData?.qcountry,
							state: state,
							streetAddress: formData?.qstreetAddress,
							phone: formData?.phone,
							zipCode: formData?.qzipCode,
							firstMonthFree: firstMonthFree,
							username: userName,
							email: email,
							promocode: promoCode,
							userid: id,
						}),
					});

					if (response.ok) {
						// router.push(`/plan/${id}`);
						const data = await response.json();
						const respondCode = data.respondCode;
						console.log("*********");
						console.log(data);
						console.log(respondCode);
						if (respondCode === "1") {
							if (promoCode === "") {
								await handleUpdateMembershipStatus(id, pprice);
							} else {
								await handleSubmitPromoCode();
								await handleUpdateMembershipStatus(id, pprice);
							}
							// await sendEmail(userName, email);
							setOpen(false);
							Swal.fire({
								title: `Thank you ${userName}!`,
								text: "You will now be directed to Swingsocial soon!",
								icon: "success",
								showCancelButton: true,
								confirmButtonText: "OK",
							}).then((result) => {
								if (result?.isConfirmed) {
									handleLogin(userName, password);
								}
							});
						} else {
							setOpen(false);
							Swal.fire({
								title: `Error`,
								text: `Sorry, we are unable to process.`,
								icon: "error",
								showCancelButton: true,
								confirmButtonText: "Edit the card",
								cancelButtonText: "Continue as the free member",
							}).then((result) => {
								if (result.isConfirmed) {
									setOpen(true);
								} else if (result.dismiss === Swal.DismissReason.cancel) {
									console.log("User chose to continue as a free member.");
									// sendEmail(userName, email);
									Swal.fire({
										title: `Thank you ${userName}!`,
										text: "You will now be directed to login again to confirm your account and start using Swingsocial!",
										icon: "success",
										showCancelButton: true,
										confirmButtonText: "OK",
									}).then((result) => {
										if (result?.isConfirmed) {
											handleLogin(userName, password);
										}
									});
								}
							});
						}
					}
				} else {
					setOpen(false);
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
			} catch (error) {
				console.error("Error submitting form:", error);
			}
			// setOpen(false);
		}
	};

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		qstreetAddress: "",
		qzipCode: "",
		qcity: "",
		qcountry: "",
		phone: "",
	});

	const [errors, setErrors] = useState<any>({});

	const handleInputChange = (e: any) => {
		const { name, value } = e.target;
		if (name == "phone") {
			console.log("sd");
			handlePhoneChange(e);
		}
		setFormData({ ...formData, [name]: value });
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

	const handlePaymentProcess = () => {
		if (validateForm()) {
			// Proceed with payment processing
			console.log("Payment data:", formData);
			setOpen(true);
		}
	};

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Box
				sx={{
					width: "100%",
					maxWidth: 800,
					margin: "auto",
					mt: 5,
					p: 3,
					borderRadius: 2,
					backgroundColor: "#000",
					color: "#fff",
					border: "1px solid",
				}}
			>
				{/* Heading */}
				<Typography variant="h5" mb={2} align="center">
					Payment Details
				</Typography>
				<Typography variant="h6" mb={3} align="center">
					Payment for {plan} Subscription
				</Typography>

				{/* Recurring Payment Checkbox */}
				{/* Form Fields */}
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
			</Box>
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

						{/* Promo Code */}
						<Grid item xs={12}>
							<TextField
								fullWidth
								placeholder="Promo Code"
								name="promoCode"
								value={promoCode}
								disabled={firstMonthFree}
								onChange={(e) => handleChangePromoCode(e.target.value)}
								variant="outlined"
								InputLabelProps={{ style: { color: "#fff" } }}
								sx={{
									"& .MuiOutlinedInput-root": {
										"& fieldset": {
											borderColor: firstMonthFree == true ? "black" : "#fff",
										},
										"&:hover fieldset": {
											borderColor: firstMonthFree == true ? "black" : "#61dafb",
										},
									},
									input: { color: "#fff" },
								}}
							/>
						</Grid>
						{promoCodeMessage && (
							<Grid item xs={12}>
								<Typography>{promoCodeMessage}</Typography>
							</Grid>
						)}
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
			</Dialog>

			<ToastContainer position="top-right" autoClose={3000} />
		</Suspense>
	);
}
