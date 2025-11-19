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
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const [profileId, setProfileId] = useState<any>();
  const router = useRouter();

  const [showDistanceSlider, setShowDistanceSlider] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [cityLoading, setCityLoading] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [cityOption, setCityOption] = useState<any>([]);
  const [savedOptions, setSavedOptions] = useState<any>(null);
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
    window.scroll(0, 0);
    e.preventDefault();
    try {
      const response = await fetch("/api/user/preference/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginId: profileId, payload: formData }),
      });

      const data = await response.json();

      if (data.status === 200) {
        router.push("/members");
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
            label={key
              .replace("single", "Single ")
              .replace("Male", "Males")
              .replace("Female", "Females")
              .replace("couples", "Couples")}
            sx={{ color: "white" }}
          />
        ))}
      </Box>

      {/* Distance */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="white">
        What is the maximum distance to a profile I want to see during swiping?
        This applies to my current location.
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
        <Box
          sx={{
            mt: 2,
            width: { xs: "100%", sm: 400, md: 500 },
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Slider
              value={formData.maxDistance}
              min={0}
              max={150}
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: "0 mi" },
                { value: 50, label: "50" },
                { value: 100, label: "100" },
                { value: 150, label: "150" },
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

          <Box sx={{ minWidth: 72, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "white" }}>
              {formData.maxDistance} mi
            </Typography>
          </Box>
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
            label={key
              .replace("single", "Single ")
              .replace("Male", "Males")
              .replace("Female", "Females")
              .replace("couples", "Couples")}
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
      </Box>

      {/* Submit Button */}
      <Box
        sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 4 }}
      >
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




// "use client";

// import { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Divider,
//   FormControlLabel,
//   Checkbox,
//   Slider,
//   CircularProgress,
//   TextField,
//   Autocomplete,
//   Button,
//   Paper,
//   Grid,
//   FormGroup,
//   Stack,
//   IconButton,
// } from "@mui/material";
// import { ArrowLeft } from "lucide-react";
// import { useRouter } from "next/navigation";

// interface FormDataType {
//   city: string;
//   swiping: {
//     couples: boolean;
//     singleMale: boolean;
//     singleFemale: boolean;
//   };
//   maxDistance: number;
//   distanceChecked: boolean;
//   block: {
//     couples: boolean;
//     singleMale: boolean;
//     singleFemale: boolean;
//   };
// }

// // desired default distance for new users (miles)
// const NEW_DEFAULT_DISTANCE = 15;
// const SLIDER_MIN = 0;
// const SLIDER_MAX = 150;

// export default function Preferences() {
//   const [profileId, setProfileId] = useState<any>();
//   const router = useRouter();

//   const [showDistanceSlider, setShowDistanceSlider] = useState(false);
//   const [errors, setErrors] = useState<any>({});

//   const [cityLoading, setCityLoading] = useState(false);
//   const [openCity, setOpenCity] = useState(false);
//   const [cityOption, setCityOption] = useState<any>([]);
//   const [savedOptions, setSavedOptions] = useState<any>(null);
//   const [cityInput, setCityInput] = useState<string>("");

//   const clamp = (v: number) => Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, v));

//   const [formData, setFormData] = useState<FormDataType>({
//     city: "",
//     swiping: {
//       couples: false,
//       singleMale: false,
//       singleFemale: false,
//     },
//     maxDistance: NEW_DEFAULT_DISTANCE,
//     distanceChecked: false,
//     block: {
//       couples: false,
//       singleMale: false,
//       singleFemale: false,
//     },
//   });

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedProfileId = localStorage.getItem("logged_in_profile");
//       setProfileId(storedProfileId);
//       handleGetPreferences(storedProfileId);
//     }
//   }, []);

