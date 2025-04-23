"use client";

import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    IconButton,
    InputAdornment,
    ThemeProvider,
    createTheme,
    LinearProgress,
    Chip,
    Divider,
    Modal,
    Backdrop,
    Alert,
    Stack,
    tooltipClasses,
    Tooltip,
    styled,
    CircularProgress,
    TooltipProps,
    Grid
} from '@mui/material';
import { useMediaQuery } from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Favorite,
    Facebook,
    Google,
    Apple,
    LocationOn,
    Password,
    Check,
    Error,
    CheckCircle,
    Info,
    ConstructionOutlined,
    Token,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useRouter } from "next/navigation";
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import { jwtDecode } from 'jwt-decode';
import { userAgentFromString } from 'next/server';
import Slider from "react-slick"; // Import the react-slick slider
import "slick-carousel/slick/slick.css"; // Import the slick carousel CSS
import "slick-carousel/slick/slick-theme.css"; // Import the slick carousel theme CSS


// Create a custom theme with a sophisticated color palette
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

// Custom styled tooltip
const ValidationTooltip = styled(({ className, ...props }: TooltipProps & { className?: string }) => (
    <Tooltip
        {...props}
        classes={{ popper: className }}
        PopperProps={{
            modifiers: [
                {
                    name: 'preventOverflow',
                    options: {
                        altAxis: true,
                        tether: false,
                        padding: 8
                    },
                },
            ],
        }}
    />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: theme.spacing(1.5),
        [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(2),
        },
        maxWidth: {
            xs: '250px',
            sm: '300px',
            md: '320px',
        },
        borderRadius: theme.shape.borderRadius,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    [`& .${tooltipClasses.arrow}`]: {
        color: 'rgba(0, 0, 0, 0.85)',
    },
}));

interface ValidationState {
    email: {
        error: boolean;
        message: string;
    };
    password: {
        error: boolean;
        message: string;
    };
}

interface RestValidationState {
    resetUserName: {
        error: boolean;
        message: string;
    };

    resetPassword: {
        error: boolean;
        message: string;
    }

}

// Particle animation component
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

