"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  Table,
  TableCell,
  TableRow,
  TableBody,
  Checkbox,
  FormControlLabel,
  CardContent,
  BottomNavigation,
  BottomNavigationAction,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Autocomplete,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Cropper from "react-easy-crop";

export default function EditProfile() {
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [customProfile, setCustomProfile] = useState<any>(null);
  const [privateImages, setPrivateImages] = useState<any>([]);
  const [profileImages, setProfileImages] = useState<any>([]);
  const [advertiser, setAdvertiser] = useState<any>({});
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [bottomNav, setBottomNav] = useState(); // Bottom navigation state
  const [id, setId] = useState<any>("");
  const [profileId, setProfileId] = useState<any>(); // Animation direction

  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [croppedAvatar, setCroppedAvatar] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [croppedBanner, setCroppedBanner] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [openCropper, setOpenCropper] = useState(false);
  const [currentCropType, setCurrentCropType] = useState<string>("avatar");
  const [croppedArea, setCroppedArea] = useState(null);
  const onFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    cropType: "avatar" | "banner"
  ) => {
    const file = e.target.files?.[0];
    console.log(e);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (cropType === "avatar") {
          setAvatarImage(reader.result as string);
        } else {
          setBannerImage(reader.result as string);
        }
        setCurrentCropType(cropType);
        setOpenCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels);
  };
  const [error, setError] = useState(false);

  const handleCropConfirm = () => {
    if (!croppedArea || !currentCropType) return;

    const canvas = document.createElement("canvas");
    const image = new Image();
    const { width, height } =
      currentCropType === "avatar"
        ? { width: 200, height: 200 }
        : { width: 800, height: 450 };

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    image.src = currentCropType === "avatar" ? avatarImage! : bannerImage!;
    image.onload = () => {
      const { x, y, width: cropWidth, height: cropHeight } = croppedArea!;
      ctx.drawImage(image, x, y, cropWidth, cropHeight, 0, 0, width, height);

      const croppedDataURL = canvas.toDataURL("image/jpeg");
      if (currentCropType === "avatar") {
        setCroppedAvatar(croppedDataURL);
      } else {
        setCroppedBanner(croppedDataURL);
      }
      setOpenCropper(false);
    };
  };

  const router = useRouter(); // Initialize the router

  const fetchData = async (userId: string) => {
    if (userId) {
      console.log(userId, "======userId in view");
      setLoading(true);
      try {
        const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
        if (!response.ok) {
          console.error(
            "Failed to fetch advertiser data:",
            response.statusText
          );
          setCustomProfile(undefined);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { user: advertiserData } = await response.json();
        if (!advertiserData) {
          console.error("Advertiser not found");
          setCustomProfile(undefined);
        } else {
          console.log(
            advertiserData?.SwingStyleTags,
            "=========advertiser data"
          );
          setSelectedSwingStyleOptions(advertiserData?.SwingStyleTags);

          setAdvertiser(advertiserData);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGetProfileImages = async (userid: string) => {
    try {
      // Check if t
      // he username exists
      const checkResponse = await fetch(
        "/api/user/sweeping/images/profile?id=" + userid,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const checkData = await checkResponse.json();
      setProfileImages(checkData?.images);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleGetPrivateImages = async (userid: string) => {
    try {
      // Check if t
      // he username exists
      const checkResponse = await fetch(
        "/api/user/sweeping/images?id=" + userid,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const checkData = await checkResponse.json();
      setPrivateImages(checkData?.images);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setProfileId(localStorage.getItem("logged_in_profile"));
    }
  }, []);

  useEffect(() => {
    if (profileId) {
      fetchData(profileId);
      handleGetProfileImages(profileId);
      handleGetPrivateImages(profileId);
    }
  }, [profileId]);

  const [formData, setFormData] = useState({
    city: "",
  });
  console.log(formData?.city, "=========formdata city");
  const stripHTMLTags = (html: string) => {
    return html.replace(/<[^>]*>/g, ""); // Removes HTML tags
  };
  useEffect(() => {
    setBanner(advertiser?.ProfileBanner);
    setAvatar(advertiser?.Avatar);
    setUsername(advertiser?.Username);
    const plainText = stripHTMLTags(advertiser?.About || ""); // Strip HTML tags
    setAbout(plainText);
    setAccountType(advertiser?.AccountType);
    setGender(advertiser?.Gender);
    setOrientation(advertiser?.Orientation);
    setBodyType(advertiser?.BodyType);
    setEyeColor(advertiser?.EyeColor);
    setHairColor(advertiser?.HairColor);
    setTagline(advertiser?.Tagline);
    setAbout(advertiser?.About);
    const dob = new Date(advertiser?.DateOfBirth); // Parse the date
    setYear(dob.getFullYear().toString()); // Get the year as a string
    setMonth((dob.getMonth() + 1).toString().padStart(2, "0")); // Get the month (0-indexed) and pad with '0'
    setDay(dob.getDate().toString().padStart(2, "0")); // Get the day and pad with '0'
    setFormData({ city: advertiser?.Location });
  }, [advertiser]);

  const handleSubmitUpdateProfile = async () => {
    let avatarURL: any = avatar;
    if (croppedAvatar) {
      avatarURL = await uploadImageBase64(croppedAvatar);
    }
    let bannerURL: any = banner;
    if (croppedBanner) {
      bannerURL = await uploadImageBase64(croppedBanner);
    }
    await handleUploadPrivateImages();
    await handleUploadProfileImages();

    try {
      const response = await fetch("/api/user/profile/update/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pid: id,
          avatar: avatarURL,
          banner: bannerURL,
          username: username,
          about: about,
          tagline: tagline,
          accountType: accountType,
          gender: gender,
          orientation: orientation,
          bodyType: bodyType,
          eyeColor: eyeColor,
          hairColor: hairColor,
          city: formData?.city,
          swingStyleOptions: swingStyleOptions,
          birthday: `${month}/${day}/${year}`,
        }),
      });
      if (response.ok) {
        router.push(`/profile`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const [banner, setBanner] = useState<any>(null);
  const [avatar, setAvatar] = useState<any>(null);
  const [username, setUsername] = useState<any>(null);
  const [about, setAbout] = useState<any>(null);
  const [accountType, setAccountType] = useState<any>(null);
  const [gender, setGender] = useState<any>(null);
  const [orientation, setOrientation] = useState<any>(null);
  const [bodyType, setBodyType] = useState<any>(null);
  const [eyeColor, setEyeColor] = useState<any>(null);
  const [hairColor, setHairColor] = useState<any>(null);

  const handleGenderChange = (e: any) => {
    setGender(e.target.value); // Update the gender state
  };
  const handleOrientationChange = (e: any) => {
    setOrientation(e.target.value); // Update the orientation state
  };

  const handleBodyTypeChange = (e: any) => {
    setBodyType(e.target.value); // Update the bodyType state
  };
  const handleEyeColorChange = (e: any) => {
    setEyeColor(e.target.value); // Update the bodyType state
  };

  const handleHairColorChange = (e: any) => {
    setHairColor(e.target.value); // Update the bodyType state
  };

  const [bannerFile, setBannerFile] = useState<any>(null);
  const handleBannerChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e: any) => setBanner(e.target.result);
      reader.readAsDataURL(file);
    }
  };
  const [avatarFile, setAvatarFile] = useState<any>(null);
  const handleAvatarChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e: any) => setAvatar(e.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleUsernameChange = (event: any) => {
    setUsername(event.target.value);
  };
  const handleAboutChange = (event: any) => {
    setAbout(event.target.value);
  };
  const handleAccountTypeChange = (event: any) => {
    setAccountType(event.target.value);
  };
  const [month, setMonth] = useState("12");
  const [day, setDay] = useState("21");
  const [year, setYear] = useState("1999");

  const handleMonthChange = (event: any) => {
    setMonth(event.target.value);
  };

  const handleDayChange = (event: any) => {
    setDay(event.target.value);
  };

  const handleYearChange = (event: any) => {
    setYear(event.target.value);
  };

  // Generate days for each month (assuming no leap year for simplicity)
  const generateDays = () => {
    const daysInMonth: any = {
      "01": 31,
      "02": 28,
      "03": 31,
      "04": 30,
      "05": 31,
      "06": 30,
      "07": 31,
      "08": 31,
      "09": 30,
      "10": 31,
      "11": 30,
      "12": 31,
    };
    const days = [];
    const daysInSelectedMonth = daysInMonth[month] || 31; // Default to 31 if no month selected
    for (let i = 1; i <= daysInSelectedMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // Generate years for the past 100 years
  const generateYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
      years.push(i);
    }
    return years;
  };
  const [tagline, setTagline] = useState("");

  const handleTaglineChange = (event: any) => {
    setTagline(event.target.value);
  };
  const [errors, setErrors] = useState<any>({}); // State for error messages

  const [cityLoading, setCityLoading] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [cityOption, setCityOption] = useState<any>([]);
  const [cityInput, setCityInput] = useState<string | "">("");

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
        //API
        console.log(cityInput);
        const response = await fetch(`/api/user/city?city=${cityInput}`);
        if (!response.ok) {
          console.error("Failed to fetch event data:", response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { cities }: { cities: any } = await response.json();

        const uniqueCities = cities.filter(
          (city: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t.City === city.City)
        );

        setCityOption(uniqueCities);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setCityLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [cityInput, openCity]);

  const [swingStyleOptions, setSelectedSwingStyleOptions] = useState<string[]>(
    []
  );
  const handleChangeSwingStyle = (
    event: React.ChangeEvent<HTMLInputElement>,
    option: string
  ) => {
    if (event.target.checked) {
      setSelectedSwingStyleOptions((prev) => [...prev, option]);
    } else {
      setSelectedSwingStyleOptions((prev) =>
        prev.filter((item) => item !== option)
      );
    }
  };

  const [profileFiles, setProfileFiles] = useState<File[]>([]);
  const [privateFiles, setPrivateFiles] = useState<File[]>([]);

  const handleImageChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const newImages = [...profileImages];
      newImages[index] = URL.createObjectURL(file);
      setProfileImages(newImages);
      const newFiles = [...profileFiles];
      newFiles[index] = file;
      setProfileFiles(newFiles);
    }
  };

  const handlePrivateImageChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const newImages = [...privateImages];
      newImages[index] = URL.createObjectURL(file);
      setPrivateImages(newImages);

      const newFiles = [...privateFiles];
      newFiles[index] = file;
      setPrivateFiles(newFiles);
    }
  };

  const uploadProfileImage = async (imageUrl: any) => {
    try {
      const response = await fetch("/api/user/profile/update/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pid: id,
          image: imageUrl,
        }),
      });
      if (response.ok) {
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleUploadProfileImages = async () => {
    if (profileFiles?.length > 0) {
      for (const image of profileFiles) {
        if (image) {
          try {
            const imageUrl = await uploadImage(image); // Wait for the image upload
            await uploadProfileImage(imageUrl); // Process the uploaded image URL
          } catch (error) {
            console.error("Error uploading profile image:", error);
          }
        }
      }
    }
  };

  const uploadPrivateImage = async (imageUrl: any) => {
    try {
      const response = await fetch("/api/user/profile/update/private-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pid: id,
          image: imageUrl,
        }),
      });
      if (response.ok) {
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleUploadPrivateImages = async () => {
    if (privateFiles?.length > 0) {
      for (const image of privateFiles) {
        if (image) {
          try {
            const imageUrl = await uploadImage(image);
            await uploadPrivateImage(imageUrl);
          } catch (error) {
            console.error("Error uploading private image:", error);
          }
        }
      }
    }
  };

  const uploadImageBase64 = async (image: any): Promise<string | null> => {
    try {
      // Convert Base64 imageData to a Blob
      const blob = await (await fetch(image)).blob();
      const formData = new FormData();

      // Append the image Blob with a unique name
      formData.append("image", blob, `${Date.now()}.jpg`);
      console.log("Blob details:", blob);
      // Send the FormData via fetch
      const response = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });
      // Parse the JSON response
      const data = await response.json();
      // Handle response errors
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      console.log("Upload response:", data);
      return data?.blobUrl || null; // Return the uploaded image's URL
    } catch (error) {
      console.error("Error during image upload:", error);
      return null; // Return null in case of an error
    }
  };

  const uploadImage = async (image: any): Promise<string | null> => {
    try {
      const blob = await (await fetch(image)).blob();
      const formData = new FormData();

      formData.append("image", image);
      const response = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload image");
      }
      return data?.blobUrl || null;
    } catch (error) {
      console.error("Error during image upload:", error);
      return null;
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        background: "#000",
        padding: {
          xs: 2, // Small padding for mobile screens
          sm: 3, // Slightly larger padding for tablets
          md: 4, // Medium padding for laptops
          lg: 30, // Larger padding for desktops
        },
      }}
    >
      {/* Banner Section */}

      <Box
        sx={{
          display: "flex",
          gap: 1, // Reduce gap between boxes
          borderRadius: 2,
          marginBottom: "10px",
        }}
      >
        {/* Pink Buttons */}
        <Button
          onClick={() => router.push("/membership")}
          variant="contained"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e91e63", // Pink color
            color: "white",
            borderRadius: 1,
            padding: 1,
            minWidth: "80px",
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>Billing</span>
        </Button>

        <Button
          variant="contained"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e91e63", // Pink color
            color: "white",
            borderRadius: 1,
            padding: 1,
            minWidth: "80px",
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>
            Prefernces
          </span>
        </Button>

        <Button
          variant="contained"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e91e63", // Pink color
            color: "white",
            borderRadius: 1,
            padding: 1,
            minWidth: "80px",
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>
            Available
          </span>
        </Button>
      </Box>

      <Box
        sx={{
          height: 200,
          backgroundImage: `url(${croppedBanner ? croppedBanner : banner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          cursor: "pointer",
        }}
        onClick={() => {
          const fileInput = document.getElementById(
            "banner-upload"
          ) as HTMLInputElement | null;
          if (fileInput) {
            fileInput.click();
          }
        }}
      >
        <input
          type="file"
          id="banner-upload"
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => onFileChange(e, "banner")}
        />
      </Box>

      {/* Avatar */}
      <Avatar
        src={croppedAvatar ? croppedAvatar : avatar}
        alt="user-avatar"
        sx={{
          width: 128,
          height: 128,
          border: "4px solid white",
          boxShadow: 2,
          cursor: "pointer",
        }}
        onClick={() => {
          const fileInput = document.getElementById(
            "avatar-upload"
          ) as HTMLInputElement | null;
          if (fileInput) {
            fileInput.click();
          }
        }}
      />
      <input
        type="file"
        id="avatar-upload"
        style={{ display: "none" }}
        accept="image/*"
        onChange={(e) => onFileChange(e, "avatar")}
      />

      {/* Content Section */}
      <CardContent>
        <Box>
          <Box
            sx={{ display: "flex", alignItems: "center", marginBottom: "10px" }}
          >
            <TextField
              fullWidth
              value={username || ""}
              onChange={handleUsernameChange}
              variant="outlined"
              size="small"
              label="Enter Username"
              sx={{
                input: { color: "white", fontWeight: "bold" },
                background: "#272525",
              }}
              InputProps={{
                style: { backgroundColor: "transparent" },
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mt: 3,
              background: "#272525",
            }}
          >
            {/* Month Picker */}
            <FormControl
              size="small"
              sx={{ minWidth: 100, borderBottom: "2px solid #e91e63" }}
            >
              <Select
                value={month}
                onChange={handleMonthChange}
                fullWidth
                sx={{
                  "& .MuiSelect-select": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                {[...Array(12)].map((_, index) => (
                  <MenuItem
                    key={index}
                    value={(index + 1).toString().padStart(2, "0")}
                  >
                    {new Date(0, index).toLocaleString("en", { month: "long" })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Day Picker */}
            <FormControl
              size="small"
              sx={{ minWidth: 80, borderBottom: "2px solid #e91e63" }}
            >
              <Select
                value={day}
                onChange={handleDayChange}
                fullWidth
                disabled={!month}
                sx={{
                  "& .MuiSelect-select": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                {generateDays().map((d) => (
                  <MenuItem key={d} value={d.toString()}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Year Picker */}
            <FormControl
              size="small"
              sx={{ minWidth: 100, borderBottom: "2px solid #e91e63" }}
            >
              <Select
                value={year}
                onChange={handleYearChange}
                fullWidth
                sx={{
                  "& .MuiSelect-select": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                {generateYears().map((y) => (
                  <MenuItem key={y} value={y.toString()}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Typography sx={{ color: "white", marginTop: "20px" }}>
          Give members a quick snippet of why you're here or what's going on
          with you right now
        </Typography>
        <TextField
          value={tagline || ""}
          onChange={handleTaglineChange}
          variant="outlined"
          multiline
          minRows={3} // Adjust the minimum number of rows as needed
          fullWidth
          sx={{
            background: "#272525",
            padding: "15px",
            borderRadius: "10px",
            marginTop: "5px",
            "& .MuiOutlinedInput-root": {
              backgroundColor: "transparent", // Make background transparent inside the textarea
              "&:focus": {
                outline: "none", // Remove the blue outline when focused
              },
            },
            "& .MuiInputBase-input": {
              color: "white", // Set text color to white
              fontWeight: "bold", // Set text font weight to bold
            },
          }}
        />

        <Typography sx={{ color: "white", marginTop: "20px" }}>
          Your city
        </Typography>
        <Autocomplete
          value={formData?.city}
          id="autocomplete-filled"
          open={openCity}
          clearOnBlur
          onOpen={() => setOpenCity(true)}
          onClose={() => setOpenCity(false)}
          isOptionEqualToValue={(option: any, value: any) =>
            option.id === value.id
          }
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
          onChange={(event: any, newValue: any) => {
            if (newValue?.City)
              setFormData({
                ...formData,
                city: newValue?.City,
              });
          }}
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
                    {cityLoading ? (
                      <CircularProgress color="inherit" size={15} />
                    ) : null}
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
        <Typography sx={{ color: "white", marginTop: "20px" }}>
          Swing Style
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={swingStyleOptions.includes("Exploring/Unsure")}
                onChange={(e) => handleChangeSwingStyle(e, "Exploring/Unsure")}
                sx={{
                  color: "#e91e63", // Default color for the checkbox
                  "&.Mui-checked": {
                    color: "#e91e63", // Color when the checkbox is checked
                  },
                }}
              />
            }
            label="Exploring/Unsure"
            sx={{ color: "white" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={swingStyleOptions.includes("Full Swap")}
                onChange={(e) => handleChangeSwingStyle(e, "Full Swap")}
                sx={{
                  color: "#e91e63", // Default color for the checkbox
                  "&.Mui-checked": {
                    color: "#e91e63", // Color when the checkbox is checked
                  },
                }}
              />
            }
            label="Full Swap"
            sx={{ color: "white" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={swingStyleOptions.includes("Soft Swap")}
                onChange={(e) => handleChangeSwingStyle(e, "Soft Swap")}
                sx={{
                  color: "#e91e63", // Default color for the checkbox
                  "&.Mui-checked": {
                    color: "#e91e63", // Color when the checkbox is checked
                  },
                }}
              />
            }
            label="Soft Swap"
            sx={{ color: "white" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={swingStyleOptions.includes("Voyear")}
                onChange={(e) => handleChangeSwingStyle(e, "Voyear")}
                sx={{
                  color: "#e91e63", // Default color for the checkbox
                  "&.Mui-checked": {
                    color: "#e91e63", // Color when the checkbox is checked
                  },
                }}
              />
            }
            label="Voyear"
            sx={{ color: "white" }}
          />

          {/* {swingStyleOptions.length === 0 && (
                        <Typography sx={{ color: "white" }}>No options selected</Typography>
                    )} */}
        </Box>
        <Typography sx={{ color: "white", marginTop: "20px" }}>
          Tell others what you're all about
        </Typography>

        <TextField
          value={about || ""}
          onChange={handleAboutChange} // Add this function to handle the change in content
          variant="outlined"
          multiline
          minRows={4} // Adjust the number of rows as needed
          fullWidth
          sx={{
            backgroundColor: "#272525",
            color: "white",
            borderRadius: "10px",
            marginTop: "15px",
            "& .MuiOutlinedInput-root": {
              backgroundColor: "transparent", // Make background transparent inside the textarea
            },
            "& .MuiInputBase-input": {
              color: "white", // Set text color to white
            },
          }}
        />

        <FormControl
          fullWidth
          variant="outlined"
          sx={{ marginTop: "15px", background: "#272525" }}
        >
          <InputLabel
            id="account-type-label"
            sx={{ color: "white" }}
            shrink={!!accountType} // Force the label to float if there's a value
          >
            Account Type
          </InputLabel>
          <Select
            labelId="account-type-label"
            value={accountType}
            onChange={(e) => handleAccountTypeChange(e)}
            label="Account Type"
            sx={{
              color: "white",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#272525", // Adjust background color as needed
              },
              "& .MuiInputBase-input": {
                color: "white", // Set text color to white
              },
            }}
          >
            <MenuItem value="Couple">Couple</MenuItem>
            <MenuItem value="Man">Man</MenuItem>
            <MenuItem value="Women">Women</MenuItem>
            <MenuItem value="Throuple">Throuple</MenuItem>
          </Select>
        </FormControl>

        <Grid container spacing={3} mt={2}>
          {/* Right Column */}
          <Grid item xs={12} md={12}>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="white">
                Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ marginTop: "15px", background: "#272525" }}
              >
                <InputLabel
                  id="gender-label"
                  sx={{ color: "white" }}
                  shrink={!!gender} // Force the label to float if there's a value
                >
                  Gender
                </InputLabel>
                <Select
                  labelId="gender-label"
                  value={gender}
                  onChange={handleGenderChange}
                  label="Gender"
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#272525", // Adjust background color as needed
                    },
                    "& .MuiInputBase-input": {
                      color: "white", // Set text color to white
                    },
                  }}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Non-Binary">Non-Binary</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ mb: 2 }} />
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ marginTop: "15px", background: "#272525" }}
              >
                <InputLabel
                  id="orientation-label"
                  sx={{ color: "white" }}
                  shrink={!!orientation} // Force the label to float if there's a value
                >
                  Orientation
                </InputLabel>
                <Select
                  labelId="orientation-label"
                  value={orientation}
                  onChange={handleOrientationChange}
                  label="Orientation"
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#272525", // Adjust background color as needed
                    },
                    "& .MuiInputBase-input": {
                      color: "white", // Set text color to white
                    },
                  }}
                >
                  <MenuItem value="Straight">Straight</MenuItem>
                  <MenuItem value="Bi">Bi</MenuItem>
                  <MenuItem value="Bi-curious">Bi-curious</MenuItem>
                  <MenuItem value="Open minded">Open minded</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ mb: 2 }} />
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ marginTop: "15px", background: "#272525" }}
              >
                <InputLabel
                  id="body-type-label"
                  sx={{ color: "white" }}
                  shrink={!!bodyType} // Force the label to float if there's a value
                >
                  Body Type
                </InputLabel>
                <Select
                  labelId="body-type-label"
                  value={bodyType}
                  onChange={handleBodyTypeChange}
                  label="Body Type"
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#272525", // Adjust background color as needed
                    },
                    "& .MuiInputBase-input": {
                      color: "white", // Set text color to white
                    },
                  }}
                >
                  <MenuItem value="Average">Average</MenuItem>
                  <MenuItem value="Slim/Petite">Slim/Petite</MenuItem>
                  <MenuItem value="Ample">Ample</MenuItem>
                  <MenuItem value="Athletic">Athletic</MenuItem>
                  <MenuItem value="BBW/BBM">BBW/BBM</MenuItem>
                  <MenuItem value="A little extra padding">
                    A little extra padding
                  </MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ mb: 2 }} />
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ marginTop: "15px", background: "#272525" }}
              >
                <InputLabel
                  id="eyes-color-label"
                  sx={{ color: "white" }}
                  shrink={!!eyeColor} // Force the label to float if there's a value
                >
                  Eyes Color
                </InputLabel>
                <Select
                  labelId="eyes-color-label"
                  value={eyeColor}
                  onChange={handleEyeColorChange}
                  label="Eyes Color"
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#272525", // Adjust background color as needed
                    },
                    "& .MuiInputBase-input": {
                      color: "white", // Set text color to white
                    },
                  }}
                >
                  <MenuItem value="Gray">Gray</MenuItem>
                  <MenuItem value="Brown">Brown</MenuItem>
                  <MenuItem value="Black">Black</MenuItem>
                  <MenuItem value="Green">Green</MenuItem>
                  <MenuItem value="Blue">Blue</MenuItem>
                  <MenuItem value="Hazel">Hazel</MenuItem>
                </Select>
              </FormControl>

              <Divider sx={{ mb: 2 }} />
              <FormControl
                fullWidth
                variant="outlined"
                sx={{ marginTop: "15px", background: "#272525" }}
              >
                <InputLabel sx={{ color: "white" }}>Hair Color</InputLabel>
                <Select
                  value={hairColor}
                  onChange={handleHairColorChange}
                  label="Hair Color"
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#272525", // Adjust background color as needed
                    },
                    "& .MuiInputBase-input": {
                      color: "white", // Set text color to white
                    },
                  }}
                >
                  <MenuItem value="Platinum Blonde">Platinum Blonde</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                  <MenuItem value="Silver">Silver</MenuItem>
                  <MenuItem value="Hair? What Hair?">Hair? What Hair?</MenuItem>
                  <MenuItem value="Red/Auburn">Red/Auburn</MenuItem>
                  <MenuItem value="Grey">Grey</MenuItem>
                  <MenuItem value="White">White</MenuItem>
                  <MenuItem value="Blonde">Blonde</MenuItem>
                  <MenuItem value="Salt and Pepper">Salt and Pepper</MenuItem>
                  <MenuItem value="Brown">Brown</MenuItem>
                  <MenuItem value="Black">Black</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>

        {/* Profile Photos */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 2,
            color: "white",
            borderRadius: 2,
            gap: 2,
            width: "100%",
            overflowX: "auto", // Allow horizontal scrolling if needed
          }}
        >
          <Typography
            sx={{
              marginTop: 2,
              color: "white",
              textAlign: "center",
              marginBottom: 2,
            }}
          >
            Update Checked Public Images (Available to Everyone)
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: {
                xs: 2,
                sm: 3,
                md: 3,
                lg: 7,
              },
              width: "100%",
              flexWrap: "nowrap",
              overflowX: "auto",
            }}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  flexShrink: 0,
                  width: {
                    xs: "40px",
                    sm: "50px",
                    md: "75px",
                    lg: "200px",
                  },
                  height: {
                    xs: "40px",
                    sm: "50px",
                    md: "75px",
                    lg: "200px",
                  },
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                  position: "relative",
                  backgroundColor: "black", // Black background for the camera PNG
                }}
              >
                {profileImages[index] ? (
                  <img
                    src={profileImages[index]}
                    alt={`Profile Photo ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <label
                    htmlFor={`file-input-${index}`}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      cursor: "pointer",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src="/photocamera.png"
                      alt="Camera Icon"
                      style={{
                        width: "50%",
                        height: "50%",
                        objectFit: "contain",
                      }}
                    />
                    <input
                      id={`file-input-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleImageChange(index, event)}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        <hr />

        {/* Profile Photos */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 2,
            color: "white",
            borderRadius: 2,
            gap: 2,
            width: "100%",
            overflowX: "auto", // Allow horizontal scrolling if needed
          }}
        >
          <Typography
            sx={{
              marginTop: 2,
              color: "white",
              textAlign: "center",
              marginBottom: 2,
            }}
          >
            Update Checked Private Images (Only for those you authorize)
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: {
                xs: 2,
                sm: 3,
                md: 3,
                lg: 7,
              },
              width: "100%",
              flexWrap: "nowrap",
              overflowX: "auto",
            }}
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  flexShrink: 0,
                  width: {
                    xs: "40px",
                    sm: "50px",
                    md: "75px",
                    lg: "200px",
                  },
                  height: {
                    xs: "40px",
                    sm: "50px",
                    md: "75px",
                    lg: "200px",
                  },
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                  position: "relative",
                  backgroundColor: "black", // Black background for the camera PNG
                }}
              >
                {privateImages[index] ? (
                  <img
                    src={privateImages[index]}
                    alt={`Profile Photo ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <label
                    htmlFor={`file-input-${index}`}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      cursor: "pointer",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src="/photocamera.png"
                      alt="Camera Icon"
                      style={{
                        width: "50%",
                        height: "50%",
                        objectFit: "contain",
                      }}
                    />
                    <input
                      id={`file-input-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handlePrivateImageChange(index, event)
                      }
                      style={{ display: "none" }}
                    />
                  </label>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Enable Notifications & Delete Account */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 2,
            borderRadius: 2,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={enableNotifications}
                onChange={(e) => setEnableNotifications(e.target.checked)}
                sx={{ color: "pink" }}
              />
            }
            label="Enable notifications"
          />

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#e91e63", // Pink color
              color: "white",
              fontWeight: "bold",
              padding: "10px 20px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            Delete Account
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 2,
            borderRadius: 2,
          }}
        >
          <Button
            onClick={handleSubmitUpdateProfile}
            variant="contained"
            sx={{
              backgroundColor: "#e91e63", // Pink color
              color: "white",
              fontWeight: "bold",
              padding: "10px 20px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            Save
          </Button>
        </Box>
      </CardContent>

      <BottomNavigation
        sx={{
          position: "fixed", // Keeps it fixed at the bottom
          bottom: 0, // Aligns it to the bottom
          left: 0,
          right: 0,
          zIndex: 10, // Keeps it above other elements
          width: "100%", // Full width to avoid content spilling
          maxWidth: "500px", // Optional: Limit the maximum width for large screens
          margin: "0 auto", // Centers it on larger screens
          bgcolor: "#1e1e1e", // Background color
          boxShadow: "0px -1px 5px rgba(0,0,0,0.5)", // Adds shadow for better visibility
          display: "flex",
          justifyContent: "space-around", // Evenly distributes the actions
          padding: "0 10px", // Padding for the content
          borderRadius: "30px 30px 0 0", // Rounded corners on the top
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto", // Ensures no unnecessary width
            padding: "6px 8px", // Makes items smaller
          },
        }}
        value={bottomNav}
        onChange={() => console.log("tab")}
      >
        <BottomNavigationAction
          label="Home"
          icon={
            <img
              src="/icons/home.png"
              alt="Home"
              style={{ width: 40, height: 60, paddingTop: 15 }}
            />
          }
          sx={{
            color: "#c2185b",
            transition: "transform 0.3s ease-in-out",
            "&:hover": { transform: "translateY(-10px)" },
          }}
        />
        <BottomNavigationAction
          label="Members"
          icon={
            <img
              src="/icons/members.png"
              alt="Members"
              style={{ width: 40, height: 60, paddingTop: 15 }}
            />
          }
          sx={{
            color: "#c2185b",
            transition: "transform 0.3s ease-in-out",
            "&:hover": { transform: "translateY(-10px)" },
          }}
          onClick={() => router.push("/members")} // Navigate to /members when clicked
        />
        <BottomNavigationAction
          label="Pineapples"
          icon={
            <img
              src="/icons/pineapple.png"
              alt="Pineapples"
              style={{ width: 40, height: 60, paddingTop: 15 }}
            />
          }
          sx={{
            color: "#c2185b",
            transition: "transform 0.3s ease-in-out",
            "&:hover": { transform: "translateY(-10px)" },
          }}
        />
        <BottomNavigationAction
          label="Messaging"
          icon={
            <img
              src="/icons/messaging.png"
              alt="Messaging"
              style={{ width: 40, height: 60, paddingTop: 15 }}
            />
          }
          sx={{
            color: "#c2185b",
            transition: "transform 0.3s ease-in-out",
            "&:hover": { transform: "translateY(-10px)" },
          }}
        />
        <BottomNavigationAction
          label="Matches"
          icon={
            <img
              src="/icons/matches.png"
              alt="Matches"
              style={{ width: 40, height: 60, paddingTop: 15 }}
            />
          }
          sx={{
            color: "#c2185b",
            transition: "transform 0.3s ease-in-out",
            "&:hover": { transform: "translateY(-10px)" },
          }}
        />
      </BottomNavigation>

      {/* Cropper Dialog */}
      <Dialog open={openCropper} onClose={() => setOpenCropper(false)}>
        <DialogContent
          sx={{
            backgroundColor: "#000",
            color: "#fff",
            width: { lg: 400, md: 400, sm: 360, xs: 360 },
            height: { lg: 400, md: 400, sm: 360, xs: 360 },
            position: "relative",
          }}
        >
          {currentCropType && (
            <Cropper
              image={
                currentCropType === "avatar"
                  ? avatarImage || undefined // If `avatarImage` is null, pass undefined
                  : currentCropType === "banner"
                  ? bannerImage || undefined // If `bannerImage` is null, pass undefined
                  : undefined // For other cases
              }
              crop={crop}
              zoom={zoom}
              aspect={currentCropType === "avatar" ? 1 : 16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          )}
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: "#121212",
            padding: 2,
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={handleCropConfirm}
            sx={{
              backgroundColor: "#c2185b",
              "&:hover": { backgroundColor: "#ad1457" },
            }}
          >
            Crop
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
