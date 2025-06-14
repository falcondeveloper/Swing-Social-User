"use client";

import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Divider,
    FormControlLabel,
    Checkbox,
    Slider,
    CircularProgress,
    TextField,
    Autocomplete,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Chip,
    styled,
    createTheme,
    ThemeProvider,
    useMediaQuery,
    Stack,
    Fade,
    Alert,
    Snackbar,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, MapPin, Users, Eye, Shield } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface FormDataType {
    city: string;
    swiping: {
        couples: boolean;
        singleMale: boolean;
        singleFemale: boolean;
    };
    maxDistance: number;
    distanceChecked: boolean;
    block: {
        couples: boolean;
        singleMale: boolean;
        singleFemale: boolean;
    };
}

// Enhanced theme matching profile page
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: "#FF1B6B",
            dark: "#c2185b",
        },
        secondary: {
            main: "#03dac5",
        },
        background: {
            default: "#121212",
            paper: "#1e1e1e",
        },
        text: {
            primary: "#ffffff",
            secondary: "#aaaaaa",
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            fontSize: "2rem",
            color: "white",
        },
        h6: {
            fontWeight: 600,
            color: "#FF1B6B",
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                contained: {
                    background: 'linear-gradient(135deg, #FF1B6B 0%, #c2185b 100%)',
                    boxShadow: '0 4px 15px rgba(255, 27, 107, 0.25)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #c2185b 0%, #d81160 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(255, 27, 107, 0.35)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'rgba(30, 30, 30, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(30, 30, 30, 0.8)',
                        borderRadius: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.12)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 27, 107, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#FF1B6B',
                            borderWidth: '2px',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: '#aaaaaa',
                        '&.Mui-focused': {
                            color: '#FF1B6B',
                        },
                    },
                    '& .MuiOutlinedInput-input': {
                        color: '#ffffff',
                    },
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: "rgba(255, 255, 255, 0.5)",
                    "&.Mui-checked": { 
                        color: "#FF1B6B" 
                    },
                },
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    color: "#FF1B6B",
                    "& .MuiSlider-thumb": { 
                        borderRadius: "50%",
                        backgroundColor: "#FF1B6B",
                        border: "2px solid #fff",
                        boxShadow: "0 4px 8px rgba(255, 27, 107, 0.3)",
                    },
                    "& .MuiSlider-track": {
                        backgroundColor: "#FF1B6B",
                    },
                    "& .MuiSlider-rail": {
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                    },
                    "& .MuiSlider-markLabel": {
                        color: "white",
                        fontSize: "0.75rem",
                    },
                },
            },
        },
    },
});

const PreferenceCard = styled(Card)(({ theme }) => ({
    marginBottom: '24px',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(255, 27, 107, 0.15)',
    },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
}));