//   useEffect(() => {
//     if (savedOptions) {
//       // Use nullish coalescing to preserve valid 0 values (if any)
//       const loadedDistance = (savedOptions.Distance ??
//         NEW_DEFAULT_DISTANCE) as number;
//       setFormData({
//         city: savedOptions.CityState || "",
//         swiping: {
//           couples: savedOptions.Couples === 1,
//           singleMale: savedOptions.SingleMales === 1,
//           singleFemale: savedOptions.SingleFemales === 1,
//         },
//         maxDistance: clamp(loadedDistance),
//         distanceChecked: savedOptions.UseDistance === 1,
//         block: {
//           couples: savedOptions.BlockCouples === 1,
//           singleMale: savedOptions.BlockSingleMales === 1,
//           singleFemale: savedOptions.BlockSingleFemales === 1,
//         },
//       });
//       setShowDistanceSlider(savedOptions.UseDistance === 1);
//     }
//   }, [savedOptions]);

//   useEffect(() => {
//     if (!openCity) {
//       setCityOption([]);
//     }
//   }, [openCity]);

//   useEffect(() => {
//     if (!openCity) return;
//     if (cityInput === "") return;

//     const fetchData = async () => {
//       setCityLoading(true);

//       try {
//         const response = await fetch(`/api/user/city?city=${cityInput}`);
//         if (!response.ok) {
//           console.error("Failed to fetch city data:", response.statusText);
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const { cities }: { cities: any } = await response.json();

//         const uniqueCities = cities.filter(
//           (city: any, index: any, self: any) =>
//             index === self.findIndex((t: any) => t.City === city.City)
//         );

//         setCityOption(uniqueCities);
//       } catch (error) {
//         console.error("Error fetching city data:", error);
//       } finally {
//         setCityLoading(false);
//       }
//     };

//     const delayDebounceFn = setTimeout(() => {
//       fetchData();
//     }, 500);

//     return () => clearTimeout(delayDebounceFn);
//   }, [cityInput, openCity]);

//   const handleGetPreferences = async (userId: any) => {
//     try {
//       const checkResponse = await fetch("/api/user/preference", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           id: userId,
//         }),
//       });
//       const checkData = await checkResponse.json();
//       setSavedOptions(checkData.data[0].get_preferences);
//     } catch (error) {
//       console.error("Error fetching preferences:", error);
//     }
//   };

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, checked } = event.target;

//     const [section, key] = name.split(".");

//     if (
//       section in formData &&
//       key in (formData[section as keyof FormDataType] as object)
//     ) {
//       setFormData((prevState) => ({
//         ...prevState,
//         [section]: {
//           ...(prevState[section as keyof FormDataType] as object),
//           [key]: checked,
//         },
//       }));
//     }
//   };

//   const handleSliderChange = (event: Event, value: number | number[]) => {
//     setFormData((prevState) => ({
//       ...prevState,
//       maxDistance: clamp(value as number),
//     }));
//   };

//   const handleCityChange = (event: any, newValue: any) => {
//     if (newValue?.City) {
//       setFormData((prevState) => ({
//         ...prevState,
//         city: newValue?.City,
//       }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     window.scroll(0, 0);
//     e.preventDefault();
//     try {
//       const payload = {
//         ...formData,
//         maxDistance: clamp(formData.maxDistance),
//       };

//       const response = await fetch("/api/user/preference/update", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ loginId: profileId, payload }),
//       });

//       const data = await response.json();

//       if (data.status === 200) {
//         router.push("/members");
//       } else {
//         console.log(data.message);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         px: { xs: 2, sm: 3, md: 4 },
//         py: { xs: 3, md: 6 },
//         display: "flex",
//         justifyContent: "center",
//       }}
//     >
//       <Paper
//         elevation={6}
//         sx={{
//           width: "100%",
//           maxWidth: 980,
//           borderRadius: 2,
//           p: { xs: 2, sm: 3, md: 4 },
//           background:
//             "linear-gradient(180deg, rgba(20,20,20,0.9), rgba(14,14,14,0.95))",
//         }}
//       >
//         <Stack spacing={2}>
//           <Box
//             display="flex"
//             alignItems="center"
//             justifyContent="space-between"
//           >
//             <Box display="flex" alignItems="center" gap={1}>
//               <IconButton
//                 size="small"
//                 onClick={() => router.back()}
//                 sx={{
//                   color: "rgba(255,255,255,0.8)",
//                   bgcolor: "transparent",
//                   borderRadius: 1,
//                   "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
//                 }}
//               >
//                 <ArrowLeft size={18} />
//               </IconButton>
//               <Typography variant="h5" color="white">
//                 Preferences
//               </Typography>
//             </Box>

