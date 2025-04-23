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
    Button
} from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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

export default function Preferences() {
    const [profileId, setProfileId] = useState<any>(); // Animation direction
    const router = useRouter();

    const [showDistanceSlider, setShowDistanceSlider] = useState(false);
    const [errors, setErrors] = useState<any>({}); // State for error messages

    const [cityLoading, setCityLoading] = useState(false);
    const [openCity, setOpenCity] = useState(false);
    const [cityOption, setCityOption] = useState<any>([]);
    const [savedOptions, setSavedOptions] = useState<any>(null); // Stores fetched preferences
    const [cityInput, setCityInput] = useState<string>("");

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

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedProfileId = localStorage.getItem("logged_in_profile");
            setProfileId(storedProfileId);
            handleGetPreferences(storedProfileId);
        }
    }, []);

    useEffect(() => {
        if (savedOptions) {
            // Map saved options to the formData state
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

            // Set the slider visibility based on UseDistance
            setShowDistanceSlider(savedOptions.UseDistance === 1);
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
            setSavedOptions(checkData.data[0].get_preferences);
        } catch (error) {
            console.error("Error fetching preferences:", error);
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
                router.push('/members');
            } else {
                console.log(data.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Box
            sx={{
                position: "relative",
                padding: {
                    xs: 2,
                    sm: 3,
                    md: 4,
                    lg: 10,
                },
            }}
        >
            {/* Heading */}
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

            <Typography variant="h4" align="center" gutterBottom color="white">
                Preferences
            </Typography>
            <Divider sx={{ mb: 3, bgcolor: "#e91e63" }} />

            {/* Swiping Preferences */}
            <Typography variant="h6" gutterBottom color="white">
                Who can see me when they are swiping or searching?
            </Typography>
            <Box>
                {["couples", "singleMale", "singleFemale"].map((key) => (
                    <FormControlLabel
                        key={key}
                        control={
                            <Checkbox
                                name={`swiping.${key}`}
                                checked={(formData.swiping as any)[key]}
                                onChange={handleChange}
                                sx={{
                                    color: "#e91e63",
                                    "&.Mui-checked": { color: "#e91e63" },
                                }}
                            />
                        }
                        label={key.replace("single", "Single ").replace("Male", "Males").replace("Female", "Females").replace("couples", "Couples")}
                        sx={{ color: "white" }}
                    />
                ))}
            </Box>

            {/* Distance */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="white">
                What is the maximum distance to a profile I want to see during swiping? This applies to my current location.
            </Typography>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={showDistanceSlider}
                        onChange={() => setShowDistanceSlider((prev) => !prev)}
                        sx={{
                            color: "#e91e63",
                            "&.Mui-checked": { color: "#e91e63" },
                        }}
                    />
                }
                label="Max Distance"
                sx={{ color: "white" }}
            />
            {showDistanceSlider && (
                <Box sx={{ mt: 2, width: 300 }}>
                    <Slider
                        value={formData.maxDistance}
                        min={0}
                        max={150}
                        onChange={handleSliderChange}
                        valueLabelDisplay="auto"
                        marks={[
                            { value: 0, label: "0 Miles" },
                            { value: 150, label: "150 Miles" },
                        ]}
                        sx={{
                            color: "#e91e63",
                            "& .MuiSlider-thumb": { borderRadius: "50%" },
                            "& .MuiSlider-markLabel": {
                                color: "white",
                            },
                        }}
                    />
                </Box>
            )}

            {/* Blocking Preferences */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="white">
                Who should I block when I am swiping?
            </Typography>
            <Box>
                {["couples", "singleMale", "singleFemale"].map((key) => (
                    <FormControlLabel
                        key={key}
                        control={
                            <Checkbox
                                name={`block.${key}`}
                                checked={(formData.block as any)[key]}
                                onChange={handleChange}
                                sx={{
                                    color: "#e91e63",
                                    "&.Mui-checked": { color: "#e91e63" },
                                }}
                            />
                        }
                        label={key.replace("single", "Single ").replace("Male", "Males").replace("Female", "Females").replace("couples", "Couples")}
                        sx={{ color: "white" }}
                    />
                ))}
            </Box>

            {/* City */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="white">
                Enter the Location to Block
            </Typography>
            <Box>
                <Autocomplete
                    id="autocomplete-filled"
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
                            variant="filled"
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
                                backgroundColor: "#2a2a2a",
                                input: { color: "#fff" },
                                mb: 3,
                                borderRadius: "4px",
                            }}
                        />
                    )}
                />
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 4 }}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{
                        textTransform: "none",
                        backgroundColor: "#f50057",
                        textAlign: "center",
                        py: 1.5,
                        px: 4,
                        fontSize: "16px",
                        fontWeight: "bold",
                        "&:hover": {
                            backgroundColor: "#c51162",
                        },
                    }}
                >
                    Save
                </Button>
            </Box>
        </Box>
    );
}