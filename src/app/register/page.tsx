"use client";
import {
    Box,
    TextField,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    CircularProgress,
    LinearProgress,
    ThemeProvider,
    createTheme,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

type CityType = {
    id: number,
    City: string
}

interface StrengthPassword {
    password: {
        error: boolean;
        message: string;
        strength: number;
    };
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#FF2D55',
            light: '#FF617B',
            dark: '#CC1439',
        },
        secondary: {
            main: '#7000FF',
            light: '#9B4DFF',
            dark: '#5200CC',
        },
        success: {
            main: '#00D179',
        },
        background: {
            default: '#0A0118',
        },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
    },
    shape: {
        borderRadius: 16,
    },
});

export default function ProfileDetail() {
    // State to hold form input values
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        repeatPassword: '',
        userName: '',
        phone: '',
        age: '01/01/0101',
        city: '',
    });

    const [profileId, setProfileId] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [checkPassword, setCheckPassword] = useState(false);
    const [touched, setTouched] = useState(false);

    const [validation, setValidation] = useState<StrengthPassword>({
        password: {
            error: false,
            message: '',
            strength: 0,
        },
    });

    const ParticleField = () => {
        const particles = [...Array(50)].map((_, i) => ({
            id: i,
            size: Math.random() * 6 + 2,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 20 + 10,
            delay: -Math.random() * 20,
        }));

        return (
            <Box
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    opacity: 0.6,
                }}
            >
                {particles.map((particle) => (
                    <Box
                        key={particle.id}
                        sx={{
                            position: 'absolute',
                            width: particle.size,
                            height: particle.size,
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            background: 'linear-gradient(45deg, #FF2D55, #7000FF)',
                            borderRadius: '50%',
                            animation: `float ${particle.duration}s infinite linear`,
                            animationDelay: `${particle.delay}s`,
                            '@keyframes float': {
                                '0%': {
                                    transform: 'translate(0, 0) rotate(0deg)',
                                    opacity: 0,
                                },
                                '50%': {
                                    opacity: 0.8,
                                },
                                '100%': {
                                    transform: 'translate(100px, -100px) rotate(360deg)',
                                    opacity: 0,
                                },
                            },
                        }}
                    />
                ))}
            </Box>
        );
    };

    const getStrengthColor = (strength: number) => {
        if (strength < 40) return 'error';
        if (strength < 60) return 'warning';
        return 'success';
    };

    const calculatePasswordStrength = (password: string): number => {
        let strength = 0;
        if (password.length >= 8) strength += 20;
        if (password.match(/[a-z]+/)) strength += 20;
        if (password.match(/[A-Z]+/)) strength += 20;
        if (password.match(/[0-9]+/)) strength += 20;
        if (password.match(/[$@#&!]+/)) strength += 20;
        return strength;
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleToggleCheckPasswordVisibility = () => {
        setCheckPassword((prev) => !prev);
    };


    // Handle change for each input field
    const handleInputChange = (e: any) => {
        const { name, value } = e.target;

        const strength = calculatePasswordStrength(value);
        if (name === "password") {
            setTouched(true);
            setValidation({
                password: {
                    error: strength < 60,
                    message: strength < 60 ? 'Password is not strong enough' : '',
                    strength,
                },
            });
        }

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const [errors, setErrors] = useState<any>({}); // State for error messages

    // Email validation function
    const validateEmail = (email: any) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    // Phone validation function (basic validation for 10-digit numbers)
    const validatePhone = (phone: any) => {
        const regex = /^[0-9]{10}$/;
        return regex.test(phone);
    };

    // Handle form submission
    const handleSubmit = async () => {
        const newErrors: any = {};

        const urlParams = new URLSearchParams(window.location.search);
        const aff = urlParams.get("aff");
        const refer = urlParams.get("refer");
        
        // Detect OS
        const getOS = () => {
            const userAgent = window.navigator.userAgent;
            if (userAgent.indexOf("Win") !== -1) return "Windows";
            if (userAgent.indexOf("Mac") !== -1) return "MacOS";
            if (userAgent.indexOf("Linux") !== -1) return "Linux";
            if (userAgent.indexOf("Android") !== -1) return "Android";
            if (userAgent.indexOf("iOS") !== -1) return "iOS";
            return null;
        };
            
        // Get current URL and page info
        const currentUrl = window.location.href;
        const currentPage = "Register"; // Since this is login page

        const hitResponse = await fetch("/api/user/tracking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                affiliate: aff || null,
                referral: refer || null,
                OS: getOS(),
                page: currentPage,
                url: currentUrl,
                userid: null
            })
        });

        const hit = await hitResponse.json()

        console.log(hit.data.HitId)

        // Validate form fields
        if (!formData.userName) newErrors.userName = 'User Name is required';
        if (!formData.email || !validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
        if (!formData.phone || !validatePhone(formData.phone)) newErrors.phone = 'Please enter a valid phone number (10 digits)';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password !== formData.repeatPassword) newErrors.repeatPassword = 'Passwords must match';

        if (!formData.city) newErrors.city = 'City is required';

        // If there are errors, prevent submission and show them
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }


        // Check if the username exists
        const checkResponse = await fetch('/api/user/profile/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ search: formData.email }), // Pass the username to check
        });

        const checkData = await checkResponse.json();

        if (checkData.exists) {
            // Username is already taken
            newErrors.email = "Email already taken";
            setErrors(newErrors);
            return;
        }
        handleOpen();
        try {
            // Sending data to the Next.js API route
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    affiliate: aff,
                    hitid: hit.data.HitId
                }),
            });
            console.log(response)
            if (response.ok) {
                // Handle success (e.g., show success message or redirect)
                const data = await response.json();
                const profileId = data.profileId; // Access the profileId from the response

                if (profileId) {
                    console.log('Profile ID:', profileId);
                    setProfileId(profileId);
                } else {
                    console.log('Profile creation failed, no profileId returned.');
                }
                localStorage.setItem('email', formData?.email);
                localStorage.setItem('userName', formData?.userName);
                localStorage.setItem('password', formData?.password);
                localStorage.setItem('logged_in_profile', profileId);

                console.log('Form submitted successfully!');
            } else {
                // Handle error
                console.log('Error submitting form');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error submitting form');
        }
    };

    const router = useRouter();
    const [open, setOpen] = useState(false);
    const navigate = useRouter();
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleContinue = () => {
        handleClose();
        handleClose();
        navigate.push(`/otp/${profileId}`)
    };

    const [cityLoading, setCityLoading] = useState(false)
    const [openCity, setOpenCity] = useState(false)
    const [cityOption, setCityOption] = useState<CityType[] | []>([])
    const [cityInput, setCityInput] = useState<string | ''>('')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('loginInfo');
            if (token) {
                router.push("/home");
            }

            // Get URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const tokenfrom = urlParams.get("token");
            const aff = urlParams.get("aff");
            const refer = urlParams.get("refer");
        
            if (tokenfrom) {
                localStorage.setItem("loginInfo", tokenfrom);
            }

            // Detect OS
            const getOS = () => {
                const userAgent = window.navigator.userAgent;
                if (userAgent.indexOf("Win") !== -1) return "Windows";
                if (userAgent.indexOf("Mac") !== -1) return "MacOS";
                if (userAgent.indexOf("Linux") !== -1) return "Linux";
                if (userAgent.indexOf("Android") !== -1) return "Android";
                if (userAgent.indexOf("iOS") !== -1) return "iOS";
                return null;
            };

            // Get current URL and page info
            const currentUrl = window.location.href;
            const currentPage = "Login"; // Since this is login page

            if (aff || refer) {
                fetch("/api/user/tracking", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        affiliate: aff,
                        referral: refer,
                        OS: getOS(),
                        page: currentPage,
                        url: currentUrl,
                        userid: null
                    })
                });
            }
        }
    }, []);

    useEffect(() => {
        if (!openCity) {
            setCityOption([])
        }
    }, [openCity])

    useEffect(() => {
        if (!openCity) return
        if (cityInput === '') return

        const fetchData = async () => {
            setCityLoading(true)

            try {
                //API
                console.log(cityInput)
                const response = await fetch(`/api/user/city?city=${cityInput}`);
                if (!response.ok) {
                    console.error('Failed to fetch event data:', response.statusText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const { cities }: { cities: CityType[] } = await response.json();

                const uniqueCities = cities.filter(
                    (city, index, self) =>
                        index === self.findIndex((t) => t.City === city.City)
                );

                setCityOption(uniqueCities);
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setCityLoading(false)
            }
        }

        const delayDebounceFn = setTimeout(() => {
            fetchData()
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [cityInput, openCity])

    return (
        <Box
            sx={{
                backgroundColor: "#000",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <ParticleField />
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "16px",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        color: "#fff",
                        mb: 2,
                        fontWeight: "bold",
                    }}
                >
                    What's your email?
                </Typography>
                <Typography
                    sx={{
                        color: "#aaa",
                        mb: 3,
                    }}
                >
                    We protect our community by making sure everyone on SwingSocial is
                    real
                </Typography>
                <TextField
                    fullWidth
                    label="Email"
                    variant="filled"
                    size="small"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{
                        backgroundColor: '#2a2a2a',
                        input: { color: '#fff' },
                        mb: 2,
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-root': {
                            color: '#FF2D55', // Input text color
                            backgroundColor: 'white', // Input background color
                            '& fieldset': {
                                borderColor: '#FF2D55', // Default border color
                            },
                            '&:hover fieldset': {
                                borderColor: '#FF617B', // Border color on hover
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#7000FF', // Border color when focused
                            },
                            '&.Mui-error fieldset': {
                                borderColor: '#FF0000', // Border color when there's an error
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: '#FF2D55!important', // Default label color
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#7000FF', // Label color when focused
                        },
                        '& .MuiInputLabel-root.Mui-error': {
                            color: '#FF0000', // Label color when there's an error
                        },
                    }}
                />

                <TextField
                    fullWidth
                    label="Name"
                    variant="filled"
                    size="small"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    error={!!errors.userName}
                    helperText={errors.userName}
                    sx={{
                        backgroundColor: '#2a2a2a',
                        input: { color: '#fff' },
                        mb: 2,
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-root': {
                            color: '#FF2D55', // Input text color
                            backgroundColor: 'white', // Input background color
                            '& fieldset': {
                                borderColor: '#FF2D55', // Default border color
                            },
                            '&:hover fieldset': {
                                borderColor: '#FF617B', // Border color on hover
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#7000FF', // Border color when focused
                            },
                            '&.Mui-error fieldset': {
                                borderColor: '#FF0000', // Border color when there's an error
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: '#FF2D55!important', // Default label color
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#7000FF', // Label color when focused
                        },
                        '& .MuiInputLabel-root.Mui-error': {
                            color: '#FF0000', // Label color when there's an error
                        },
                    }}
                />

                <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                        // Add the show/hide password button
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleTogglePasswordVisibility}
                                    edge="end"
                                    style={{ color: 'white' }}
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    label="Password"
                    variant="filled"
                    size="small"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    sx={{
                        backgroundColor: '#2a2a2a',
                        input: { color: '#fff' },
                        mb: 2,
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-root': {
                            color: '#FF2D55', // Input text color
                            backgroundColor: 'white', // Input background color
                            '& fieldset': {
                                borderColor: '#FF2D55', // Default border color
                            },
                            '&:hover fieldset': {
                                borderColor: '#FF617B', // Border color on hover
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#7000FF', // Border color when focused
                            },
                            '&.Mui-error fieldset': {
                                borderColor: '#FF0000', // Border color when there's an error
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: '#FF2D55!important', // Default label color
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#7000FF', // Label color when focused
                        },
                        '& .MuiInputLabel-root.Mui-error': {
                            color: '#FF0000', // Label color when there's an error
                        },
                    }}
                />
                {touched && (
                    <Box sx={{ mb: 3 }}>
                        <LinearProgress
                            variant="determinate"
                            value={validation.password.strength}
                            color={getStrengthColor(validation.password.strength)}
                            sx={{
                                my: 1,
                                height: 8,
                                borderRadius: 4,
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'rgba(255,255,255,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            Password Strength:
                            <span style={{
                                color: theme.palette[getStrengthColor(validation.password.strength)].main
                            }}>
                                {validation.password.strength < 40 && 'Weak'}
                                {validation.password.strength >= 40 && validation.password.strength < 60 && 'Medium'}
                                {validation.password.strength >= 60 && 'Strong'}
                            </span>
                        </Typography>
                    </Box>
                )}

                <TextField
                    fullWidth
                    type={checkPassword ? 'text' : 'password'}
                    InputProps={{
                        // Add the show/hide password button
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleToggleCheckPasswordVisibility}
                                    edge="end"
                                    style={{ color: 'white' }}
                                >
                                    {checkPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    label="Repeat Password"
                    variant="filled"
                    size="small"
                    name="repeatPassword"
                    value={formData.repeatPassword}
                    onChange={handleInputChange}
                    error={!!errors.repeatPassword}
                    helperText={errors.repeatPassword}
                    sx={{
                        backgroundColor: '#2a2a2a',
                        input: { color: '#fff' },
                        mb: 2,
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-root': {
                            color: '#FF2D55', // Input text color
                            backgroundColor: 'white', // Input background color
                            '& fieldset': {
                                borderColor: '#FF2D55', // Default border color
                            },
                            '&:hover fieldset': {
                                borderColor: '#FF617B', // Border color on hover
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#7000FF', // Border color when focused
                            },
                            '&.Mui-error fieldset': {
                                borderColor: '#FF0000', // Border color when there's an error
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: '#FF2D55!important', // Default label color
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#7000FF', // Label color when focused
                        },
                        '& .MuiInputLabel-root.Mui-error': {
                            color: '#FF0000', // Label color when there's an error
                        },
                    }}
                />

                <TextField
                    fullWidth
                    label="Phone"
                    variant="filled"
                    size="small"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    sx={{
                        backgroundColor: '#2a2a2a',
                        input: { color: '#fff' },
                        mb: 2,
                        borderRadius: '4px',
                        '& .MuiOutlinedInput-root': {
                            color: '#FF2D55', // Input text color
                            backgroundColor: 'white', // Input background color
                            '& fieldset': {
                                borderColor: '#FF2D55', // Default border color
                            },
                            '&:hover fieldset': {
                                borderColor: '#FF617B', // Border color on hover
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#7000FF', // Border color when focused
                            },
                            '&.Mui-error fieldset': {
                                borderColor: '#FF0000', // Border color when there's an error
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: '#FF2D55!important', // Default label color
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#7000FF', // Label color when focused
                        },
                        '& .MuiInputLabel-root.Mui-error': {
                            color: '#FF0000', // Label color when there's an error
                        },
                    }}
                />
                <Autocomplete
                    id='autocomplete-filled'
                    open={openCity}
                    clearOnBlur
                    onOpen={() => setOpenCity(true)}
                    onClose={() => setOpenCity(false)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionLabel={(option) => option.City}
                    options={cityOption.map((city) => ({
                        ...city,
                        key: city.id
                    }))}
                    loading={cityLoading}
                    inputValue={cityInput}
                    onInputChange={(event, newInputValue) => {
                        if (event?.type === 'change' || event?.type === 'click')
                            setCityInput(newInputValue)
                    }}
                    onChange={(event, newValue) => {
                        if (newValue?.City)
                            setFormData({
                                ...formData,
                                city: newValue?.City,
                            });
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant='filled'
                            label="City"
                            error={!!errors.city}
                            helperText={errors.city}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {cityLoading ? <CircularProgress color="inherit" size={15} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                            sx={{
                                backgroundColor: '#2a2a2a',
                                input: { color: '#fff' },
                                mb: 3,
                                borderRadius: '4px',
                                '& .MuiOutlinedInput-root': {
                                    color: '#FF2D55', // Input text color
                                    backgroundColor: 'white', // Input background color
                                    '& fieldset': {
                                        borderColor: '#FF2D55', // Default border color
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#FF617B', // Border color on hover
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#7000FF', // Border color when focused
                                    },
                                    '&.Mui-error fieldset': {
                                        borderColor: '#FF0000', // Border color when there's an error
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#FF2D55!important', // Default label color
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#7000FF', // Label color when focused
                                },
                                '& .MuiInputLabel-root.Mui-error': {
                                    color: '#FF0000', // Label color when there's an error
                                },
                            }}
                        />
                    )}
                />

                <Button
                    sx={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: '#c2185b',
                        color: '#fff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '0 auto 16px auto',
                        '&:hover': { backgroundColor: '#ad1457' },
                    }}
                    onClick={handleSubmit}
                >
                    <ArrowForwardIosIcon />
                </Button>
                <Typography
                    sx={{ color: "#c2185b", fontWeight: "bold", fontSize: "1rem" }}
                >
                    Come party with us
                </Typography>
                <Typography
                    sx={{
                        color: "#aaa",
                        fontSize: "0.85rem",
                    }}
                >
                    We never share this with anyone and it won’t be on your profile
                </Typography>
                <Button
                    style={{
                        color: "#c2185b",
                        marginTop: 2,
                        textDecoration: "underline",
                        cursor: "pointer",
                    }}
                    onClick={(e) => {
                        e.preventDefault(); // Prevent the default behavior of the anchor tag
                        router.push('/login'); // Use router.push for navigation
                    }}
                >
                    Already registered? Click here to Login
                </Button>
            </Box>
            {/* Dialog Component */}
            <Dialog
                open={open}
                onClose={handleClose}
                sx={{
                    "& .MuiPaper-root": {
                        backgroundColor: "#fff",
                        padding: "16px",
                        borderRadius: "12px",
                        textAlign: "center",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        color: "#000",
                        fontWeight: "bold",
                    }}
                >
                    Email Verification
                </DialogTitle>
                <DialogContent
                    sx={{
                        color: "#333",
                        mb: 2,
                        fontStyle: "italic"
                    }}
                >
                    <p>We sent a code to your email.  Please check your inbox.  </p>
                    <p>Don't see it?  Check your Spam folder.</p>
                </DialogContent>
                <DialogActions sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Button
                        fullWidth
                        sx={{
                            backgroundColor: "#c2185b",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#ad1457" },
                            fontWeight: "bold",
                        }}
                        onClick={handleContinue}
                    >
                        Continue
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        sx={{
                            borderColor: "#c2185b",
                            color: "#c2185b",
                            fontWeight: "bold",
                            "&:hover": { backgroundColor: "#f8f8f8" },
                        }}
                        onClick={handleClose}
                    >
                        Back
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}