//             <Box>
//               <Button
//                 onClick={handleSubmit}
//                 variant="contained"
//                 sx={{
//                   textTransform: "none",
//                   backgroundColor: "#f50057",
//                   "&:hover": { backgroundColor: "#c51162" },
//                 }}
//               >
//                 Save
//               </Button>
//             </Box>
//           </Box>

//           <Divider sx={{ bgcolor: "#e91e63" }} />

//           {/* Swiping preferences */}
//           <Box>
//             <Typography variant="subtitle1" gutterBottom color="white">
//               Who can see me when they are swiping or searching?
//             </Typography>

//             <FormGroup row sx={{ gap: 2 }}>
//               {[
//                 { key: "couples", label: "Couples" },
//                 { key: "singleMale", label: "Single Males" },
//                 { key: "singleFemale", label: "Single Females" },
//               ].map((item) => (
//                 <FormControlLabel
//                   key={item.key}
//                   control={
//                     <Checkbox
//                       name={`swiping.${item.key}`}
//                       checked={(formData.swiping as any)[item.key]}
//                       onChange={handleChange}
//                       sx={{
//                         color: "#e91e63",
//                         "&.Mui-checked": { color: "#e91e63" },
//                       }}
//                     />
//                   }
//                   label={<Typography color="white">{item.label}</Typography>}
//                 />
//               ))}
//             </FormGroup>
//           </Box>

//           <Divider sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />

//           {/* Distance */}
//           <Box>
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={12} md={8}>
//                 <Typography variant="subtitle1" gutterBottom color="white">
//                   What is the maximum distance to a profile I want to see during
//                   swiping? (applies to your current location)
//                 </Typography>

//                 <Box display="flex" alignItems="center" gap={1}>
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={showDistanceSlider}
//                         onChange={() => setShowDistanceSlider((prev) => !prev)}
//                         sx={{
//                           color: "#e91e63",
//                           "&.Mui-checked": { color: "#e91e63" },
//                         }}
//                       />
//                     }
//                     label={
//                       <Typography color="white">Use Max Distance</Typography>
//                     }
//                   />
//                 </Box>

//                 {showDistanceSlider && (
//                   <Box sx={{ mt: 2 }}>
//                     <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
//                       <Box sx={{ flex: 1 }}>
//                         <Slider
//                           value={formData.maxDistance}
//                           min={SLIDER_MIN}
//                           max={SLIDER_MAX}
//                           onChange={handleSliderChange}
//                           valueLabelDisplay="auto"
//                           marks={[
//                             { value: 0, label: "0 mi" },
//                             { value: 15, label: "15" },
//                             { value: 50, label: "50" },
//                             { value: 100, label: "100" },
//                             { value: 150, label: "150" },
//                           ]}
//                           sx={{
//                             color: "#e91e63",
//                             "& .MuiSlider-thumb": { borderRadius: "50%" },
//                             "& .MuiSlider-markLabel": {
//                               color: "rgba(255,255,255,0.85)",
//                             },
//                           }}
//                         />
//                       </Box>

//                       <Box sx={{ minWidth: 72, textAlign: "center" }}>
//                         <Typography
//                           variant="body2"
//                           sx={{ color: "white", fontWeight: 600 }}
//                         >
//                           {formData.maxDistance} mi
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </Box>
//                 )}
//               </Grid>

//               <Grid item xs={12} md={4}>
//                 {/* Small helper card about distance */}
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     bgcolor: "rgba(255,255,255,0.03)",
//                     p: 2,
//                     borderRadius: 1,
//                     height: "100%",
//                   }}
//                 >
//                   <Typography variant="body2" color="white" sx={{ mb: 1 }}>
//                     Tip
//                   </Typography>
//                   <Typography variant="caption" color="rgba(255,255,255,0.8)">
//                     Use the slider to limit profiles by distance. The default
//                     for new users is {NEW_DEFAULT_DISTANCE} miles.
//                   </Typography>
//                 </Paper>
//               </Grid>
//             </Grid>
//           </Box>

