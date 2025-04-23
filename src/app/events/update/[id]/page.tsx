"use client";

import React, { useState, ChangeEvent, useEffect } from 'react';
import {
    Grid,
    TextField,
    Button,
    Box,
    Autocomplete,
    FormControlLabel,
    Checkbox,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Paper,
    FormHelperText,
    Typography,
    CircularProgress,
    Stack,
    useTheme,
    useMediaQuery,
    Card,
    CardMedia,
    CardActions,
    IconButton,
    CardContent
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import PublishIcon from "@mui/icons-material/Upload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CollectionsIcon from "@mui/icons-material/Collections";
import InfoIcon from "@mui/icons-material/Info";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment, { Moment } from 'moment';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { AddCircleOutline } from '@mui/icons-material';

interface FormData {
    Id: string;
    eventName: string;
    venue: string;
    description: string;
    emailDescription: string;
    coverPhoto: any | null;
    photos: any[];
    startTime: Moment | null;
    endTime: Moment | null;
    category: string;
    tags: string[];
    allowFreeUsers: boolean;
    hideVenue: any
}

interface FormErrors {
    eventName?: string;
    venue?: string;
    description?: string;
    emailDescription?: string;
    coverPhoto?: string;
    photos?: string;
    startTime?: string;
    endTime?: string;
    category?: string;
    tags?: string;
}

const categories: string[] = [
    'Meet & Greet',
    'Hotel Takeover',
    'House Party',
];
type Params = Promise<{ id: string }>

export default function EventDetail(props: { params: Params }) {
    const [id, setId] = useState<string>(''); // State for error messages
    useEffect(() => {
        const getIdFromParam = async () => {
            const params = await props.params;
            const pid: any = params.id;
            console.log(pid);
            setId(pid)
            console.log(pid, "===========id");
        }
        getIdFromParam();
    }, [props]);
    useEffect(() => {
        if (id) {
            handleGetEventDetail(id);
        }
    }, [id]);
    const [eventDetail, setEventDetail] = useState<any>(null);


    useEffect(() => {
        if (eventDetail) {
            setFormData({
                Id: eventDetail?.Id,
                eventName: eventDetail.Name || '',
                venue: eventDetail.Venue || '',
                description: eventDetail.Description || '',
                emailDescription: eventDetail.EmailDescription || '',
                coverPhoto: eventDetail.CoverImageUrl || null,
                photos: eventDetail.Images || [],
                startTime: moment(eventDetail.StartTime),
                endTime: moment(eventDetail.EndTime),
                category: eventDetail.Category || '',
                tags: [], // Assuming tags are not provided in eventDetail
                allowFreeUsers: false, // Assuming this is default or computed elsewhere
                hideVenue: eventDetail.isVenueHidden || 0,
            });
            setCurrentEventImages(eventDetail.Images);
        }
    }, [eventDetail]);

    const [rsvp, setRsvp] = useState<any>([]);
    const [attendees, setAttendees] = useState<any>([]);
    const [tickets, setTicket] = useState<any>([]);

    const handleGetEventDetail = async (eventId: any) => {
        try {
            const checkResponse = await fetch('/api/user/events?eventId=' + eventId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const eventData = await checkResponse.json();
            console.log(eventData?.events, "===========events");
            setEventDetail(eventData?.event)
            setRsvp(eventData?.rsvp)
            setAttendees(eventData?.attendees)
            setTicket(eventData?.tickets)

        } catch (error) {
            console.error('Error:', error);
        }
    };
    const [profileUsername, setProfileUsername] = useState<any>(); // Animation direction
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
            setProfileUsername(localStorage.getItem('profileUsername'))
        }
    }, []);
    const [formData, setFormData] = useState<FormData>({
        Id: "",
        eventName: '',
        venue: '',
        description: '',
        emailDescription: '',
        coverPhoto: null,
        photos: [],
        startTime: moment(),
        endTime: moment(),
        category: '',
        tags: [],
        allowFreeUsers: false,
        hideVenue: 0,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [cityLoading, setCityLoading] = useState(false);
    const [openCity, setOpenCity] = useState(false);
    const [cityOption, setCityOption] = useState<any[]>([]);
    const [cityInput, setCityInput] = useState<string>('');
    const [eventCoverImage, setEventCoverImage] = useState<any>(null);
    const [profileId, setProfileId] = useState<any>();
    const router = useRouter();

    const theme = useTheme();
    //const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isMobile = useMediaQuery('(max-width: 480px)') ? true : false;

    useEffect(() => {
        setProfileId(localStorage.getItem('logged_in_profile'));
    }, []);

    useEffect(() => {
        if (!openCity) {
            setCityOption([]);
        }
    }, [openCity]);

    useEffect(() => {
        if (!openCity) return;
        if (cityInput === '') return;

        const fetchCityData = async () => {
            setCityLoading(true);

            try {
                const response = await fetch(`/api/user/city?city=${cityInput}`);
                if (!response.ok) {
                    console.error('Failed to fetch city data:', response.statusText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const { cities }: { cities: any[] } = await response.json();

                // Filter unique cities
                const uniqueCities = cities.filter(
                    (city, index, self) =>
                        index === self.findIndex((t) => t.City === city.City)
                );

                setCityOption(uniqueCities);
            } catch (error) {
                console.error('Error fetching cities:', error);
            } finally {
                setCityLoading(false);
            }
        };

        // Debounce the fetch request
        const delayDebounceFn = setTimeout(() => {
            fetchCityData();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [cityInput, openCity]);

    const validate = (fieldName: string, value: any): string => {
        switch (fieldName) {
            case 'eventName':
                return !value ? 'Event name is required' : '';
            case 'venue':
                return !value ? 'Venue is required' : '';
            case 'description':
                return !value ? 'Description is required' : '';
            case 'emailDescription':
                return !value ? 'Email description is required' : '';
            case 'coverPhoto':
                return !value ? 'Cover photo is required' : '';
            // case 'photos':
            //     return !value || value.length === 0 ? 'At least one photo is required' : '';
            case 'startTime':
                if (!value) return 'Start time is required';
                if (formData.startTime && formData.startTime.valueOf() <= Date.now()) {
                    return 'Start time must be after this time';
                }
            case 'endTime':
                if (!value) return 'End time is required';
                if (formData.startTime && value < formData.startTime) {
                    return 'End time must be after start time';
                }
                return '';
            case 'category':
                return !value ? 'Category is required' : '';
            // case 'tags':
            //     return !value || value.length === 0 ? 'At least one tag is required' : '';
            default:
                return '';
        }
    };

    const handleBlur = (fieldName: string) => {
        setTouched({ ...touched, [fieldName]: true });
        const error = validate(fieldName, formData[fieldName as keyof FormData]);
        setErrors({ ...errors, [fieldName]: error });
    };

    const handleChange = (fieldName: string, value: any) => {
        if (fieldName === "hideVenue") {
            if (value) {
                setFormData({ ...formData, [fieldName]: 1 });
            } else {
                setFormData({ ...formData, [fieldName]: 0 });
            }
        } else {
            setFormData({ ...formData, [fieldName]: value });
        }

        if (fieldName === "coverPhoto") {
            console.log("cover");
            const reader = new FileReader();
            reader.onload = () => {
                setFormData({ ...formData, coverPhoto: reader.result });
            }
        }

        if (touched[fieldName]) {
            const error = validate(fieldName, value);
            setErrors({ ...errors, [fieldName]: error });
        }
    };
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [currentEventImages, setCurrentEventImages] = useState<any>([]);

    const handleRemoveImage = (index: number) => {
        // Remove image from both the preview and the file list
        const updatedImages = [...formData.photos];
        updatedImages.splice(index, 1);

        const updatedFiles = [...selectedFiles];
        updatedFiles.splice(index, 1);


        const updatedCurrentImages = [...currentEventImages];
        updatedCurrentImages.splice(index, 1);

        setFormData({ ...formData, photos: updatedImages });
        setCurrentEventImages({ ...currentEventImages, updatedCurrentImages })
        setSelectedFiles(updatedFiles);
    };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        //Ensure required fields are provided
        const { Id, eventName, startTime, endTime, venue, category } = formData;
        if (!eventName || !startTime || !endTime || !category || !venue) {
            toast.error('Complete Event info!', {
                autoClose: 5000,
                type: 'error',
            });
            return;
        }

        // Validate for any empty fields
        const hasEmptyFields = [Id, eventName, startTime, endTime, venue, category].some(field => field === '');
        if (hasEmptyFields) {
            //   setEmptyError(true);
            toast.error('Complete Event info!', {
                autoClose: 5000,
                type: 'error',
            });
            return;
        }

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
            let imageUrls = [];


            let qcoverimage: any = '';
            if (eventCoverImage) {
                qcoverimage = await uploadImage(eventCoverImage);
                console.log(qcoverimage, "==============qcoverimage");
            }
            if (currentEventImages?.length > 0) {
                for (let i = 0; i < currentEventImages?.length; i++) {
                    imageUrls.push(currentEventImages[i])

                }
            }
            if (selectedFiles?.length > 0) {
                for (let i = 0; i < selectedFiles?.length; i++) {
                    let imageUrl = await uploadImage(selectedFiles[i]);
                    imageUrls.push(imageUrl);
                    console.log(imageUrl, "==============imageUrl uploaded");
                }
            }
            // Call the API with promo code data
            const response = await fetch('/api/user/events/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    profileId: profileId,
                    eventId: id,
                    eventName: eventName,
                    startTime: startTime,
                    endTime: endTime,
                    venue: venue,
                    category: category,
                    coverImageURL: qcoverimage,
                    images: imageUrls
                }),
            });

            // Handle response
            if (response.ok) {
                const responseData = await response.json();
                toast.success('Event updated successfully!', {
                    autoClose: 5000,
                    type: 'success',
                });

                console.log('Response:', responseData);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to add promo code!', {
                    autoClose: 5000,
                    type: 'error',
                });
                console.error('Error Response:', errorData);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('An error occurred while adding the promo code!', {
                autoClose: 5000,
                type: 'error',
            });
        }
    };
    return (
        <Box sx={{ color: "white", padding: "10px" }}>
            <Header />

            <Box sx={{ padding: { lg: 4, md: 4, sm: 0, xs: 0 }, marginTop: 7, marginBottom: 6 }}>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                    Edit your event
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} sx={{ justifyContent: "center", padding: 3 }}>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <FormControl fullWidth sx={{ marginBottom: 4 }}>
                                <DateTimePicker
                                    label="Start Time"
                                    value={formData.startTime}
                                    onChange={(value: any) => handleChange('startTime', value)}
                                    onClose={() => handleBlur('startTime')}
                                    slotProps={{
                                        textField: {
                                            required: true,
                                            error: touched.startTime && Boolean(errors.startTime),
                                            helperText: touched.startTime && errors.startTime,
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    transition: 'transform 0.2s',
                                                    '&:hover': {
                                                        transform: 'scale(1.02)',
                                                    },
                                                    // Add color customization here
                                                    '& .MuiInputBase-input': {
                                                        color: 'white', // Text color
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'white', // Border color
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'white', // Hover border color
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'white', // Focused border color
                                                    }
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'white' // Label color
                                                },
                                                '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                                                    color: 'white', // Calendar icon color
                                                    fontSize: '1.5rem', // Adjust size of the calendar icon
                                                    transition: 'all 0.3s ease', // Add smooth transitions for hover effects
                                                },
                                            }
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ marginBottom: 2 }}>
                                <DateTimePicker
                                    label="End Time"
                                    value={formData.endTime}
                                    onChange={(value: any) => handleChange('endTime', value)}
                                    onClose={() => handleBlur('endTime')}
                                    slotProps={{
                                        textField: {
                                            required: true,
                                            error: touched.endTime && Boolean(errors.endTime),
                                            helperText: touched.endTime && errors.endTime,
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    transition: 'transform 0.2s',
                                                    '&:hover': {
                                                        transform: 'scale(1.02)',
                                                    },
                                                    // Add color customization here
                                                    '& .MuiInputBase-input': {
                                                        color: 'white', // Text color
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'white', // Border color
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'white', // Hover border color
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'white', // Focused border color
                                                    }
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'white' // Label color
                                                }
                                            }
                                        }
                                    }}
                                />
                            </FormControl>
                        </LocalizationProvider>
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
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
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

                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        {/* Main Title as Label */}
                        <Typography variant="h6" sx={{ marginBottom: 1, color: "white" }}>
                            Event Name
                        </Typography>

                        {/* Event Name Input */}
                        <TextField
                            required
                            name="eventName"
                            value={formData.eventName}
                            onChange={(e) => handleChange('eventName', e.target.value)}
                            error={!!errors.eventName}
                            helperText={errors.eventName}
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
                    <Typography variant="body2" sx={{ marginTop: '5px', color: "gray", marginBottom: 2, }}>Enter the location of your event</Typography>
                    <Autocomplete
                        value={formData?.venue}
                        id='autocomplete-filled'
                        open={openCity}
                        clearOnBlur
                        onOpen={() => setOpenCity(true)}
                        onClose={() => setOpenCity(false)}
                        isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                        getOptionLabel={(option: any) => option.City || ""}
                        options={cityOption.map((city: any) => ({
                            ...city,
                            key: city.id
                        }))}
                        loading={cityLoading}
                        inputValue={formData?.venue}
                        onInputChange={(event: any, newInputValue: any) => {
                            if (event?.type === 'change' || event?.type === 'click') {
                                setCityInput(newInputValue);
                                setFormData({
                                    ...formData,
                                    venue: newInputValue,
                                });
                            }
                        }}
                        onChange={(event: any, newValue: any) => {
                            if (newValue?.City) {
                                setFormData({
                                    ...formData,
                                    venue: newValue?.City,
                                });
                                setCityInput(newValue?.City);
                            }
                        }}
                        renderInput={(params: any) => (
                            <TextField
                                required
                                {...params}
                                variant='filled'
                                error={!!errors.venue}
                                helperText={errors.venue}
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
                            checked={formData.hideVenue == 1 ? true : false}
                            onChange={(e) => handleChange('hideVenue', e.target.checked)}
                        />
                        <Box>
                            <Typography variant="h6">Hide Address</Typography>
                            <Typography variant="body2" sx={{ marginTop: '5px', color: "gray", marginBottom: 2, }}>Hide Address from members</Typography>
                        </Box>
                    </Box>

                    {/* Description Text Editor */}
                    <Typography variant="body1">
                        Description
                    </Typography>
                    <Typography variant="body2" sx={{ marginTop: '5px', color: "gray", marginBottom: 2, }}>
                        Describe your event
                    </Typography>
                    <Editor
                        apiKey={"l1j8914ctmajvo6bed8vxy873jf3a7w4hp7t3837ostucw87"}
                        value={formData.description}
                        onEditorChange={(content) => handleChange('description', content)}
                        init={{
                            menubar: false,
                            statusbar: false,
                            plugins: ['lists', 'link', 'image', 'code'],
                            toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image',
                            content_style: "body { background-color: #2d2d2d; color: white; }",
                            skin: true,
                        }}
                    />

                    {/* Email Description Text Editor */}
                    <Typography variant="body1" sx={{ marginTop: 2 }}>
                        Email Description
                    </Typography>
                    <Typography variant="body2" sx={{ marginTop: '5px', color: "gray", marginBottom: 2, }}>
                        Enter the description of the email
                    </Typography>
                    <Editor
                        apiKey={"l1j8914ctmajvo6bed8vxy873jf3a7w4hp7t3837ostucw87"}
                        value={formData.emailDescription}
                        onEditorChange={(content) => handleChange('emailDescription', content)}
                        init={{
                            menubar: false,
                            statusbar: false,
                            plugins: ['lists', 'link', 'image', 'code'],
                            toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image',
                            content_style: "body { background-color: #2d2d2d; color: white; }",
                            skin: false,
                        }}
                    />


                    <Grid item xs={12} sx={{ mt: 5 }}>
                        <Card sx={{ maxWidth: 300, mx: "auto", boxShadow: 3 }}>
                            {/* Image Preview */}
                            <CardMedia
                                component="img"
                                image={formData?.coverPhoto || "/placeholder-image.png"} // Placeholder for no image
                                alt="Cover Preview"
                                sx={{
                                    height: 200,
                                    objectFit: "cover",
                                    borderBottom: "1px solid #ddd",
                                }}
                            />

                            {/* Card Content */}
                            <CardContent>
                                <Typography variant="h6" align="center" gutterBottom>
                                    Cover Image
                                </Typography>
                                <Typography variant="body2" color="textSecondary" align="center">
                                    Upload an image to set as the cover for your event.
                                </Typography>
                            </CardContent>

                            {/* Footer with Upload Button */}
                            <CardActions sx={{ justifyContent: "center", padding: "16px" }}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    color="primary"
                                    fullWidth
                                    sx={{ textTransform: "none" }}
                                >
                                    Upload Cover Image
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setEventCoverImage(file);
                                                const imageUrl = URL.createObjectURL(file);
                                                setFormData({ ...formData, coverPhoto: imageUrl });
                                            }
                                        }}
                                    />
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sx={{ mt: 5 }}>
                        {/* Image Grid */}
                        <Grid container spacing={2}>
                            {/* Existing Images */}
                            {(formData?.photos || []).map((image: any, index: number) => (
                                <Grid item xs={6} key={index}>
                                    <Card sx={{ borderRadius: 8 }}>
                                        {/* Image Preview */}
                                        <CardMedia
                                            component="img"
                                            image={image}
                                            alt={`Gallery ${index}`}
                                            sx={{
                                                height: 150,
                                                objectFit: "cover",
                                            }}
                                        />
                                        {/* Card Actions (Footer) */}
                                        <CardActions sx={{ justifyContent: "center" }}>
                                            <Button
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                Remove
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}

                            {/* Upload Box */}
                            <Grid item xs={6}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "2px dashed #ccc",
                                        borderRadius: 8,
                                        height: "85%",
                                        marginLeft: 3,
                                        aspectRatio: "1",
                                        cursor: "pointer",
                                        position: "relative",
                                    }}
                                    onClick={() => document.getElementById("file-input")?.click()}
                                >
                                    <input
                                        id="file-input"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                const filesArray = Array.from(e.target.files);
                                                const previewUrls = filesArray.map((file) => URL.createObjectURL(file));
                                                // Update preview in eventData
                                                setFormData({
                                                    ...formData,
                                                    photos: [...(formData.photos || []), ...previewUrls],
                                                });
                                                // Update the selected files state
                                                setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);

                                            }
                                        }}
                                    />
                                    <IconButton color="primary" size="large" sx={{ p: 0 }}>
                                        <AddCircleOutline fontSize="large" />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>
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
                        Update Event
                    </Button>
                </form>
            </Box >
            <Footer />
        </Box >
    );
};