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
    Chip,
    Paper,
    FormHelperText,
    Typography,
    CircularProgress,
    Stack,
    useTheme,
    useMediaQuery,
    IconButton
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import PublishIcon from "@mui/icons-material/Upload";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CollectionsIcon from "@mui/icons-material/Collections";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment, { Moment } from 'moment';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';

interface FormData {
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

interface TicketPackage {
    name: string;
    type: string;
    price: number;
    quantity: number;
    id?: string; // Added to handle API data
    ticketId?: string; // Added to handle API data
}

interface TicketRowProps {
    ticket: TicketPackage;
    onDelete: (name: string) => void;
    onQuantityChange: (name: string, newQuantity: number) => void;
}

interface ImageUploadProps {
    isCoverPhoto?: boolean;
    value: File[] | string[] | null; // Modified to accept URLs as strings
    onChange: (files: File[] | null) => void;
    onBlur?: () => void;
    error?: string;
    touched?: boolean;
}

interface ImagePreviewProps {
    image: File | string; // Modified to accept both File and string
    onDelete: () => void;
}

interface TicketPackagesProps {
    initialTickets: any[];  // Use your actual ticket type from API
    onTicketsUpdate?: (tickets: TicketPackage[]) => void;
}

const TicketRow: React.FC<TicketRowProps> = ({ ticket, onDelete, onQuantityChange }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2,
                p: 1,
                backgroundColor: '#1e1e1e',
                borderRadius: '4px',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flex: 1,
                }}
            >
                <Chip
                    label={ticket.name}
                    onDelete={() => { }}
                    sx={{
                        backgroundColor: '#2d2d2d',
                        color: 'white',
                        '& .MuiChip-deleteIcon': {
                            color: 'white',
                        },
                    }}
                />
                <Select
                    value={ticket.type}
                    onChange={() => { }}
                    sx={{
                        minWidth: 120,
                        backgroundColor: '#2d2d2d',
                        color: 'white',
                        '& .MuiSelect-icon': {
                            color: 'white',
                        },
                    }}
                >
                    <MenuItem value={ticket.type}>{ticket.type}</MenuItem>
                </Select>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative', width: '80px' }}>
                    <TextField
                        value={ticket.price}
                        type="number"
                        InputProps={{
                            readOnly: true,
                            sx: {
                                backgroundColor: '#2d2d2d',
                                color: 'white',
                                '& input': {
                                    color: 'white',
                                    textAlign: 'center',
                                },
                            },
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{ color: 'white', p: 0 }}
                            onClick={() => { }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: '4px solid transparent',
                                    borderRight: '4px solid transparent',
                                    borderBottom: '4px solid white',
                                }}
                            />
                        </IconButton>
                        <IconButton
                            size="small"
                            sx={{ color: 'white', p: 0 }}
                            onClick={() => { }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: '4px solid transparent',
                                    borderRight: '4px solid transparent',
                                    borderTop: '4px solid white',
                                }}
                            />
                        </IconButton>
                    </Box>
                </Box>

                <Box sx={{ position: 'relative', width: '80px' }}>
                    <TextField
                        value={ticket.quantity}
                        type="number"
                        onChange={(e) => {
                            const newValue = parseInt(e.target.value, 10);
                            if (!isNaN(newValue)) {
                                onQuantityChange(ticket.name, newValue);
                            }
                        }}
                        InputProps={{
                            sx: {
                                backgroundColor: '#2d2d2d',
                                color: 'white',
                                '& input': {
                                    color: 'white',
                                    textAlign: 'center',
                                },
                            },
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{ color: 'white', p: 0 }}
                            onClick={() => onQuantityChange(ticket.name, ticket.quantity + 1)}
                        >
                            <Box
                                component="span"
                                sx={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: '4px solid transparent',
                                    borderRight: '4px solid transparent',
                                    borderBottom: '4px solid white',
                                }}
                            />
                        </IconButton>
                        <IconButton
                            size="small"
                            sx={{ color: 'white', p: 0 }}
                            onClick={() => onQuantityChange(ticket.name, Math.max(0, ticket.quantity - 1))}
                        >
                            <Box
                                component="span"
                                sx={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: '4px solid transparent',
                                    borderRight: '4px solid transparent',
                                    borderTop: '4px solid white',
                                }}
                            />
                        </IconButton>
                    </Box>
                </Box>

                <IconButton
                    onClick={() => onDelete(ticket.name)}
                    sx={{
                        color: '#ff6b6b',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        },
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

const TicketPackages: React.FC<TicketPackagesProps> = ({ initialTickets, onTicketsUpdate }) => {
    const [tickets, setTickets] = useState<TicketPackage[]>([]);

    useEffect(() => {
        // Transform API tickets data to match our component's format
        const transformedTickets = initialTickets.map(ticket => ({
            id: ticket.id || ticket.ticketId,
            name: ticket.Name || ticket.name,
            type: ticket.Type || ticket.type || 'Couple', // Default to 'Couple' if not specified
            price: Number(ticket.Price || ticket.price || 0),
            quantity: Number(ticket.Quantity || ticket.quantity || 0),
            ticketId: ticket.ticketId || ticket.id
        }));

        setTickets(transformedTickets);
    }, [initialTickets]);

    const handleDelete = (name: string) => {
        setTickets(tickets.filter((ticket) => ticket.name !== name));
    };

    const handleQuantityChange = (name: string, newQuantity: number) => {
        const updatedTickets = tickets.map((ticket) =>
            ticket.name === name ? { ...ticket, quantity: newQuantity } : ticket
        );
        setTickets(updatedTickets);
        if (onTicketsUpdate) {
            onTicketsUpdate(updatedTickets);
        }
    };

    return (
        <Box sx={{ color: 'white', p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Ticket Packages
            </Typography>
            {tickets.map((ticket) => (
                <TicketRow
                    key={ticket.name}
                    ticket={ticket}
                    onDelete={handleDelete}
                    onQuantityChange={handleQuantityChange}
                />
            ))}
        </Box>
    );
};

const categories: string[] = [
    'Meet & Greet',
    'Hotel Takeover',
    'House Party',
];

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onDelete }) => {
    const [preview, setPreview] = useState<string>('');

    React.useEffect(() => {
        if (typeof image === 'string') {
            // If image is already a URL string
            setPreview(image);
        } else {
            // If image is a File object
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(image);
        }
    }, [image]);

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '40%',
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: '#2a2a2a',
            }}
        >
            <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
            <IconButton
                onClick={onDelete}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    },
                }}
            >
                <DeleteIcon sx={{ color: 'white' }} />
            </IconButton>
        </Box>
    );
};