//           <Divider sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />

//           {/* Blocking Preferences */}
//           <Box>
//             <Typography variant="subtitle1" gutterBottom color="white">
//               Who should I block when I am swiping?
//             </Typography>

//             <FormGroup row sx={{ gap: 2 }}>
//               {[
//                 { key: "couples", label: "Couples" },
//                 { key: "singleMale", label: "Single Males" },
//                 { key: "singleFemale", label: "Single Females" },
//               ].map((item) => (
//                 <FormControlLabel
//                   key={item.key}
//                   control={
//                     <Checkbox
//                       name={`block.${item.key}`}
//                       checked={(formData.block as any)[item.key]}
//                       onChange={handleChange}
//                       sx={{
//                         color: "#e91e63",
//                         "&.Mui-checked": { color: "#e91e63" },
//                       }}
//                     />
//                   }
//                   label={<Typography color="white">{item.label}</Typography>}
//                 />
//               ))}
//             </FormGroup>
//           </Box>

//           <Divider sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />

//           {/* City */}
//           <Box>
//             <Typography variant="subtitle1" gutterBottom color="white">
//               Enter the Location to Block
//             </Typography>

//             <Autocomplete
//               id="autocomplete-filled"
//               open={openCity}
//               clearOnBlur
//               onOpen={() => setOpenCity(true)}
//               onClose={() => setOpenCity(false)}
//               isOptionEqualToValue={(option: any, value: any) =>
//                 option.id === value.id
//               }
//               getOptionLabel={(option: any) => option.City || ""}
//               options={cityOption.map((city: any) => ({
//                 ...city,
//                 key: city.id,
//               }))}
//               loading={cityLoading}
//               inputValue={cityInput}
//               onInputChange={(event: any, newInputValue: any) => {
//                 if (event?.type === "change" || event?.type === "click")
//                   setCityInput(newInputValue);
//               }}
//               onChange={handleCityChange}
//               renderInput={(params: any) => (
//                 <TextField
//                   {...params}
//                   variant="filled"
//                   label="City"
//                   error={!!errors.city}
//                   helperText={errors.city}
//                   InputProps={{
//                     ...params.InputProps,
//                     endAdornment: (
//                       <>
//                         {cityLoading ? (
//                           <CircularProgress color="inherit" size={15} />
//                         ) : null}
//                         {params.InputProps.endAdornment}
//                       </>
//                     ),
//                   }}
//                   sx={{
//                     backgroundColor: "#2a2a2a",
//                     input: { color: "#fff" },
//                     mb: 0,
//                     borderRadius: "4px",
//                     width: "100%",
//                   }}
//                 />
//               )}
//             />
//           </Box>

//           <Divider sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />

//           {/* Footer actions */}
//           <Box
//             display="flex"
//             justifyContent="space-between"
//             gap={2}
//             flexWrap="wrap"
//           >
//             <Button
//               onClick={() => router.back()}
//               sx={{
//                 textTransform: "none",
//                 color: "rgba(255,255,255,0.9)",
//                 border: "1px solid rgba(255,255,255,0.06)",
//                 px: 3,
//               }}
//             >
//               Cancel
//             </Button>

//             <Box
//               sx={{
//                 flex: "1 1 auto",
//                 display: "flex",
//                 justifyContent: "flex-end",
//               }}
//             >
//               <Button
//                 onClick={handleSubmit}
//                 variant="contained"
//                 sx={{
//                   textTransform: "none",
//                   backgroundColor: "#f50057",
//                   "&:hover": { backgroundColor: "#c51162" },
//                   px: 4,
//                 }}
//               >
//                 Save Preferences
//               </Button>
//             </Box>
//           </Box>
//         </Stack>
//       </Paper>
//     </Box>
//   );
// }
