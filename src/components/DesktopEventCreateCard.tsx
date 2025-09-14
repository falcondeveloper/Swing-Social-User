"use client";

import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Button,
  Box,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Paper,
  FormHelperText,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Backdrop,
  MenuItem,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import PublishIcon from "@mui/icons-material/Upload";
import InfoIcon from "@mui/icons-material/Info";
import { ArrowLeft } from "lucide-react";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { SnackbarCloseReason } from "@mui/material/Snackbar";
import { useFormik } from "formik";
import * as Yup from "yup";
import moment, { Moment } from "moment";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

interface CityOption {
  City: string;
  id?: string | number;
}

interface FormValues {
  eventName: string;
  venue: string;
  description: string;
  allowFreeUsers: boolean;
  hideVenue: number;
  category: string;
  startTime: Moment;
  endTime: Moment;
  coverPhoto: File | null;
  images: File[];
  repeats: {
    type: "none" | "daily" | "weekly" | "monthly";
    interval: number;
    stopCondition: "never" | "date" | "times";
    untilDate: Moment | null;
    times: number;
    weekDays: boolean[];
    monthDay: number;
  };
}

const categories: string[] = ["Meet & Greet", "Hotel Takeover", "House Party"];

const DesktopEventCreateCard = () => {
  const [loading, setLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [cityOption, setCityOption] = useState<CityOption[]>([]);
  const [cityInput, setCityInput] = useState<string>("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<
    { name: string; progress: number }[]
  >([]);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("loginInfo");
      if (token) {
        const decodeToken = jwtDecode<{ profileId: string }>(token);
        setProfileId(decodeToken?.profileId || null);
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  useEffect(() => {
    if (!openCity) setCityOption([]);
  }, [openCity]);

  useEffect(() => {
    if (!openCity || !cityInput) return;

    const fetchCityData = async () => {
      setCityLoading(true);
      try {
        const response = await fetch(`/api/user/city?city=${cityInput}`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const { cities }: { cities: CityOption[] } = await response.json();

        const uniqueCities = cities.filter(
          (city, index, self) =>
            index === self.findIndex((t) => t.City === city.City)
        );
        setCityOption(uniqueCities);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setCityLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(fetchCityData, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [cityInput, openCity]);

  const getLatLngByLocationName = async (locationName: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          locationName
        )}&key=${apiKey}`
      );

      if (!response.ok)
        throw new Error(`Geocoding error: ${response.statusText}`);

      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }

      setMessage("Invalid location. Please enter a valid city or address.");
      setOpen(true);
      return null;
    } catch (error) {
      console.error("Error fetching latitude and longitude:", error);
      setMessage("Could not fetch location. Try again later.");
      setOpen(true);
      return null;
    }
  };

  const compressImage = async (file: File, quality = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (event) => {
        if (!event.target?.result) return reject("File could not be read");

        img.src = event.target.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // keep original dimensions
          canvas.width = img.width;
          canvas.height = img.height;

          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          // compress to JPEG
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject("Compression failed");
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            },
            "image/jpeg",
            quality // adjust 0–1 (lower = smaller file)
          );
        };
        img.onerror = reject;
      };
    });
  };

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const compressedFile = await compressImage(file, 0.7);

      const formData = new FormData();
      formData.append("image", compressedFile);

      const response = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();

      return data?.blobUrl || null;
    } catch (error: unknown) {
      let errorMessage = "Unknown error";
      let stack = "";

      if (error instanceof Error) {
        errorMessage = error.message;
        stack = error.stack || "";
      }

      console.error("Error uploading image:", error);

      setMessage("Image upload failed. Please try again.");
      setOpen(true);

      await fetch("/api/user/sendErrorEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorMessage, stack }),
      });

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      eventName: "",
      venue: "",
      description: "",
      allowFreeUsers: false,
      hideVenue: 0,
      category: "",
      startTime: moment(),
      endTime: moment().add(6, "hours"),
      coverPhoto: null,
      images: [],
      repeats: {
        type: "none",
        interval: 1,
        stopCondition: "never",
        untilDate: null,
        times: 1,
        weekDays: Array(7).fill(false),
        monthDay: 1,
      },
    },
    validationSchema: Yup.object().shape({
      eventName: Yup.string()
        .required("Event name is required")
        .max(100, "Event name must be less than 100 characters"),
      venue: Yup.string().required("Venue is required"),
      description: Yup.string().required("Description is required"),
      hideVenue: Yup.number().oneOf([0, 1]),
      category: Yup.string().required("Category is required"),

      startTime: Yup.mixed()
        .required("Start time is required")
        .test(
          "is-valid",
          "Invalid start time",
          (value) => !!value && moment(value).isValid()
        )
        .test(
          "not-past",
          "Start time cannot be in the past",
          (value) => !!value && moment(value).isSameOrAfter(moment(), "minute")
        ),

      endTime: Yup.mixed()
        .required("End time is required")
        .test(
          "is-valid",
          "Invalid end time",
          (value) => !!value && moment(value).isValid()
        )
        .test(
          "is-after-start",
          "End time must be after start time",
          function (value) {
            const { startTime } = this.parent;
            return !!(
              startTime &&
              value &&
              moment(value).isAfter(moment(startTime))
            );
          }
        ),

      coverPhoto: Yup.mixed<File>()
        .nullable()
        .required("Cover photo is required"),

      images: Yup.array()
        .min(1, "Please upload at least one image")
        .max(5, "You can upload up to 5 images only"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        let coverURL: string | null = null;
        if (values.coverPhoto) {
          setUploadingFiles([{ name: values.coverPhoto.name, progress: 0 }]);
          coverURL = await uploadCoverImage(values.coverPhoto);
          setUploadingFiles([]);
        }

        let photoURLs: string[] = [];
        if (values.images.length > 0) {
          const urls: string[] = [];
          for (let i = 0; i < values.images.length; i++) {
            const file = values.images[i];
            setUploadingFiles([{ name: file.name, progress: 0 }]);

            const url = await uploadCoverImage(file);
            if (url) urls.push(url);
            setUploadingFiles([]);
          }
          photoURLs = urls;
        }

        const coordinates = await getLatLngByLocationName(values.venue);
        if (!coordinates) throw new Error("Failed to fetch coordinates");

        if (!coordinates) {
          setLoading(false);
          return;
        }

        const { lat, lng } = coordinates;

        const response = await fetch("/api/user/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coverImageURL: coverURL,
            images: photoURLs,
            eventName: values.eventName,
            profileId: profileId,
            startTime: values.startTime,
            endTime: values.endTime,
            venue: values.venue,
            isVenueHidden: values.hideVenue,
            category: values.category,
            description: values.description,
            emailDescription: "test",
            latitude: lat,
            longitude: lng,
            repeats: values.repeats,
          }),
        });

        const data = await response.json();
        setMessage(data.message);
        setOpen(true);

        if (data.status === 200) router.push("/events");
      } catch (err) {
        console.error("Error submitting form:", err);
        setMessage("Failed to create event.");
        setOpen(true);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <Box sx={{ padding: { lg: 4, md: 4, sm: 0, xs: 0 }, mt: 7, mb: 6 }}>
        <Button
          onClick={() => router.back()}
          startIcon={<ArrowLeft />}
          sx={{ textTransform: "none", color: "rgba(255, 255, 255, 0.7)" }}
        >
          Back
        </Button>

        <form onSubmit={formik.handleSubmit}>
          <Box
            sx={{
              mx: "auto",
              p: 3,
              background: "#1a1a1a",
              minHeight: "100vh",
              "& .MuiPaper-root": {
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                background: "#2a2a2a",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(255,20,147,0.2)",
                },
              },
              "& .MuiInputBase-root": {
                color: "#fff",
              },
              "& .MuiInputLabel-root": {
                color: "#ff69b4",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgb(55, 58, 64)",
                },
                "&:hover fieldset": {
                  borderColor: "#ff1493",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ff1493",
                },
              },
            }}
          >
            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 4, fontWeight: "bold", color: "#f50057" }}
            >
              Create New Event
            </Typography>

            <Grid container spacing={4}>
              {/* Left Column */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: 2 }}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    {/* Event Name */}
                    <TextField
                      fullWidth
                      label="Event Name"
                      name="eventName"
                      value={formik.values.eventName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.eventName &&
                        Boolean(formik.errors.eventName)
                      }
                      helperText={
                        formik.touched.eventName && formik.errors.eventName
                      }
                    />

                    {/* Venue */}
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "gray",
                          mb: 1,
                        }}
                      >
                        Enter the location of your event
                      </Typography>
                      <Autocomplete
                        open={openCity}
                        onOpen={() => setOpenCity(true)}
                        onClose={() => setOpenCity(false)}
                        options={cityOption}
                        getOptionLabel={(option) => option.City || ""}
                        loading={cityLoading}
                        inputValue={formik.values.venue}
                        onInputChange={(_, newValue) => {
                          setCityInput(newValue);
                          formik.setFieldValue("venue", newValue);
                        }}
                        onChange={(_, newValue) => {
                          formik.setFieldValue("venue", newValue?.City || "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="State, City"
                            name="venue"
                            onBlur={formik.handleBlur}
                            error={
                              formik.touched.venue &&
                              Boolean(formik.errors.venue)
                            }
                            helperText={
                              formik.touched.venue && formik.errors.venue
                            }
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {cityLoading && (
                                    <CircularProgress size={15} />
                                  )}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    </Box>

                    {/* Hide Venue Checkbox */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.hideVenue === 1}
                          onChange={(e) =>
                            formik.setFieldValue(
                              "hideVenue",
                              e.target.checked ? 1 : 0
                            )
                          }
                          sx={{
                            color: "white",
                            "&.Mui-checked": {
                              color: "#ff1493",
                            },
                            "& .MuiSvgIcon-root": {
                              fontSize: 28,
                              transition: "all 0.2s ease",
                            },
                            "&:hover": {
                              "& .MuiSvgIcon-root": {
                                transform: "scale(1.1)",
                              },
                            },
                            borderRadius: "8px",
                          }}
                        />
                      }
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography>Hide Address</Typography>
                          <Tooltip
                            title="Hide the specific address from members"
                            arrow
                          >
                            <InfoIcon fontSize="small" />
                          </Tooltip>
                        </Box>
                      }
                    />

                    {/* Description */}
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, color: "white" }}
                      >
                        Description
                      </Typography>
                      <Typography
                        sx={{
                          mb: 1,
                          fontSize: "calc(0.75rem)",
                          color: "rgb(144, 146, 150)",
                        }}
                      >
                        Describe your event in detail
                      </Typography>
                      <Paper sx={{ p: 1, mb: 1 }}>
                        <Editor
                          apiKey={
                            "3yffl36ic8qni4zhtxbmc0t1sujg1m25sc4l638375rwb5vs"
                          }
                          value={formik.values.description}
                          onEditorChange={(content) =>
                            formik.setFieldValue("description", content)
                          }
                          onBlur={() =>
                            formik.setFieldTouched("description", true)
                          }
                          init={{
                            height: 300,
                            menubar: false,
                            statusbar: false,
                            plugins: ["lists", "link", "image", "code"],
                            toolbar:
                              "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image",
                            skin: "oxide",
                            content_style:
                              "body { background-color: #666; color: white; }",
                          }}
                        />
                      </Paper>
                      {formik.touched.description &&
                        formik.errors.description && (
                          <FormHelperText error>
                            {formik.errors.description}
                          </FormHelperText>
                        )}
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, color: "white" }}
                      >
                        Cover Photo
                      </Typography>

                      <Paper
                        variant="outlined"
                        sx={{
                          mt: 1,
                          p: 2,
                          border: `2px dashed ${
                            (formik.touched.coverPhoto ||
                              formik.submitCount > 0) &&
                            formik.errors.coverPhoto
                              ? "red"
                              : "rgba(255,255,255,0.3)"
                          }`,
                          borderRadius: 2,
                          textAlign: "center",
                          background: "#1a1a1a",
                          cursor: "pointer",
                          "&:hover": { borderColor: "#ff1493" },
                          position: "relative",
                        }}
                        onClick={() =>
                          document.getElementById("coverPhotoInput")?.click()
                        }
                      >
                        {formik.values.coverPhoto ? (
                          <Box
                            sx={{
                              position: "relative",
                              display: "inline-block",
                            }}
                          >
                            <img
                              src={URL.createObjectURL(
                                formik.values.coverPhoto
                              )}
                              alt="Cover"
                              style={{
                                maxWidth: "100%",
                                height: "200px",
                                borderRadius: "8px",
                                marginBottom: "8px",
                              }}
                            />

                            <IconButton
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                bgcolor: "rgba(0,0,0,0.5)",
                                color: "white",
                                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                formik.setFieldValue("coverPhoto", null);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>

                            <Typography variant="body2" sx={{ color: "gray" }}>
                              {formik.values.coverPhoto.name}
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <PublishIcon
                              sx={{ fontSize: 40, color: "#ff69b4" }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "gray", mt: 1 }}
                            >
                              Upload Cover Photo
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "gray" }}
                            >
                              Supports: JPG, PNG, GIF (Max size: 5MB)
                            </Typography>
                          </Box>
                        )}
                      </Paper>

                      <input
                        id="coverPhotoInput"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0] || null;

                          formik.setFieldValue("coverPhoto", file);
                          formik.setFieldTouched("coverPhoto", true, false);
                          formik.validateField("coverPhoto");
                        }}
                      />

                      {(formik.touched.coverPhoto || formik.submitCount > 0) &&
                        formik.errors.coverPhoto && (
                          <FormHelperText error>
                            {formik.errors.coverPhoto as string}
                          </FormHelperText>
                        )}
                    </Box>

                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500, color: "white" }}
                      >
                        Photos (max 5)
                      </Typography>

                      <Paper
                        variant="outlined"
                        sx={{
                          mt: 1,
                          p: 2,

                          border: `2px dashed ${
                            (formik.touched.images || formik.submitCount > 0) &&
                            formik.errors.images
                              ? "red"
                              : "rgba(255,255,255,0.3)"
                          }`,
                          borderRadius: 2,
                          textAlign: "center",
                          background: "#1a1a1a",
                          cursor: "pointer",
                          "&:hover": { borderColor: "#ff1493" },
                        }}
                        onClick={() =>
                          document.getElementById("photosInput")?.click()
                        }
                      >
                        <PublishIcon sx={{ fontSize: 40, color: "#ff69b4" }} />
                        <Typography
                          variant="body2"
                          sx={{ color: "gray", mt: 1 }}
                        >
                          Upload Photos
                        </Typography>
                        <Typography variant="caption" sx={{ color: "gray" }}>
                          JPG, PNG, GIF | Max size: 5MB each
                        </Typography>
                      </Paper>

                      <input
                        id="photosInput"
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={(event) => {
                          const files = Array.from(
                            event.currentTarget.files || []
                          );
                          const validFiles = files.filter(
                            (file) =>
                              [
                                "image/jpeg",
                                "image/jpg",
                                "image/png",
                                "image/gif",
                              ].includes(file.type) &&
                              file.size <= 5 * 1024 * 1024
                          );

                          const newFiles = [
                            ...formik.values.images,
                            ...validFiles,
                          ].slice(0, 5);

                          formik.setFieldValue("images", newFiles);
                          formik.setFieldTouched("images", true, false);
                          formik.validateField("images");
                        }}
                      />

                      {/* Preview thumbnails */}
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        {formik.values.images.map((file, index) => (
                          <Box key={index} sx={{ position: "relative" }}>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Photo ${index + 1}`}
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                bgcolor: "rgba(0,0,0,0.5)",
                                color: "white",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = [...formik.values.images];
                                updated.splice(index, 1);
                                formik.setFieldValue("images", updated);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>

                      {(formik.touched.images || formik.submitCount > 0) &&
                        formik.errors.images && (
                          <>
                            {Array.isArray(formik.errors.images) ? (
                              formik.errors.images.map((err, idx) =>
                                err ? (
                                  <FormHelperText error key={idx}>
                                    {String(err)}
                                  </FormHelperText>
                                ) : null
                              )
                            ) : (
                              <FormHelperText error>
                                {formik.errors.images as string}
                              </FormHelperText>
                            )}
                          </>
                        )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 4, borderRadius: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DateTimePicker
                      label="Start Time *"
                      value={formik.values.startTime}
                      minDateTime={moment()}
                      onChange={(newValue) => {
                        if (newValue) {
                          const start = moment(newValue);
                          formik.setFieldValue("startTime", start);
                          if (
                            !formik.values.endTime ||
                            !moment(formik.values.endTime).isAfter(start)
                          ) {
                            formik.setFieldValue(
                              "endTime",
                              start.clone().add(6, "hours")
                            );
                          }
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched.startTime &&
                            Boolean(formik.errors.startTime),
                          helperText:
                            formik.touched.startTime && formik.errors.startTime
                              ? String(formik.errors.startTime)
                              : "",
                          sx: { mb: 3 },
                        },
                      }}
                    />

                    <DateTimePicker
                      label="End Time *"
                      value={formik.values.endTime}
                      minDateTime={formik.values.startTime}
                      onChange={(newValue) => {
                        if (newValue) {
                          formik.setFieldValue("endTime", moment(newValue));
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error:
                            formik.touched.endTime &&
                            Boolean(formik.errors.endTime),
                          helperText:
                            formik.touched.endTime && formik.errors.endTime
                              ? String(formik.errors.endTime)
                              : "",
                          sx: { mb: 3 },
                        },
                      }}
                    />
                  </LocalizationProvider>

                  <TextField
                    select
                    fullWidth
                    label="Category"
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.category && Boolean(formik.errors.category)
                    }
                    helperText={
                      formik.touched.category && formik.errors.category
                    }
                    sx={{ mb: 3 }}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<PublishIcon />}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      background:
                        "linear-gradient(45deg, #ff1493 30%, #ff69b4 90%)",
                      boxShadow: "0 3px 5px 2px rgba(255,20,147, .3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, #ff1493 60%, #ff69b4 90%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 10px 4px rgba(255,20,147, .3)",
                      },
                    }}
                  >
                    Publish
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Box>

      <Snackbar
        open={open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert
          severity="success"
          sx={{
            backgroundColor: "white",
            color: "#fc4c82",
            fontWeight: "bold",
            alignItems: "center",
            borderRight: "5px solid #fc4c82",
          }}
          icon={
            <Box
              component="img"
              src="/icon.png"
              alt="Logo"
              sx={{
                width: "20px",
                height: "20px",
              }}
            />
          }
        >
          {message}
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        open={loading || isUploading || uploadingFiles.length > 0}
      >
        <Box
          sx={{
            bgcolor: "#1a1a1a",
            p: 4,
            borderRadius: 3,
            minWidth: 300,
            maxWidth: 500,
            width: "80%",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
            textAlign: "center",
            alignItems: "center", // <-- center content horizontally
          }}
        >
          {uploadingFiles.length > 0 && (
            <>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, color: "gray", textAlign: "center" }}
              >
                Validating and uploading your image(s), please wait...
              </Typography>

              {uploadingFiles.map((file) => (
                <Box
                  key={file.name}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    width: "100%", // make LinearProgress full width
                    alignItems: "center", // center file name and progress
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {file.name}
                  </Typography>
                  <LinearProgress
                    variant="indeterminate"
                    sx={{ height: 10, borderRadius: 5, width: "100%" }}
                  />
                </Box>
              ))}
            </>
          )}

          {(loading || isUploading) && (
            <>
              <CircularProgress
                color="inherit"
                sx={{ mt: uploadingFiles.length ? 2 : 0 }}
              />
              <Typography variant="h6" sx={{ mt: 1, textAlign: "center" }}>
                Creating Event...
              </Typography>
            </>
          )}
        </Box>
      </Backdrop>
    </>
  );
};

export default DesktopEventCreateCard;