const IconContainer = styled(Box)(({ theme }) => ({
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 27, 107, 0.1)',
    border: '1px solid rgba(255, 27, 107, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

export default function Preferences() {
    const [profileId, setProfileId] = useState<any>();
    const router = useRouter();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [showDistanceSlider, setShowDistanceSlider] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [cityLoading, setCityLoading] = useState(false);
    const [openCity, setOpenCity] = useState(false);
    const [cityOption, setCityOption] = useState<any>([]);
    const [savedOptions, setSavedOptions] = useState<any>(null);
    const [cityInput, setCityInput] = useState<string>("");
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const [formData, setFormData] = useState<FormDataType>({
        city: "",
        swiping: {
            couples: false,
            singleMale: false,
            singleFemale: false,
        },
        maxDistance: 500,
        distanceChecked: false,
        block: {
            couples: false,
            singleMale: false,
            singleFemale: false,
        },
    });

    const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedProfileId = localStorage.getItem("logged_in_profile");
            setProfileId(storedProfileId);
            
            if (storedProfileId) {
                handleGetPreferences(storedProfileId);
            } else {
                // No profile ID found, set defaults and stop loading
                setLoading(false);
                showSnackbar("No profile found. Please log in again.", "error");
            }
        }
    }, []);

    // Fallback timeout to prevent infinite loading
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading) {
                setLoading(false);
                showSnackbar("Loading timed out. Using default settings.", "error");
                // Set default options if still loading after timeout
                setSavedOptions({
                    CityState: "",
                    Couples: 0,
                    SingleMales: 0,
                    SingleFemales: 0,
                    Distance: 500,
                    UseDistance: 0,
                    BlockCouples: 0,
                    BlockSingleMales: 0,
                    BlockSingleFemales: 0
                });
            }
        }, 5000); // 5 second timeout
        
        return () => clearTimeout(timeout);
    }, [loading]);

    useEffect(() => {
        if (savedOptions) {
            setFormData({
                city: savedOptions.CityState || "",
                swiping: {
                    couples: savedOptions.Couples === 1,
                    singleMale: savedOptions.SingleMales === 1,
                    singleFemale: savedOptions.SingleFemales === 1,
                },
                maxDistance: savedOptions.Distance || 500,
                distanceChecked: savedOptions.UseDistance === 1,
                block: {
                    couples: savedOptions.BlockCouples === 1,
                    singleMale: savedOptions.BlockSingleMales === 1,
                    singleFemale: savedOptions.BlockSingleFemales === 1,
                },
            });

            setShowDistanceSlider(savedOptions.UseDistance === 1);
            setLoading(false);
        }
    }, [savedOptions]);

    useEffect(() => {
        if (!openCity) {
            setCityOption([]);
        }
    }, [openCity]);

    useEffect(() => {
        if (!openCity) return;
        if (cityInput === "") return;

        const fetchData = async () => {
            setCityLoading(true);

            try {
                const response = await fetch(`/api/user/city?city=${cityInput}`);
                if (!response.ok) {
                    console.error("Failed to fetch city data:", response.statusText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const { cities }: { cities: any } = await response.json();

                const uniqueCities = cities.filter(
                    (city: any, index: any, self: any) =>
                        index === self.findIndex((t: any) => t.City === city.City)
                );

                setCityOption(uniqueCities);
            } catch (error) {
                console.error("Error fetching city data:", error);
                showSnackbar("Failed to fetch city data", "error");
            } finally {
                setCityLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [cityInput, openCity]);

    const handleGetPreferences = async (userId: any) => {
        try {
            const checkResponse = await fetch("/api/user/preference", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: userId,
                }),
            });
            const checkData = await checkResponse.json();
            
            if (checkData && checkData.data && checkData.data[0] && checkData.data[0].get_preferences) {
                setSavedOptions(checkData.data[0].get_preferences);
            } else {
                // Set default options if no preferences found
                setSavedOptions({
                    CityState: "",
                    Couples: 0,
                    SingleMales: 0,
                    SingleFemales: 0,
                    Distance: 500,
                    UseDistance: 0,
                    BlockCouples: 0,
                    BlockSingleMales: 0,
                    BlockSingleFemales: 0
                });
            }
        } catch (error) {
            console.error("Error fetching preferences:", error);
            showSnackbar("Failed to load preferences", "error");
            // Set default options on error
            setSavedOptions({
                CityState: "",
                Couples: 0,
                SingleMales: 0,
                SingleFemales: 0,
                Distance: 500,
                UseDistance: 0,
                BlockCouples: 0,
                BlockSingleMales: 0,
                BlockSingleFemales: 0
            });
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;

        const [section, key] = name.split(".");

        if (
            section in formData &&
            key in (formData[section as keyof FormDataType] as object)
        ) {
            setFormData((prevState) => ({
                ...prevState,
                [section]: {
                    ...(prevState[section as keyof FormDataType] as object),
                    [key]: checked,
                },
            }));
        }
    };

    const handleSliderChange = (event: Event, value: number | number[]) => {
        setFormData((prevState) => ({
            ...prevState,
            maxDistance: value as number,
        }));
    };

    const handleCityChange = (event: any, newValue: any) => {
        if (newValue?.City) {
            setFormData((prevState) => ({
                ...prevState,
                city: newValue?.City,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch('/api/user/preference/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ loginId: profileId, payload: formData })
            });

            const data = await response.json();

            if (data.status === 200) {
                showSnackbar('Preferences updated successfully!');
                setTimeout(() => {
                    router.push('/members');
                }, 1500);
            } else {
                showSnackbar(data.message || 'Failed to update preferences', 'error');
            }
        } catch (error) {
            console.error(error);
            showSnackbar('Failed to update preferences', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ThemeProvider theme={theme}>
                <Box sx={{ bgcolor: '#121212', minHeight: '100vh' }}>
                    <Header />
                    <Container maxWidth="lg" sx={{ py: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                            <CircularProgress sx={{ color: '#FF1B6B' }} />
                        </Box>
                    </Container>
                    <Footer />
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ bgcolor: '#121212', minHeight: '100vh' }}>
                <Header />
                
                <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Button
                            onClick={() => router.back()}
                            startIcon={<ArrowLeft />}
                            sx={{
                                mb: 3,
                                color: "rgba(255, 255, 255, 0.7)",
                                "&:hover": {
                                    color: "#fff",
                                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                                },
                            }}
                        >
                            Back
                        </Button>

                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                                Preferences
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#aaaaaa' }}>
                                Customize your experience and who can see you
                            </Typography>
                        </Box>
                    </Box>

                    <Fade in={!loading}>
                        <Box>
                            {/* Visibility Preferences */}
                            <PreferenceCard>
                                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                    <SectionHeader>
                                        <IconContainer>
                                            <Eye size={20} color="#FF1B6B" />
                                        </IconContainer>
                                        <Box>
                                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                                Visibility Settings
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#aaaaaa' }}>
                                                Who can see me when they are swiping or searching?
                                            </Typography>
                                        </Box>
                                    </SectionHeader>

                                    <Grid container spacing={2}>
                                        {[
                                            { key: "couples", label: "Couples" },
                                            { key: "singleMale", label: "Single Males" },
                                            { key: "singleFemale", label: "Single Females" }
                                        ].map(({ key, label }) => (
                                            <Grid item xs={12} sm={4} key={key}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            name={`swiping.${key}`}
                                                            checked={(formData.swiping as any)[key]}
                                                            onChange={handleChange}
                                                        />
                                                    }
                                                    label={label}
                                                    sx={{ 
                                                        color: "white",
                                                        '& .MuiFormControlLabel-label': {
                                                            fontSize: '0.9rem',
                                                            fontWeight: 500
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </PreferenceCard>

                            {/* Distance Preferences */}
                            <PreferenceCard>
                                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                    <SectionHeader>
                                        <IconContainer>
                                            <MapPin size={20} color="#FF1B6B" />
                                        </IconContainer>
                                        <Box>
                                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                                Distance Settings
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#aaaaaa' }}>
                                                Maximum distance to profiles during swiping
                                            </Typography>
                                        </Box>
                                    </SectionHeader>

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={showDistanceSlider}
                                                onChange={() => {
                                                    setShowDistanceSlider((prev) => !prev);
                                                    setFormData(prev => ({ ...prev, distanceChecked: !prev.distanceChecked }));
                                                }}
                                            />
                                        }
                                        label="Enable distance filter"
                                        sx={{ 
                                            color: "white", 
                                            mb: showDistanceSlider ? 3 : 0,
                                            '& .MuiFormControlLabel-label': {
                                                fontSize: '0.9rem',
                                                fontWeight: 500
                                            }
                                        }}
                                    />

                                    {showDistanceSlider && (
                                        <Box sx={{ px: 2 }}>
                                            <Typography variant="body2" sx={{ color: '#aaaaaa', mb: 2 }}>
                                                Current distance: {formData.maxDistance} miles
                                            </Typography>
                                            <Slider
                                                value={formData.maxDistance}
                                                min={0}
                                                max={150}
                                                onChange={handleSliderChange}
                                                valueLabelDisplay="auto"
                                                marks={[
                                                    { value: 0, label: "0" },
                                                    { value: 50, label: "50" },
                                                    { value: 100, label: "100" },
                                                    { value: 150, label: "150 Miles" },
                                                ]}
                                            />
                                        </Box>
                                    )}
                                </CardContent>
                            </PreferenceCard>

                            {/* Blocking Preferences */}
                            <PreferenceCard>
                                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                    <SectionHeader>
                                        <IconContainer>
                                            <Shield size={20} color="#FF1B6B" />
                                        </IconContainer>
                                        <Box>
                                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                                Block Settings
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#aaaaaa' }}>
                                                Who should I block when I am swiping?
                                            </Typography>
                                        </Box>
                                    </SectionHeader>

                                    <Grid container spacing={2}>
                                        {[
                                            { key: "couples", label: "Couples" },
                                            { key: "singleMale", label: "Single Males" },
                                            { key: "singleFemale", label: "Single Females" }
                                        ].map(({ key, label }) => (
                                            <Grid item xs={12} sm={4} key={key}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            name={`block.${key}`}
                                                            checked={(formData.block as any)[key]}
                                                            onChange={handleChange}
                                                        />
                                                    }
                                                    label={label}
                                                    sx={{ 
                                                        color: "white",
                                                        '& .MuiFormControlLabel-label': {
                                                            fontSize: '0.9rem',
                                                            fontWeight: 500
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </PreferenceCard>

                            {/* Location Blocking */}
                            <PreferenceCard>
                                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                    <SectionHeader>
                                        <IconContainer>
                                            <MapPin size={20} color="#FF1B6B" />
                                        </IconContainer>
                                        <Box>
                                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                                Location Blocking
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#aaaaaa' }}>
                                                Block users from specific locations
                                            </Typography>
                                        </Box>
                                    </SectionHeader>

                                    <Autocomplete
                                        open={openCity}
                                        clearOnBlur
                                        onOpen={() => setOpenCity(true)}
                                        onClose={() => setOpenCity(false)}
                                        isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                                        getOptionLabel={(option: any) => option.City}
                                        options={cityOption.map((city: any) => ({
                                            ...city,
                                            key: city.id,
                                        }))}
                                        loading={cityLoading}
                                        inputValue={cityInput}
                                        onInputChange={(event: any, newInputValue: any) => {
                                            if (event?.type === "change" || event?.type === "click")
                                                setCityInput(newInputValue);
                                        }}
                                        onChange={handleCityChange}
                                        renderInput={(params: any) => (
                                            <TextField
                                                {...params}
                                                label="Enter city to block"
                                                error={!!errors.city}
                                                helperText={errors.city}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: <MapPin size={20} color="#aaaaaa" style={{ marginRight: 8 }} />,
                                                    endAdornment: (
                                                        <>
                                                            {cityLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                </CardContent>
                            </PreferenceCard>

                            {/* Save Button */}
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => router.push('/profile')}
                                    sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'white',
                                        px: 4,
                                        py: 1.5,
                                        "&:hover": {
                                            borderColor: '#FF1B6B',
                                            backgroundColor: 'rgba(255, 27, 107, 0.1)',
                                        },
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    startIcon={saving ? <CircularProgress size={16} /> : <Settings size={16} />}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Preferences'}
                                </Button>
                            </Box>
                        </Box>
                    </Fade>
                </Container>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                        severity={snackbar.severity}
                        sx={{
                            bgcolor: snackbar.severity === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            color: snackbar.severity === 'success' ? '#4caf50' : '#f44336',
                            border: `1px solid ${snackbar.severity === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

                <Footer />
            </Box>
        </ThemeProvider>
    );
}