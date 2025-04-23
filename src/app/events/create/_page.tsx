"use client";

import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import {
    Box,
    Button,
    Typography,
    TextField,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    FormControlLabel,
    Checkbox,
    Autocomplete,
    CircularProgress,
    FormHelperText,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter } from "next/navigation"; // Assuming you're using Next.js Router

type EventFormState = {
    startDate: string;
    endDate: string;
    category: string;
    repeat: string;
    eventName: string;
    description: string;
    emailDescription: string;
    city: string;
    hideAddress: number
};

export default function CreateEvent() {
    const router = useRouter();
    const [formState, setFormState] = useState<EventFormState>({
        startDate: "",
        endDate: "",
        category: "",
        repeat: "None", // default value
        eventName: "",
        description: "",
        emailDescription: "",
        city: "",
        hideAddress: 0
    });

    const [eventCoverImage, setEventCoverImage] = useState<string | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<any>(null);
    const handleHideAddress = (field: any) => {
        setFormState((prev: any) => ({ ...prev, [field]: !prev[field] }));
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (name: "startDate" | "endDate", value: string) => {
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (name: "category" | "repeat", value: string) => {
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditorChange = (name: "description" | "emailDescription", value: string) => {
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const [errors, setErrors] = useState<any>({
        startDate: "",
        endDate: "",
        category: "",
        eventName: "",
        description: "",
        emailDescription: "",
        city: "",
        cover: ""
    });
    const [profileId, setProfileId] = useState<any>(); // Animation direction
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
        }
    }, []);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const uploadImage = async (imageData: string): Promise<string | null> => {
                try {
                    // Convert Base64 imageData to a Blob

                    const formData = new FormData();

                    // Append the image Blob with a unique name
                    formData.append("image", imageData);

                    // Send the FormData via fetch
                    const response = await fetch('/api/user/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    // Parse the JSON response
                    const data = await response.json();

                    // Handle response errors
                    if (!response.ok) {
                        throw new Error(data.message || 'Failed to upload image');
                    }

                    console.log("Upload response:", data);
                    return data?.blobUrl || null; // Return the uploaded image's URL
                } catch (error) {
                    console.error("Error during image upload:", error);
                    return null; // Return null in case of an error
                }
            };
            // Clear previous errors
            setErrors({
                startDate: "",
                endDate: "",
                category: "",
                eventName: "",
                description: "",
                emailDescription: "",
                city: "",
                cover: ""
            });

            // Validate the form fields
            let hasError = false;
            const newErrors: any = {};

            // Check each field
            if (!formState.startDate) {
                newErrors.startDate = "Start date is required.";
                hasError = true;
            }

            if (!formState.endDate) {
                newErrors.endDate = "End date is required.";
                hasError = true;
            }

            if (!formState.category) {
                newErrors.category = "Category is required.";
                hasError = true;
            }

            if (!formState.eventName) {
                newErrors.eventName = "Event name is required.";
                hasError = true;
            }

            if (!formState.description) {
                newErrors.description = "Description is required.";
                hasError = true;
            }

            if (!formState.emailDescription) {
                newErrors.emailDescription = "Email description is required.";
                hasError = true;
            }

            if (!formState.city) {
                newErrors.city = "City is required.";
                hasError = true;
            }
            if (!coverImageFile) {
                newErrors.cover = "Cover Image is required.";
                hasError = true;
            }

            // If there are errors, update the errors state
            if (hasError) {
                setErrors(newErrors);
                return; // Stop submission if errors exist
            }

            // Handle image upload if coverImageFile exists
            let coverUrl = null;
            if (coverImageFile) {
                coverUrl = await uploadImage(coverImageFile);
            }
            // Submit the post
            const response = await fetch('/api/user/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    coverimageurl: coverUrl,
                    name: formState.eventName, // Trim any extra spaces
                    profileId: profileId,
                    starttime: formState?.startDate,
                    endtime: formState?.endDate,
                    venue: formState?.city,
                    isvenuehidden: formState?.hideAddress,
                    category: formState?.category,
                    description: formState?.description,
                    emaildescription: formState?.emailDescription,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Post submitted successfully:', data.message);
                // Optionally update UI or clear form fields here
                router.push("/events");
            } else {

            }
        } catch (error) {

        }
        // Handle form submission (e.g., send data to an API)
        console.log("Form submitted with data:", formState);
    };

    const handleRepeatChange = (option: string) => {
        setFormState((prev) => ({
            ...prev,
            repeat: option,
        }));
    };
    const [formData, setFormData] = useState({
        city: '',
    });
    const [cityLoading, setCityLoading] = useState(false)
    const [openCity, setOpenCity] = useState(false)
    const [cityOption, setCityOption] = useState<any>([])
    const [cityInput, setCityInput] = useState<string | ''>('')
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

                const { cities }: { cities: any } = await response.json();

                const uniqueCities = cities.filter(
                    (city: any, index: any, self: any) =>
                        index === self.findIndex((t: any) => t.City === city.City)
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

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, cropType: "postImage" | "banner") => {
        const file = e.target.files?.[0];
        console.log(e)
        if (file) {
            setCoverImageFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                if (cropType === "postImage") {
                    setEventCoverImage(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Box sx={{ color: "white", padding: "10px" }}>
            <Header />
            <Box sx={{ padding: { lg: 4, md: 4, sm: 0, xs: 0 }, marginTop: 7, marginBottom: 6 }}>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                    Create Event
                </Typography> 

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} sx={{ marginBottom: 2, justifyContent: "center", padding: 3 }}>
                        <Grid item xs={6}>
                            <TextField
                                label="Start Date"
                                type="datetime-local"
                                name="startDate"
                                value={formState.startDate}
                                onChange={(e) => handleDateChange("startDate", e.target.value)}
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{
                                    color: "white",
                                    backgroundColor: "#2d2d2d",
                                    borderRadius: "8px",
                                    "& .MuiInputBase-root": {
                                        backgroundColor: "#2d2d2d",
                                        color: "white",
                                    },
                                    borderBottom: "1px solid #f50057",
                                }}
                            />
                            {errors.startDate && <FormHelperText error>{errors.startDate}</FormHelperText>}
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="End Date"
                                type="datetime-local"
                                name="endDate"
                                value={formState.endDate}
                                onChange={(e) => handleDateChange("endDate", e.target.value)}
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{
                                    color: "white",
                                    backgroundColor: "#2d2d2d",
                                    borderRadius: "8px",
                                    "& .MuiInputBase-root": {
                                        backgroundColor: "#2d2d2d",
                                        color: "white",
                                    },
                                    borderBottom: "1px solid #f50057",
                                }}
                            />
                            {errors.endDate && <FormHelperText error>{errors.endDate}</FormHelperText>}
                        </Grid>
                    </Grid>

                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        {/* Main Title as Label */}
                        <Typography variant="h6" sx={{ marginBottom: 1, color: "white" }}>
                            Category
                        </Typography>

                        {/* Description Below the Title */}
                        <Typography variant="body2" sx={{ marginBottom: 2, color: "gray" }}>
                            Select your event category
                        </Typography>

                        {/* Category Select */}
                        <Select
                            name="category"
                            value={formState.category}
                            onChange={(e) => handleSelectChange("category", e.target.value)}
                            sx={{
                                color: "white",
                                backgroundColor: "#2d2d2d",
                                borderRadius: "8px",
                                "& .MuiInputBase-root": {
                                    backgroundColor: "#2d2d2d",
                                    color: "white",
                                },
                                borderBottom: "1px solid #f50057",
                            }}
                        >
                            <MenuItem value="House Party">House Party</MenuItem>
                            <MenuItem value="Meet Greet">Meet Greet</MenuItem>
                            <MenuItem value="Hotel Takeover">Hotel Takeover</MenuItem>
                        </Select>

                        {/* Error Message */}
                        {errors.category && <FormHelperText error>{errors.category}</FormHelperText>}
                    </FormControl>


                    {/* Repeat Options */}
                    <Typography variant="body1" sx={{ marginBottom: 2 }}>
                        Repeats
                    </Typography>
                    <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                        {["None", "Daily", "Weekly", "Monthly"].map((option) => (
                            <Grid item xs={3} key={option}>
                                <Box
                                    sx={{
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #ddd",
                                        backgroundColor:
                                            formState.repeat === option ? "#f50057" : "#2d2d2d",
                                        cursor: "pointer",
                                        textAlign: "center",
                                        transition: "background-color 0.3s",
                                        "&:hover": {
                                            backgroundColor: "#f50057",
                                        },
                                    }}
                                    onClick={() => handleRepeatChange(option)}
                                >
                                    <Typography variant="body1" sx={{ color: "white" }}>
                                        {option}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    {errors.repeat && <FormHelperText error>{errors.repeat}</FormHelperText>}

                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        {/* Main Title as Label */}
                        <Typography variant="h6" sx={{ marginBottom: 1, color: "white" }}>
                            Event Name
                        </Typography>

                        {/* Event Name Input */}
                        <TextField
                            name="eventName"
                            value={formState.eventName}
                            onChange={handleChange}
                            fullWidth
                            variant="standard"
                            InputProps={{
                                sx: {
                                    height: 48, // Adjust the height
                                    backgroundColor: "#2d2d2d",
                                    borderRadius: "8px",
                                    "&:hover:not(.Mui-disabled)::before": {
                                        borderBottom: "2px solid #f50057", // Maintain border color on hover
                                    },
                                    "&::before": {
                                        borderBottom: "1px solid #f50057", // Default bottom border color
                                    },
                                    "&::after": {
                                        borderBottom: "2px solid #f50057", // Focused bottom border color
                                    },
                                },
                            }}
                            sx={{
                                "& .MuiInputBase-input": {
                                    color: "white", // Input text color
                                    padding: "12px", // Padding for comfortable height
                                },
                            }}
                        />
                    </FormControl>

                    <Typography sx={{ color: "white", marginTop: '20px' }}>Venue</Typography>
                    <Typography sx={{ color: "white", marginTop: '5px' }}>Enter the location of your event</Typography>
                    <Autocomplete
                        value={formState?.city}
                        id='autocomplete-filled'
                        open={openCity}
                        clearOnBlur
                        onOpen={() => setOpenCity(true)}
                        onClose={() => setOpenCity(false)}
                        isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                        getOptionLabel={(option: any) => option.City}
                        options={cityOption.map((city: any) => ({
                            ...city,
                            key: city.id
                        }))}
                        loading={cityLoading}
                        inputValue={cityInput}
                        onInputChange={(event: any, newInputValue: any) => {
                            if (event?.type === 'change' || event?.type === 'click')
                                setCityInput(newInputValue)
                        }}
                        onChange={(event: any, newValue: any) => {
                            if (newValue?.City)
                                setFormState({
                                    ...formState,
                                    city: newValue?.City,
                                });
                        }}
                        renderInput={(params: any) => (
                            <TextField
                                {...params}
                                variant='filled'
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
                                }}
                            />
                        )}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Checkbox
                            color="primary"
                            sx={{
                                color: "white", // Default color when unchecked
                                "&.Mui-checked": {
                                    color: "##f50057", // Custom color when checked
                                },
                            }}
                            checked={formState.hideAddress == 1 ? true : false}
                            onChange={() => handleHideAddress("hideAddress")}
                        />
                        <Box>
                            <Typography variant="h6">Hide Address</Typography>
                            <Typography>Hide Address from members</Typography>
                        </Box>
                    </Box>

                    {/* Description Text Editor */}
                    <Typography variant="body1">
                        Description
                    </Typography>
                    <Typography>
                        Describe your event
                    </Typography>
                    <Editor
                        apiKey={"l1j8914ctmajvo6bed8vxy873jf3a7w4hp7t3837ostucw87"}
                        value={formState.description}
                        onEditorChange={(content) => handleEditorChange("description", content)}
                        init={{
                            menubar: false,
                            toolbar: "bold italic",
                            statusbar: false,
                            plugins: ["advlist", "autolink", "lists", "link", "image"],
                            content_style: "body { background-color: #2d2d2d; color: white; }",
                            skin: true,
                        }}
                    />

                    {/* Email Description Text Editor */}
                    <Typography variant="body1" sx={{ marginTop: 2 }}>
                        Email Description
                    </Typography>
                    <Typography>
                        Enter the description of the email
                    </Typography>
                    <Editor
                        apiKey={"l1j8914ctmajvo6bed8vxy873jf3a7w4hp7t3837ostucw87"}
                        value={formState.emailDescription}
                        onEditorChange={(content) => handleEditorChange("emailDescription", content)}
                        init={{
                            menubar: false,
                            toolbar: "bold italic",
                            statusbar: false,
                            plugins: ["advlist", "autolink", "lists", "link", "image"],
                            content_style: "body { background-color: #2d2d2d; color: white; }",
                            skin: false,
                        }}
                    />


                    <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
                        <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}>
                            Cover Photo
                        </Typography>
                        <Box
                            sx={{
                                width: 400,
                                height: 400,
                                border: errors?.cover ? "2px dashed #f44336" : "2px dashed #fff", // Red border if image is not selected
                                borderRadius: "16px",
                                backgroundColor: "#1d1d1d",
                                margin: "0 auto",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: "relative",
                            }}
                        >
                            {eventCoverImage ? (
                                <img
                                    src={eventCoverImage}
                                    alt="Cropped Avatar"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: "16px",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => onFileChange(e, "postImage")}
                                        style={{ display: "none" }}
                                        id="upload-post-image"
                                    />
                                    <label htmlFor="upload-post-image">
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                            }}
                                        >
                                            <img
                                                src="/photocamera.png"
                                                alt="Upload"
                                                style={{ width: "40px", height: "40px" }}
                                            />
                                            <Typography sx={{ color: "#fff", mt: 1 }}>
                                                Click to select an Image
                                            </Typography>
                                        </Box>
                                    </label>
                                </>
                            )}
                        </Box>
                    </Grid>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{
                            mt: 2,
                            textTransform: "none",
                            backgroundColor: "#f50057",
                            py: 1.5,
                            fontSize: "16px",
                            fontWeight: "bold",
                            "&:hover": {
                                backgroundColor: "#c51162",
                            },
                        }}
                    >
                        Create Event
                    </Button>
                </form>
            </Box>

            <UserBottomNavigation />
        </Box>
    );
}