const ImageUpload: React.FC<ImageUploadProps> = ({
    isCoverPhoto = false,
    value,
    onChange,
    onBlur,
    error,
    touched,
}) => {
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (isCoverPhoto) {
            onChange(files.slice(0, 1));
        } else {
            onChange(files.slice(0, 10));
        }
        if (onBlur) onBlur();
    };

    const handleDelete = (indexToDelete: number) => {
        if (!value) return;
        const newFiles = value.filter((_, index) => index !== indexToDelete);
        onChange(newFiles.length > 0 ? newFiles as File[] : null);
    };

    const inputId = isCoverPhoto ? 'cover-photo-upload' : 'photos-upload';

    const showUploadZone = !value || value.length === 0 || (!isCoverPhoto && value.length < 10);

    return (
        <Box>
            <Typography
                variant="subtitle1"
                sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: 'white'
                }}
            >
                {isCoverPhoto ? 'Cover Photo *' : 'Photos *'}
            </Typography>

            {/* Preview Grid - Show at top if there are images */}
            {value && value.length > 0 && (
                <Box sx={{ mb: showUploadZone ? 3 : 0 }}>
                    <Grid container spacing={2}>
                        {value.map((file, index) => (
                            <Grid item xs={isCoverPhoto ? 12 : 4} key={index}>
                                <ImagePreview
                                    image={file}
                                    onDelete={() => handleDelete(index)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Upload Zone - Show only if no image for cover photo, or less than 10 images for multiple */}
            {showUploadZone && (
                <Paper
                    elevation={2}
                    sx={{
                        p: 4,
                        border: '2px dashed',
                        borderColor: 'rgb(144, 146, 150)',
                        borderRadius: 2,
                        cursor: 'pointer',
                        backgroundColor: '#2a2a2a',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: '#333333',
                            borderColor: 'rgb(144, 146, 150)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)',
                        }
                    }}
                >
                    <input
                        type="file"
                        accept="image/*"
                        multiple={!isCoverPhoto}
                        onChange={handleImageUpload}
                        onBlur={onBlur}
                        style={{ display: 'none' }}
                        id={inputId}
                    />
                    <label htmlFor={inputId} style={{ width: '100%', cursor: 'pointer' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            {isCoverPhoto ? (
                                <CloudUploadIcon
                                    sx={{
                                        fontSize: 48,
                                        color: 'white',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'scale(1.1)'
                                        }
                                    }}
                                />
                            ) : (
                                <CollectionsIcon
                                    sx={{
                                        fontSize: 48,
                                        color: 'white',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'scale(1.1)'
                                        }
                                    }}
                                />
                            )}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ mb: 1, color: 'white' }}>
                                    {isCoverPhoto ? 'Upload Cover Photo' : 'Upload Event Photos'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#999' }}>
                                    Drag and drop {!isCoverPhoto && 'multiple'} image{!isCoverPhoto && 's'} here, or click to select
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                                    Supports: JPG, PNG, GIF (Max {isCoverPhoto ? 'size' : '10 images'}: 5MB each)
                                </Typography>
                            </Box>
                        </Box>
                    </label>
                </Paper>
            )}

            {touched && error && (
                <FormHelperText error sx={{ ml: 2, color: '#ff6b6b' }}>
                    {error}
                </FormHelperText>
            )}
        </Box>
    );
};

const EditEvent: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
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
    const [eventCoverImage, setEventCoverImage] = useState<string | null>(null);
    const [profileId, setProfileId] = useState<any>();
    const [isOrganizer, setIsOrganizer] = useState(false);

    const [eventDetail, setEventDetail] = useState<any>(null);
    const [tickets, setTickets] = useState<TicketPackage[]>([]);
    const [eventId, setEventId] = useState<any>("");

    const router = useRouter();

    const theme = useTheme();
    //const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isMobile = useMediaQuery('(max-width: 480px)') ? true : false;

    const handleGetEventDetail = async (eventId: any) => {
        try {
            const checkResponse = await fetch('/api/user/events?eventId=' + eventId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const eventData = await checkResponse.json();
            console.log(eventData);
            console.log(eventData?.event, "===========events");
            setEventDetail(eventData?.event);
            setTickets(eventData?.tickets);
            setFormData({
                eventName: eventData?.event?.Name,
                venue: eventData?.event?.Venue,
                description: eventData?.event?.Description,
                emailDescription: eventData?.event?.EmailDescription,
                coverPhoto: eventData?.event?.CoverImageUrl,
                photos: eventData?.event?.Images,
                startTime: moment(eventData?.event?.StartTime),
                endTime: moment(eventData?.event?.EndTime),
                category: eventData?.event?.Category,
                tags: [],
                allowFreeUsers: false,
                hideVenue: eventDetail?.isVenueHidden == 1 ? true : false,
            })

        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        var param = queryParams.get('q');

        console.log(param);

        setEventId(param);
        handleGetEventDetail(param);

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
                setEventCoverImage(reader.result as string);
            }
        }

        if (touched[fieldName]) {
            const error = validate(fieldName, value);
            setErrors({ ...errors, [fieldName]: error });
        }
    };

    const uploadCoverImage = async (imageData: string): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append("image", imageData);

            console.log(imageData);

            const response = await fetch('/api/user/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log(data);
            return data?.blobUrl || null;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null; // Explicitly return undefined
        }
    };

    const uploadEventImage = async (
		imageData: string
	): Promise<string | null> => {
		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("image", imageData);

			console.log(imageData);

			const response = await fetch("/api/user/upload", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();
			console.log(data);
			return data?.imageUrl || null;
		} catch (error) {
			console.error("Error uploading image:", error);
			return null;
		} finally {
			setIsUploading(false);
		}
	};

    const uploadImagesSequentially = async (images: string[]): Promise<(string | null)[]> => {
        const results: (string | null)[] = [];
        for (const image of images) {
            if (typeof image === "object") {
                const result = await uploadEventImage(image); // Wait for each upload to finish
                console.log(image);
                results.push(result);
            } else {
                results.push(image);
            }
        }
        return results;
    };
    const getLatLngByLocationName = async (locationName: string) => {
        const apiKey = 'AIzaSyAbs5Umnu4RhdgslS73_TKDSV5wkWZnwi0'; // Replace with your actual API key

        try {
            // Call the Google Maps Geocoding API
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${apiKey}`
            );

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();

            // Extract latitude and longitude from the response
            if (data.status === 'OK' && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                return { lat, lng }; // Return latitude and longitude
            }

            console.error('No results found or status not OK:', data);
            return null;
        } catch (error) {
            console.error('Error fetching latitude and longitude:', error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: FormErrors = {};
        let hasErrors = false;

        Object.keys(formData).forEach((fieldName) => {
            const error = validate(fieldName, formData[fieldName as keyof FormData]);
            if (error) {
                newErrors[fieldName as keyof FormErrors] = error;
                hasErrors = true;
            }
        });

        setErrors(newErrors);
        setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

        if (!hasErrors) {
            console.log('Form submitted:', formData);

            console.log(typeof (formData?.photos));

            try {

                const imageData = formData?.coverPhoto;

                var coverURL;
                var photoURLs;

                console.log("type");
                console.log(typeof (formData?.coverPhoto));

                if (typeof (formData?.coverPhoto) === "object") {
                    coverURL = await uploadCoverImage(imageData);
                    console.log("SwingSocial----->Uploading Cover Event Image", coverURL);
                } else {
                    coverURL = formData?.coverPhoto;
                }

                const images = formData?.photos;
                photoURLs = await uploadImagesSequentially(images);
                console.log(typeof photoURLs);
                console.log("SwingSocial----->Uploading Images", photoURLs);

                console.log(typeof (formData?.photos));
                console.log(coverURL);
                console.log(photoURLs);

                // Fetch latitude and longitude for the event name
                const locationName = formData?.venue; // Assuming eventName is the location name
                const coordinates = await getLatLngByLocationName(locationName);

                if (!coordinates) {
                    console.error('Failed to fetch latitude and longitude');
                    return;
                }

                const { lat, lng } = coordinates;

                const response = await fetch('/api/user/events/update/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        coverImageURL: coverURL,
                        images: photoURLs,
                        eventName: formData.eventName,
                        profileId: profileId,
                        eventId: eventId,
                        startTime: formData?.startTime,
                        endTime: formData?.endTime,
                        venue: formData?.venue,
                        isVenueHidden: formData?.hideVenue,
                        category: formData?.category,
                        description: formData?.description,
                        emailDescription: formData.emailDescription,
                        latitude: lat, // Include latitude in the request body
                        longitude: lng, // Include longitude in the request body
                    }),
                });

                if (response.status == 200) {
                    toast.success('You have subscribe to free plan successfully');
                    router.push('/events');
                }
                console.log(response);
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        }
    };


    const handleImageUpload = (field: 'coverPhoto' | 'photos') => (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if (field === 'coverPhoto') {
            handleChange(field, files[0]);
        } else {
            handleChange(field, Array.from(files));
        }
    };

    return (
        <Box sx={{ color: "white", padding: "10px" }}>
            <Header />

            {isMobile ? (
                <Box sx={{ padding: { lg: 4, md: 4, sm: 0, xs: 0 }, marginTop: 7, marginBottom: 6 }}>
                    <Typography variant="h6" sx={{ marginBottom: 2 }}>
                        Edit your Event
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
                            inputValue={cityInput}
                            onInputChange={(event: any, newInputValue: any) => {
                                if (event?.type === 'change' || event?.type === 'click')
                                    setCityInput(newInputValue)
                            }}
                            onChange={(event: any, newValue: any) => {
                                if (newValue?.City)
                                    setFormData({
                                        ...formData,
                                        venue: newValue?.City,
                                    });
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
                            apiKey={"3yffl36ic8qni4zhtxbmc0t1sujg1m25sc4l638375rwb5vs"}
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
                            apiKey={"3yffl36ic8qni4zhtxbmc0t1sujg1m25sc4l638375rwb5vs"}
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


                        <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    border: '2px dashed',
                                    borderColor: theme => touched.coverPhoto && errors.coverPhoto ? '#ff6b6b' : 'white',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    backgroundColor: '#2a2a2a',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#333333',
                                        borderColor: 'white',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(255,20,147,0.2)',
                                    }
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload('coverPhoto')}
                                    onBlur={() => handleBlur('coverPhoto')}
                                    style={{ display: 'none' }}
                                    id="cover-photo-upload"
                                />
                                <label htmlFor="cover-photo-upload" style={{ width: '100%', cursor: 'pointer' }}>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        <CloudUploadIcon sx={{
                                            fontSize: 48,
                                            color: 'white',
                                            transition: 'transform 0.3s ease',
                                            '&:hover': {
                                                transform: 'scale(1.1)'
                                            }
                                        }} />
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                                                Upload Cover Photo
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#999' }}>
                                                Drag and drop your image here, or click to select
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                                                Supports: JPG, PNG, GIF (Max size: 5MB)
                                            </Typography>
                                            {formData.coverPhoto != null && (
                                                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgb(144, 146, 150)', borderRadius: 1 }}>
                                                    <Typography variant="body2" >
                                                        Cover photo is selected
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </label>
                            </Paper>
                            {touched.coverPhoto && errors.coverPhoto && (
                                <FormHelperText error sx={{ ml: 2, color: '#ff6b6b' }}>
                                    {errors.coverPhoto}
                                </FormHelperText>
                            )}
                        </Grid>

                        <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 4,
                                    border: '2px dashed',
                                    borderColor: 'white',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    backgroundColor: '#2a2a2a',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#333333',
                                        borderColor: 'white',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(255,20,147,0.2)',
                                    }
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload('photos')}
                                    onBlur={() => handleBlur('photos')}
                                    style={{ display: 'none' }}
                                    id="photos-upload"
                                />
                                <label htmlFor="photos-upload" style={{ width: '100%', cursor: 'pointer' }}>
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        <CollectionsIcon sx={{
                                            fontSize: 48,
                                            color: 'white',
                                            transition: 'transform 0.3s ease',
                                            '&:hover': {
                                                transform: 'scale(1.1)'
                                            }
                                        }} />
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                                                Upload Event Photos
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#999' }}>
                                                Drag and drop multiple images here, or click to select
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                                                Supports: JPG, PNG, GIF (Max 10 images, 5MB each)
                                            </Typography>
                                            {formData.photos.length > 0 && (
                                                <Box sx={{
                                                    mt: 2, p: 2, bgcolor: 'rgb(144, 146, 150)', borderRadius: 1
                                                }}>
                                                    < Typography variant="body2">
                                                        {formData.photos.length} {formData.photos.length === 1 ? 'image' : 'images'} selected
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </label>
                            </Paper>
                            {touched.photos && errors.photos && (
                                <FormHelperText error sx={{ ml: 2, color: '#ff6b6b' }}>
                                    {errors.photos}
                                </FormHelperText>
                            )}
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
                </Box >
            ) : (
                <Box sx={{ padding: { lg: 4, md: 4, sm: 0, xs: 0 }, marginTop: 7, marginBottom: 6 }}>
                    <Button
                        onClick={() => router.back()}
                        startIcon={<ArrowLeft />}
                        sx={{
                            textTransform: "none",
                            color: "rgba(255, 255, 255, 0.7)",
                            textAlign: "center",
                            minWidth: 'auto',
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
                    <form onSubmit={handleSubmit} noValidate>
                        <Box
                            sx={{
                                mx: 'auto',
                                p: 3,
                                background: '#1a1a1a',
                                minHeight: '100vh',
                                '& .MuiPaper-root': {
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    background: '#2a2a2a',
                                    '&:hover': {
                                        boxShadow: '0 8px 24px rgba(255,20,147,0.2)',
                                    }
                                },
                                '& .MuiInputBase-root': {
                                    color: '#fff',
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#ff69b4',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'rgb(55, 58, 64)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#ff1493',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#ff1493',
                                    }
                                }
                            }}
                        >
                            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{
                                mb: 4,
                                fontWeight: 'bold',
                                color: '#f50057',
                                textShadow: '0 0 10px rgba(255,20,147,0.3)',
                                animation: 'fadeIn 0.5s ease-in'
                            }}>
                                Edit your Event
                            </Typography>

                            <Grid container spacing={4}>
                                {/* Left Column */}
                                <Grid item xs={12} md={6} sx={{
                                    animation: 'slideInLeft 0.5s ease-out',
                                    '@keyframes slideInLeft': {
                                        from: { opacity: 0, transform: 'translateX(-20px)' },
                                        to: { opacity: 1, transform: 'translateX(0)' }
                                    }
                                }}>
                                    <Paper elevation={3} sx={{
                                        p: 4,
                                        borderRadius: 2,
                                        border: '0.0625rem solid rgb(55, 58, 64)'
                                    }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <TextField
                                                required
                                                label="Event Name"
                                                fullWidth
                                                value={formData.eventName}
                                                onChange={(e) => handleChange('eventName', e.target.value)}
                                                onBlur={() => handleBlur('eventName')}
                                                error={touched.eventName && Boolean(errors.eventName)}
                                                helperText={touched.eventName && errors.eventName}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        transition: 'transform 0.2s',
                                                        '&:hover': {
                                                            transform: 'scale(1.02)',
                                                        }
                                                    },
                                                    '& .Mui-error': {
                                                        color: '#ff6b6b',
                                                    }
                                                }}
                                            />

                                            <Autocomplete
                                                value={formData?.venue}
                                                id='venue-autocomplete'
                                                open={openCity}
                                                clearOnBlur
                                                onOpen={() => setOpenCity(true)}
                                                onClose={() => setOpenCity(false)}
                                                isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                                                getOptionLabel={(option: any) => option.City || ""}
                                                options={cityOption.map((venue: any) => ({
                                                    ...venue,
                                                    key: venue.id
                                                }))}
                                                loading={cityLoading}
                                                inputValue={cityInput}
                                                onInputChange={(event: any, newInputValue: any) => {
                                                    if (event?.type === 'change' || event?.type === 'click') {
                                                        setCityInput(newInputValue);
                                                    }
                                                }}
                                                onChange={(event: any, newValue: any) => {
                                                    if (newValue?.City) {
                                                        setFormData({
                                                            ...formData,
                                                            venue: newValue?.City,
                                                        });
                                                    }
                                                }}
                                                renderInput={(params: any) => (
                                                    <>
                                                        <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                                                            Venue *
                                                        </Typography>
                                                        <Typography sx={{ mb: 1, fontSize: 'calc(0.75rem)', color: 'rgb(144, 146, 150)' }}>
                                                            Enter the location of your event
                                                        </Typography>
                                                        <TextField
                                                            required
                                                            {...params}
                                                            error={touched.venue && Boolean(errors.venue)}
                                                            helperText={touched.venue && errors.venue}
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
                                                                borderRadius: '4px',
                                                                '& .MuiFilledInput-root': {
                                                                    backgroundColor: '#2a2a2a',
                                                                    '&:hover': {
                                                                        backgroundColor: '#333333',
                                                                    },
                                                                    '&.Mui-focused': {
                                                                        backgroundColor: '#333333',
                                                                    },
                                                                    '&::before': {
                                                                        borderBottomColor: '#f50057',
                                                                    },
                                                                    '&:hover:not(.Mui-disabled):before': {
                                                                        borderBottomColor: '#f50057',
                                                                    },
                                                                    '&.Mui-focused:after': {
                                                                        borderBottomColor: '#f50057',
                                                                    },
                                                                },
                                                                '& .MuiAutocomplete-endAdornment': {
                                                                    '& .MuiSvgIcon-root': {
                                                                        color: 'white',
                                                                    },
                                                                },
                                                                '& .MuiFormHelperText-root': {
                                                                    color: '#ff6b6b',
                                                                },
                                                            }}
                                                        />
                                                    </>
                                                )}
                                                ListboxProps={{
                                                    sx: {
                                                        backgroundColor: '#2a2a2a',
                                                        color: '#fff',
                                                        '& .MuiAutocomplete-option': {
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(245,0,87,0.08)',
                                                            },
                                                            '&[aria-selected="true"]': {
                                                                backgroundColor: 'rgba(245,0,87,0.16)',
                                                            },
                                                            '&[aria-selected="true"].Mui-focused': {
                                                                backgroundColor: 'rgba(245,0,87,0.24)',
                                                            },
                                                        },
                                                    },
                                                }}
                                            />

                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.hideVenue}
                                                        onChange={(e) => handleChange('hideVenue', e.target.checked === true ? 1 : 0)}
                                                        sx={{
                                                            color: 'white',
                                                            '&.Mui-checked': {
                                                                color: '#ff1493',
                                                            },
                                                            '& .MuiSvgIcon-root': {
                                                                fontSize: 28,
                                                                transition: 'all 0.2s ease',
                                                            },
                                                            '&:hover': {
                                                                '& .MuiSvgIcon-root': {
                                                                    transform: 'scale(1.1)',
                                                                }
                                                            },
                                                            borderRadius: '8px',
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <Typography
                                                            sx={{
                                                                color: '#fff',
                                                                fontWeight: 500,
                                                                fontSize: '1rem',
                                                                transition: 'color 0.2s ease',
                                                            }}
                                                        >
                                                            Hide Address
                                                        </Typography>
                                                        <Tooltip title="Hide the specific address from members" arrow>
                                                            <InfoIcon
                                                                sx={{
                                                                    fontSize: 20,
                                                                    opacity: 0.8,
                                                                    '&:hover': {
                                                                        opacity: 1
                                                                    }
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    </Box>
                                                }
                                                sx={{
                                                    marginLeft: 0,
                                                }}
                                            />

                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                                                    Description *
                                                </Typography>
                                                <Typography sx={{ mb: 1, fontSize: 'calc(0.75rem)', color: 'rgb(144, 146, 150)' }}>
                                                    Describe your event in detail
                                                </Typography>
                                                <Paper elevation={2} sx={{ p: 1, mb: 1, border: "0.0625rem solid rgb(55, 58, 64);" }}>
                                                    <Editor
                                                        apiKey={"3yffl36ic8qni4zhtxbmc0t1sujg1m25sc4l638375rwb5vs"}
                                                        value={formData.description}
                                                        onEditorChange={(content) => handleChange('description', content)}
                                                        onBlur={() => handleBlur('description')}
                                                        init={{
                                                            height: 300,
                                                            menubar: false,
                                                            statusbar: false,
                                                            plugins: ['lists', 'link', 'image', 'code'],
                                                            toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image',
                                                            skin: 'oxide',
                                                            content_style: "body { background-color: #666; color: white;}",
                                                        }}
                                                    />
                                                </Paper>
                                                {touched.description && errors.description && (
                                                    <FormHelperText error sx={{ ml: 2 }}>{errors.description}</FormHelperText>
                                                )}
                                            </Box>

                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'white' }}>
                                                    Email Description *
                                                </Typography>
                                                <Typography sx={{ mb: 1, fontSize: 'calc(0.75rem)', color: 'rgb(144, 146, 150)' }}>
                                                    Enter the description of the email sent to the attendees
                                                </Typography>
                                                <Paper elevation={2} sx={{ p: 1, mb: 1, border: "0.0625rem solid rgb(55, 58, 64);" }}>
                                                    <Editor
                                                        apiKey={"3yffl36ic8qni4zhtxbmc0t1sujg1m25sc4l638375rwb5vs"}
                                                        value={formData.emailDescription}
                                                        onEditorChange={(content) => handleChange('emailDescription', content)}
                                                        onBlur={() => handleBlur('emailDescription')}
                                                        init={{
                                                            height: 300,
                                                            menubar: false,
                                                            statusbar: false,
                                                            plugins: ['lists', 'link', 'image', 'code'],
                                                            toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image',
                                                            skin: 'oxide',
                                                            content_style: "body { background-color: #666; color: white;}",
                                                        }}
                                                    />
                                                </Paper>
                                                {touched.emailDescription && errors.emailDescription && (
                                                    <FormHelperText error sx={{ ml: 2 }}>{errors.emailDescription}</FormHelperText>
                                                )}
                                            </Box>

                                            {/* <Box>
                                                <Typography variant="subtitle1" sx={{
                                                    mb: 1,
                                                    fontWeight: 500,
                                                    color: 'white'
                                                }}>
                                                    Cover Photo *
                                                </Typography>
                                                <Paper
                                                    elevation={2}
                                                    sx={{
                                                        p: 4,
                                                        border: '2px dashed',
                                                        borderColor: 'rgb(144, 146, 150)',
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        backgroundColor: '#2a2a2a',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            backgroundColor: '#333333',
                                                            borderColor: 'rgb(144, 146, 150)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 4px 12px white',
                                                        }
                                                    }}
                                                >
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload('coverPhoto')}
                                                        onBlur={() => handleBlur('coverPhoto')}
                                                        style={{ display: 'none' }}
                                                        id="cover-photo-upload"
                                                    />
                                                    <label htmlFor="cover-photo-upload" style={{ width: '100%', cursor: 'pointer' }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: 2
                                                        }}>
                                                            <CloudUploadIcon sx={{
                                                                fontSize: 48,
                                                                color: 'white',
                                                                transition: 'transform 0.3s ease',
                                                                '&:hover': {
                                                                    transform: 'scale(1.1)'
                                                                }
                                                            }} />
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="h6" sx={{ mb: 1 }}>
                                                                    Upload Cover Photo
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: '#999' }}>
                                                                    Drag and drop your image here, or click to select
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                                                                    Supports: JPG, PNG, GIF (Max size: 5MB)
                                                                </Typography>
                                                                {formData.coverPhoto != null && (
                                                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgb(144, 146, 150)', borderRadius: 1 }}>
                                                                        <Typography variant="body2" >
                                                                            Cover photo is selected
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </label>
                                                </Paper>
                                                {touched.coverPhoto && errors.coverPhoto && (
                                                    <FormHelperText error sx={{ ml: 2, color: '#ff6b6b' }}>
                                                        {errors.coverPhoto}
                                                    </FormHelperText>
                                                )}
                                            </Box> */}

                                            {/* Multiple Photos Upload Zone */}
                                            {/* <Box sx={{ mt: 4 }}>
                                                <Typography variant="subtitle1" sx={{
                                                    mb: 1,
                                                    fontWeight: 500,
                                                    color: 'white'
                                                }}>
                                                    Photos *
                                                </Typography>
                                                <Paper
                                                    elevation={2}
                                                    sx={{
                                                        p: 4,
                                                        border: '2px dashed',
                                                        borderColor: 'rgb(144, 146, 150)',
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        backgroundColor: '#2a2a2a',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            backgroundColor: '#333333',
                                                            borderColor: 'rgb(144, 146, 150)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 4px 12px white',
                                                        }
                                                    }}
                                                >
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload('photos')}
                                                        onBlur={() => handleBlur('photos')}
                                                        style={{ display: 'none' }}
                                                        id="photos-upload"
                                                    />
                                                    <label htmlFor="photos-upload" style={{ width: '100%', cursor: 'pointer' }}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            gap: 2
                                                        }}>
                                                            <CollectionsIcon sx={{
                                                                fontSize: 48,
                                                                transition: 'transform 0.3s ease',
                                                                '&:hover': {
                                                                    transform: 'scale(1.1)'
                                                                }
                                                            }} />
                                                            <Box sx={{ textAlign: 'center' }}>
                                                                <Typography variant="h6" sx={{ mb: 1 }}>
                                                                    Upload Event Photos
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: '#999' }}>
                                                                    Drag and drop multiple images here, or click to select
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                                                                    Supports: JPG, PNG, GIF (Max 10 images, 5MB each)
                                                                </Typography>
                                                                {formData.photos?.length > 0 && (
                                                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgb(144, 146, 150)', borderRadius: 1 }}>
                                                                        <Typography variant="body2" >
                                                                            {formData.photos.length} {formData.photos.length === 1 ? 'image' : 'images'} selected
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </label>
                                                </Paper>
                                                {touched.photos && errors.photos && (
                                                    <FormHelperText error sx={{ ml: 2, color: '#ff6b6b' }}>
                                                        {errors.photos}
                                                    </FormHelperText>
                                                )}
                                            </Box> */}

                                            <ImageUpload
                                                isCoverPhoto
                                                value={formData.coverPhoto ? [formData.coverPhoto] : null}
                                                onChange={(files) => {
                                                    if (files && files[0]) {
                                                        const reader = new FileReader();
                                                        reader.onload = () => {
                                                            setEventCoverImage(reader.result as string);
                                                        };
                                                        reader.readAsDataURL(files[0]);
                                                        handleChange('coverPhoto', files[0]);
                                                    } else {
                                                        handleChange('coverPhoto', null);
                                                        setEventCoverImage(null);
                                                    }
                                                }}
                                                onBlur={() => handleBlur('coverPhoto')}
                                                error={errors.coverPhoto}
                                                touched={touched.coverPhoto}
                                            />

                                            {/* Multiple Photos Upload */}
                                            <ImageUpload
                                                value={formData.photos}
                                                onChange={(files) => handleChange('photos', files || [])}
                                                onBlur={() => handleBlur('photos')}
                                                error={errors.photos}
                                                touched={touched.photos}
                                            />
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Right Column */}
                                <Grid item xs={12} md={6} sx={{
                                    animation: 'slideInRight 0.5s ease-out',
                                    '@keyframes slideInRight': {
                                        from: { opacity: 0, transform: 'translateX(20px)' },
                                        to: { opacity: 1, transform: 'translateX(0)' }
                                    }
                                }}>
                                    <Paper elevation={3} sx={{
                                        p: 4,
                                        borderRadius: 2,
                                        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)'
                                    }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <LocalizationProvider dateAdapter={AdapterMoment}>
                                                <Stack spacing={3} sx={{ display: 'flex' }}>
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
                                                                        }
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
                                                                        }
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
                                                </Stack>
                                            </LocalizationProvider>

                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={formData.allowFreeUsers}
                                                        onChange={(e) => handleChange('allowFreeUsers', e.target.checked === true ? 1 : 0)}
                                                        sx={{
                                                            color: 'white',
                                                            '&.Mui-checked': {
                                                                color: '#ff1493',
                                                            },
                                                            '& .MuiSvgIcon-root': {
                                                                fontSize: 28,
                                                                transition: 'all 0.2s ease',
                                                            },
                                                            '&:hover': {
                                                                '& .MuiSvgIcon-root': {
                                                                    transform: 'scale(1.1)',
                                                                }
                                                            },
                                                            padding: '12px',
                                                            borderRadius: '8px',
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}>
                                                        <Typography
                                                            sx={{
                                                                color: '#fff',
                                                                fontWeight: 500,
                                                                fontSize: '1rem',
                                                                transition: 'color 0.2s ease',
                                                            }}
                                                        >
                                                            Allow free users
                                                        </Typography>
                                                        <Tooltip title="Enable this to make the event accessible to free users" arrow>
                                                            <InfoIcon
                                                                sx={{
                                                                    fontSize: 20,
                                                                    opacity: 0.8,
                                                                    '&:hover': {
                                                                        opacity: 1
                                                                    }
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    </Box>
                                                }
                                                sx={{
                                                    marginLeft: 0,
                                                }}
                                            />

                                            <FormControl
                                                required
                                                error={touched.category && Boolean(errors.category)}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        transition: 'transform 0.2s',
                                                        '&:hover': {
                                                            transform: 'scale(1.02)',
                                                        }
                                                    }
                                                }}
                                            >
                                                <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                                                    Category *
                                                </Typography>
                                                <Typography sx={{ mb: 1, fontSize: 'calc(0.75rem)', color: 'rgb(144, 146, 150)' }}>
                                                    Select your events category
                                                </Typography>
                                                <Select
                                                    value={formData.category}
                                                    onChange={(e) => handleChange('category', e.target.value)}
                                                    onBlur={() => handleBlur('category')}
                                                >
                                                    {categories.map((category) => (
                                                        <MenuItem key={category} value={category}>
                                                            {category}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {touched.category && errors.category && (
                                                    <FormHelperText>{errors.category}</FormHelperText>
                                                )}
                                            </FormControl>

                                            <Autocomplete
                                                multiple
                                                options={[]}
                                                freeSolo
                                                value={formData.tags}
                                                onChange={(_, value) => handleChange('tags', value)}
                                                onBlur={() => handleBlur('tags')}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Tags"
                                                        error={touched.tags && Boolean(errors.tags)}
                                                        helperText={touched.tags && errors.tags}
                                                    />
                                                )}
                                                sx={{
                                                    '& .MuiAutocomplete-endAdornment': {
                                                        '& .MuiSvgIcon-root': {
                                                            color: 'white',
                                                        },
                                                    },
                                                    '& .MuiSvgIcon-root-MuiSelect-icon': {
                                                        color: 'white', // Calendar icon color
                                                        fontSize: '1.5rem', // Adjust size of the calendar icon
                                                        transition: 'all 0.3s ease', // Add smooth transitions for hover effects
                                                    },
                                                }}
                                            />

                                            {/* <Box sx={{ mt: 4 }}>
                                                <TicketPackages
                                                    initialTickets={tickets}
                                                    onTicketsUpdate={(updatedTickets) => setTickets(updatedTickets)}
                                                />
                                            </Box> */}

                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                sx={{
                                                    mt: 2,
                                                    py: 1.5,
                                                    background: 'linear-gradient(45deg, #ff1493 30%, #ff69b4 90%)',
                                                    boxShadow: '0 3px 5px 2px rgba(255,20,147, .3)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'linear-gradient(45deg, #ff1493 60%, #ff69b4 90%)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 10px 4px rgba(255,20,147, .3)',
                                                    }
                                                }}
                                                startIcon={<PublishIcon />}
                                            >
                                                Publish
                                            </Button>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    </form>
                </Box >
            )
            }
            <Footer />
        </Box >
    );
};

export default EditEvent;