// 3D Card component
const RotatingCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    // const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    //     if (!cardRef.current) return;
    //     const rect = cardRef.current.getBoundingClientRect();
    //     const x = (e.clientY - rect.top) / rect.height - 0.5;
    //     const y = (e.clientX - rect.left) / rect.width - 0.5;
    //     setRotation({ x: x * 20, y: y * 20 });
    // };

    // const handleMouseLeave = () => {
    //     setRotation({ x: 0, y: 0 });
    // };

    return (
        <Box
            ref={cardRef}
            // onMouseMove={handleMouseMove}
            // onMouseLeave={handleMouseLeave}
            sx={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
            }}
        >
            <Box
                sx={{
                    transition: 'transform 0.1s ease-out',
                    transform: `rotateX(${-rotation.x}deg) rotateY(${rotation.y}deg)`,
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

// Main Login Component
const LoginPage: React.FC = () => {
    const router = useRouter();
    const isMobile = useMediaQuery('(max-width:600px)');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState(false);
    const [resStatus, setResStatus] = useState<string>("");
    const [resetUserName, setResetUserName] = useState<string>("");
    const [resetPassword, setResetPassword] = useState<string>("");
    const [validation, setValidation] = useState<ValidationState>({
        email: {
            error: false,
            message: '',
        },
        password: {
            error: false,
            message: '',
        }
    });

    useEffect(() => {

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('loginInfo');
            if (token) {
                router.push("/home");
            }

            const urlParams = new URLSearchParams(window.location.search);
            const tokenfrom = urlParams.get("token");
        
            if (tokenfrom) {
            // Store the token in localStorage or use it for authentication
                localStorage.setItem("loginInfo", tokenfrom);
                // window.location.reload();
        
            // Optionally, make an API call to verify the token or fetch user data
            }
        }
    }, []);

        
    const [resetValidation, setResetValidation] = useState<RestValidationState>({
        resetUserName: {
            error: false,
            message: '',
        },
        resetPassword: {
            error: false,
            message: '',
        }
    })

    const handleClose = (
        event: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const [touched, setTouched] = useState({
        email: false,
        password: false,
    });

    const PasswordRequirements = (password: string) => {

        if (!password) {
            return {
                error: true,
                message: "Please enter a password"
            };
        }
        else {
            return {
                error: false,
                message: '',
            };
        }
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return {
                error: true,
                message: 'Email is required',
            };
        }

        return {
            error: false,
            message: '',
        };
    };

    const validateResetUserName = (email: string) => {
        if (!email) {
            return {
                error: true,
                message: 'Email is required',
            }
        }

        return {
            error: false,
            message: '',
        }
    }

    const validateResetPassword = (password: string) => {
        if (!password) {
            return {
                error: true,
                message: 'Password is required',
            }
        }

        return {
            error: false,
            message: '',
        }
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value.trim();
        setEmail(newEmail);
        if (touched.email) {
            setValidation(prev => ({
                ...prev,
                email: validateEmail(newEmail),
            }));
        }
    };

    const handleResetUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUserName = e.target.value.trim();
        console.log(newUserName);
        setResetUserName(newUserName);
        setResetValidation(prev => ({
            ...prev,
            resetUserName: validateResetUserName(newUserName),
        }))
    };

    const handleResetPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value.trim();
        setResetPassword(password);
        setResetValidation(prev => ({
            ...prev,
            resetPassword: validateResetPassword(password),
        }))
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value.trim();
        setPassword(newPassword);
        if (touched.password) {
            setValidation(prev => ({
                ...prev,
                password: PasswordRequirements(password),
            }))
        }
        // Removed password validation logic
    };

    const handleResetPassword = async () => {

        const resetValidation = validateResetUserName(resetUserName);
        const resetPasswordValidation = validateResetPassword(resetPassword);

        setResetValidation({
            resetUserName: resetValidation,
            resetPassword: resetPasswordValidation
        })

        if (!resetValidation.error && !resetPasswordValidation.error) {
            const payload = {
                userName: resetUserName,
                pwd: resetPassword
            }

            try {
                const result = await fetch("/api/user/resetPassword", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const data = await result.json();
                await new Promise(resolve => setTimeout(resolve, 2000));
                // Handle successful login
                console.log(data);
                setMessage(data.message);
                if (data.status == 404) {
                    console.log("==========>");
                    setOpen(true);
                }
                else if (data.status == 500) {
                    console.log("==========>");
                    setOpen(true);
                }
                else {
                    setOpen(true);
                    setShowLocationModal(false);
                    router.push("/login");
                }

            } catch (error) {
                console.log(error);
            }
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Validate all fields
        const emailValidation = validateEmail(email);
        const passwordValidation = PasswordRequirements(password);

        setValidation({
            email: emailValidation,
            password: passwordValidation,
        });

        setTouched({
            email: true,
            password: true,
        });

        if (!emailValidation.error && !passwordValidation.error) {
            setLoading(true);
            try {
                // Simulate API call

                const payload = {
                    email: email,
                    pwd: password
                }

                const result = await fetch("/api/user/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
                console.log(result);
                const data = await result.json();
                await new Promise(resolve => setTimeout(resolve, 2000));
                // Handle successful login

                setMessage(data.message);
                if (data.status == 404) {
                    console.log("==========>");
                    setOpen(true);
                }
                else if (data.status == 500) {
                    console.log("==========>");
                    setOpen(true);
                }
                else {
                    setOpen(true);
                    // const token = jwt.sign({ profileId: data.profileId }, JWT_SECRET, { expiresIn: '24h' });
                    console.log(data.jwtToken);
                    const decoded = jwtDecode(data.jwtToken);
                    localStorage.setItem('loginInfo', data.jwtToken);
                    localStorage.setItem('logged_in_profile', data.currentProfileId);
                    localStorage.setItem('profileUsername', data.currentuserName);
                    router.push("/home");
                }
                console.log(data);
                console.log('Login successful');
            } catch (error) {
                console.error('Login failed:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // const sendEmail = () => {
    //     const result = await fetch("/api/user/login", {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json"
    //                 },
    //                 body: JSON.stringify(payload)
    //             });
    // }

    const getStrengthColor = (strength: number) => {
        if (strength < 40) return 'error';
        if (strength < 60) return 'warning';
        return 'success';
    };

    const SocialButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
        <Button
            fullWidth
            variant="outlined"
            startIcon={icon}
            sx={{
                my: 1,
                py: 1.5,
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                },
            }}
        >
            {label}
        </Button>
    );

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    return (
        <ThemeProvider theme={theme}>
            <Slider {...sliderSettings}>
                {[
                    { img: "/slider/1.jpg", text: "Slide 1 Text" },
                    { img: "/slider/2.jpg", text: "Slide 2 Text" },
                    { img: "/slider/3.jpg", text: "Slide 3 Text" },
                    { img: "/slider/4.jpg", text: "Slide 4 Text" },
                    { img: "/slider/5.jpg", text: "Slide 5 Text" },
                    { img: "/slider/6.jpg", text: "Slide 6 Text" },
                ].map((slide, index) => (
                    <Box key={index} sx={{ position: "relative" }}>
                        <img
                            src={slide.img}
                            alt={`Slide ${index + 1}`}
                            style={{
                                width: "100%",
                                height: isMobile ? "200px" : "1000px", // Reduce height on mobile
                                objectFit: "cover",
                            }}
                        />
                        <Typography
                            variant="h4"
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign: "center",
                                background: "rgba(0, 0, 0, 0.5)", // Optional background overlay
                                color: "white",
                                padding: "10px",
                                fontSize: isMobile ? "1.2em" : "2.5em", // Adjust font size for mobile
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "100%",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: isMobile ? "1.5em" : "2em", // Adjust size for mobile
                                        color: "white",
                                        margin: 0,
                                        textShadow: "3px 3px 5px rgba(0, 0, 0, 0.5)",
                                        fontWeight: "bold",
                                    }}
                                >
                                    The best social platform for swingers
                                </p>

                                <h5
                                    style={{
                                        color: "#df95bc",
                                        marginTop: isMobile ? "10px" : "50px",
                                        textShadow: "2px 2px 5px rgba(0, 0, 0, 0.5)",
                                    }}
                                >
                                    The fastest growing swinger and kink community
                                </h5>

                                <h5
                                    style={{
                                        color: "#df95bc",
                                        margin: 0,
                                        textShadow: "2px 2px 5px rgba(0, 0, 0, 0.5)",
                                    }}
                                >
                                    Built by swingers for swingers
                                </h5>
                            </div>
                        </Typography>
                    </Box>
                ))}
            </Slider>                    
            <Box
                sx={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'radial-gradient(circle at top left, #1A0B2E 0%, #000000 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <ParticleField />



                <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                    
                    <RotatingCard>
                        <Paper
                            elevation={24}
                            sx={{
                                p: 4,
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            <Box sx={{ mb: 4, textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 2,
                                        animation: 'slideDown 1s ease-out',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src="/icon.png"
                                        alt="Logo"
                                        sx={{
                                            width: '50px',
                                            height: 'auto',
                                        }}
                                    />
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            background: 'linear-gradient(45deg, #FF2D55, #7000FF)',
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent',
                                        }}
                                    >
                                        SwingSocial
                                    </Typography>
                                </Box>

                                {/* <Chip
                                    icon={<LocationOn />}
                                    label="Enable Location"
                                    onClick={() => setShowLocationModal(true)}
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        color: 'white',
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                                    }}
                                /> */}
                            </Box>

                            

                            <Box component="form" onSubmit={handleSubmit}>
                                <ValidationTooltip
                                    open={touched.email && validation.email.error}
                                    title={validation.email.message}
                                    placement="right"
                                >
                                    <TextField
                                        fullWidth
                                        label="Email or Username"
                                        variant="outlined"
                                        value={email}
                                        onChange={handleEmailChange}
                                        onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                                        error={touched.email && validation.email.error}
                                        sx={{
                                            mb: 2,
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255,255,255,0.2)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255,255,255,0.4)',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'rgba(255,255,255,0.7)',
                                            },
                                        }}
                                    />
                                </ValidationTooltip>

                                <ValidationTooltip
                                    open={touched.password && validation.password.error}
                                    title={validation.password.message}
                                    placement="right"
                                >
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            mb: 1,
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255,255,255,0.2)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255,255,255,0.4)',
                                                },
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'rgba(255,255,255,0.7)',
                                            },
                                        }}
                                    />
                                </ValidationTooltip>

                                {(validation.email.error || validation.password.error) && touched.email && touched.password && (
                                    <Alert
                                        severity="error"
                                        sx={{
                                            mb: 2,
                                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                            color: '#ff1744',
                                        }}
                                    >
                                        Please fix the validation errors before proceeding
                                    </Alert>
                                )}

                                <Button
                                    fullWidth
                                    type="submit"
                                    disabled={loading}
                                    sx={{
                                        py: 1.5,
                                        mb: 2,
                                        my: 3,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        color: 'white',
                                        background: 'linear-gradient(45deg, #FF2D55, #7000FF)',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: '-100%',
                                            width: '200%',
                                            height: '100%',
                                            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)',
                                            animation: 'shine 2s infinite',
                                        },
                                        '@keyframes shine': {
                                            '100%': {
                                                left: '100%',
                                            },
                                        },
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                                {/* <Divider sx={{ my: 3, color: 'rgba(255,255,255,0.3)' }}>
                                    or continue with
                                </Divider>

                                <Box sx={{ mt: 2 }}>
                                    <SocialButton icon={<Google />} label="Google" />
                                    <SocialButton icon={<Facebook />} label="Facebook" />
                                    <SocialButton icon={<Apple />} label="Apple" />
                                </Box> */}

                                <Typography
                                    sx={{
                                        mt: 3,
                                        textAlign: 'center',
                                        color: 'rgba(255,255,255,0.7)',
                                        '& a': {
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            position: 'relative',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                width: '100%',
                                                height: '2px',
                                                bottom: -2,
                                                left: 0,
                                                background: 'linear-gradient(45deg, #FF2D55, #7000FF)',
                                                transform: 'scaleX(0)',
                                                transition: 'transform 0.3s ease',
                                                transformOrigin: 'right',
                                            },
                                            '&:hover::after': {
                                                transform: 'scaleX(1)',
                                                transformOrigin: 'left',
                                            },
                                        },
                                    }}
                                >
                                    New to Swing Social? <a href="/registeradmin">Create an account</a>
                                </Typography>
                                <Typography
                                    onClick={() => { setShowLocationModal(true) }}
                                    sx={{
                                        mt: 1,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        color: '#FF2D55',
                                        '& a': {
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            position: 'relative',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                width: '100%',
                                                height: '2px',
                                                bottom: -2,
                                                left: 0,
                                                background: 'linear-gradient(45deg, #FF2D55, #7000FF)',
                                                transform: 'scaleX(0)',
                                                transition: 'transform 0.3s ease',
                                                transformOrigin: 'right',
                                            },
                                            '&:hover::after': {
                                                transform: 'scaleX(1)',
                                                transformOrigin: 'left',
                                            },
                                        },
                                    }}
                                >
                                    Forget Password? Reset your password
                                </Typography>
                                {/* <Typography
                                    onClick={() => sendEmail()}
                                    sx={{
                                        mt: 1,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        color: '#FF2D55',
                                        '& a': {
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            position: 'relative',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                width: '100%',
                                                height: '2px',
                                                bottom: -2,
                                                left: 0,
                                                background: 'linear-gradient(45deg, #FF2D55, #7000FF)',
                                                transform: 'scaleX(0)',
                                                transition: 'transform 0.3s ease',
                                                transformOrigin: 'right',
                                            },
                                            '&:hover::after': {
                                                transform: 'scaleX(1)',
                                                transformOrigin: 'left',
                                            },
                                        },
                                    }}
                                >
                                    Forget Password? Reset your password
                                </Typography> */}
                            </Box>
                        </Paper>
                    </RotatingCard>
                </Container>

                <Modal
                    open={showLocationModal}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                        timeout: 500,
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 24,
                            p: 4,
                            textAlign: 'center',
                        }}
                    >
                        <Password sx={{ fontSize: 48, color: 'primary.main' }} />
                        <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 2 }}>
                            Reset your Password
                        </Typography>
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            value={resetUserName}
                            onChange={handleResetUserNameChange}
                            error={resetValidation.resetUserName.error}
                            helperText={resetValidation.resetUserName.error ? resetValidation.resetUserName.message : ''}
                            sx={{
                                mb: 2,
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
                            label="Password"
                            variant="outlined"
                            type='password'
                            value={resetPassword}
                            onChange={handleResetPasswordChange}
                            error={resetValidation.resetPassword.error}
                            helperText={resetValidation.resetPassword.error ? resetValidation.resetPassword.message : ''}
                            sx={{
                                mb: 2,
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
                        <Typography sx={{ mb: 3 }}>
                            You can reset your password in a few seconds!
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleResetPassword}
                            startIcon={<Password />}
                            sx={{
                                background: 'linear-gradient(45deg, #FF2D55, #7000FF)',
                                py: 1.5,
                                px: 4,
                            }}
                        >
                            Reset your password
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => { router.push('/login'); setShowLocationModal(false); }}
                            startIcon={<Check />}
                            sx={{
                                background: 'linear-gradient(45deg, #FF2D55, #7000FF)',
                                py: 1.5,
                                px: 4,
                                mt: 1
                            }}
                        >
                            Go to Login
                        </Button>
                    </Box>
                </Modal>
            </Box>
            {isMobile ? (
  // Mobile Layout: Text below images with smaller font size
  <div style={{ padding: "20px" }}>
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // height: "100%",
          }}
        >
          <img
            width={300}
            height={300}
            src="/slider/1.jpg"
            style={{ borderRadius: "50%", marginBottom: "20px" }}
          />
        </Box>
        <Box>
          <Typography
            variant="h6" // Use a smaller variant for mobile
            sx={{
              color: "white",
              textAlign: "center",
              fontSize: "14px", // Reduce font size for mobile
            }}
          >
            <p style={{ padding: "20px 0px", color: "#c3317d", fontSize: "16px" }}>
              <h3>Find local swingers</h3> {/* Use smaller heading */}
            </p>
            <p>
              <li>Search couples and singles nearby using precise geographic location...</li>
            </p>
            <p>
              <li>Filter by age, gender, kinks, and more...</li>
            </p>
            <p>
              <li>View your matches, likes, and who likes you...</li>
            </p>
            <p>
              <li>View recently online by location in our Pineapple...</li>
            </p>
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // height: "100%",
          }}
        >
          <img
            width={300}
            height={300}
            src="/slider/2.jpg"
            style={{ borderRadius: "50%", marginBottom: "20px" }}
          />
        </Box>
        <Box>
          <Typography
            variant="h6" // Use a smaller variant for mobile
            sx={{
              color: "white",
              textAlign: "center",
              fontSize: "14px", // Reduce font size for mobile
            }}
          >
            <p style={{ padding: "20px 0px", color: "#c3317d", fontSize: "16px" }}>
              <h3>Connect with others near you</h3> {/* Use smaller heading */}
            </p>
            <p>
              <li>Send real-time messages with IM chat</li>
            </p>
            <p>
              <li>View and attend local events</li>
            </p>
            <p>
              <li>Post media in Whats Hot</li>
            </p>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  </div>
) : (
  // Desktop Layout: Current code
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      padding: "0px 200px 0px 200px",
    }}
  >
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <img
            width={400}
            height={400}
            src="/slider/1.jpg"
            style={{ borderRadius: "50%" }}
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="h5" sx={{ color: "white" }}>
            <p style={{ padding: "20px 0px", color: "#c3317d" }}>
              <h2>Find local swingers</h2>
            </p>
            <p>
              <li>Search couples and singles nearby using precise geographic location...</li>
            </p>
            <p>
              <li>Filter by age, gender, kinks, and more...</li>
            </p>
            <p>
              <li>View your matches, likes, and who likes you...</li>
            </p>
            <p>
              <li>View recently online by location in our Pineapple...</li>
            </p>
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography variant="h5" sx={{ color: "white" }}>
            <p style={{ padding: "20px 0px", color: "#c3317d" }}>
              <h2>Connect with others near you</h2>
            </p>
            <p>
              <li>Send real-time messages with IM chat</li>
            </p>
            <p>
              <li>View and attend local events</li>
            </p>
            <p>
              <li>Post media in Whats Hot</li>
            </p>
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <img
            width={400}
            height={400}
            src="/slider/2.jpg"
            style={{ borderRadius: "50%", marginBottom: "20px" }}
          />
        </Box>
      </Grid>
    </Grid>
  </div>
)}
            <Snackbar
                open={open} // Control this with state in a real application
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                autoHideDuration={5000}
                onClose={handleClose}
            >
                <Alert
                    severity="success" // Change severity as needed (e.g., "error", "warning", "info")
                    sx={{
                        backgroundColor: 'white',
                        color: '#fc4c82',
                        fontWeight: 'bold',
                        alignItems: 'center', // Align items vertically
                        borderRight: '5px solid #fc4c82'
                    }}
                    icon={
                        <Box
                            component="img"
                            src="/icon.png" // Path to your image
                            alt="Logo"
                            sx={{
                                width: '20px',
                                height: '20px',
                            }}
                        />
                    }
                >
                    {message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
};

export default LoginPage;