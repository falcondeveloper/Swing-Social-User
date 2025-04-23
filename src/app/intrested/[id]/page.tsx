"use client";
import React, { useState, Suspense, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useSearchParams } from 'next/navigation';
import { useRouter } from "next/navigation";
type Params = Promise<{ id: string }>

export default function ShowIntrest(props: { params: Params }) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [sexualOrientation, setSexualOrientation] = useState<string>("");

  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [partnerBirthday, setPartnerBirthday] = useState("");
  const [partnerGender, setPartnerGender] = useState("");
  const [partnerOrientation, setPartnerOrientation] = useState("");

  const sharedFieldStyles = {
    backgroundColor: "#2a2a2a",
    input: { color: "#fff" },
    mb: 2,
    mt: 2,
    borderRadius: "4px",
  };

  const [id, setId] = useState<string>(''); // State for error messages
  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      console.log(pid);
      setId(pid)
    }
    getIdFromParam();
  }, [props]);

  console.log(id);

  const handleOptionChange = (event: any) => {
    setSelectedOption(event.target.value as string);
  };

  const handleSexualChange = (event: any) => {
    setSexualOrientation(event.target.value as string);
  }

  const handlePartnerGenderChange = (event: any) => {
    setPartnerGender(event.target.value);
  };

  const handlePartnerOrientationChange = (event: any) => {
    setPartnerOrientation(event.target.value);
  };
  const router = useRouter();
  const [errors, setErrors] = useState<any>({});

  const validateFields = () => {
    const newErrors: any = {};
    if (!age) newErrors.age = "Age is required.";
    if (!gender) newErrors.gender = "Gender is required.";
    if (!sexualOrientation) newErrors.sexualOrientation = "Sexual orientation is required.";
    if (!partnerBirthday) newErrors.partnerBirthday = "Partner's age is required.";
    if (!partnerGender) newErrors.partnerGender = "Partner's gender is required.";
    if (!partnerOrientation) newErrors.partnerOrientation = "Partner's orientation is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    let isValid = false;

    if (selectedOption === "Women" || selectedOption === "Man") {
      // Validate only sexualOrientation for these options
      if (!sexualOrientation) {
        setErrors({ sexualOrientation: "Sexual orientation is required." });
        if (!age) {
          setErrors({ age: "Age is required." });
        }
      } else {
        isValid = true;
      }
    } else {
      // Validate all fields for other cases
      const allFieldsValid = validateFields();
      isValid = allFieldsValid;
    }

    if (!isValid) return;

    try {
      const requestBody =
        selectedOption === "Women" || selectedOption === "Man"
          ? {
            pid: id,
            accounttype: selectedOption,
            age: parseInt(age, 10),
            orientation1: sexualOrientation,
          }
          : {
            pid: id,
            accounttype: selectedOption,
            gender1: gender,
            age: parseInt(age, 10),
            orientation1: sexualOrientation,
            partnerbirthday: partnerBirthday,
            partnergender: partnerGender,
            partnerorientation: partnerOrientation,
          };

      if (selectedOption === "Women" || selectedOption === "Man") {

        const response = await fetch("/api/user/intrested", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          router.push(`/showinterest/${id}`);
        } else {
          console.error("Error submitting form:", response.statusText);
        }
      } else {
        const response = await fetch("/api/user/intrested/partner", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          router.push(`/showinterest/${id}`);
        } else {
          console.error("Error submitting form:", response.statusText);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };



  const renderAdditionalFields = () => {
    const sharedFieldStyles = {
      backgroundColor: "#2a2a2a",
      input: { color: "#fff" },
      mb: 2,
      mt: 2,
      borderRadius: "4px",
    };

    switch (selectedOption) {
      case "Man":
      case "Women":
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <TextField
                fullWidth
                label="What's your Age?"
                variant="filled"
                size="small"
                sx={sharedFieldStyles}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                error={!!errors.age}
                helperText={errors.age}
              />
            </Grid>
            <Select
              fullWidth
              value={sexualOrientation}
              onChange={handleSexualChange}
              variant="filled"
              displayEmpty
              size="small"
              sx={sharedFieldStyles}
              inputProps={{ "aria-label": "What's your sexual orientation?" }}
              error={!!errors.sexualOrientation}
            >
              <MenuItem value="" disabled>
                What's your sexual orientation?
              </MenuItem>
              <MenuItem value="Straight">Straight</MenuItem>
              <MenuItem value="Bi">Bi</MenuItem>
              <MenuItem value="Bi-curious">Bi-curious</MenuItem>
              <MenuItem value="Open minded">Open minded</MenuItem>
            </Select>
            {errors.sexualOrientation && (
              <Typography color="error" variant="body2">
                {errors.sexualOrientation}
              </Typography>
            )}
          </Suspense>
        );

      case "Throuple":
      case "Couple":
        return (
          <>
            <Suspense fallback={<div>Loading...</div>}>
              <Typography
                variant="h6"
                sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}
              >
                My Information
              </Typography>
              <TextField
                fullWidth
                label="What's your Age?"
                variant="filled"
                size="small"
                sx={sharedFieldStyles}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                error={!!errors.age}
                helperText={errors.age}
              />
              <Select
                fullWidth
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                variant="filled"
                displayEmpty
                size="small"
                sx={sharedFieldStyles}
                inputProps={{ "aria-label": "What's your sexual orientation?" }}
                error={!!errors.gender}
              >
                <MenuItem value="" disabled>
                  What's your Gender?
                </MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
              {errors.gender && (
                <Typography color="error" variant="body2">
                  {errors.gender}
                </Typography>
              )}
              <Select
                fullWidth
                value={sexualOrientation}
                onChange={handleSexualChange}
                variant="filled"
                displayEmpty
                size="small"
                sx={sharedFieldStyles}
                inputProps={{ "aria-label": "What's your sexual orientation?" }}
                error={!!errors.sexualOrientation}
              >
                <MenuItem value="" disabled>
                  What's your sexual orientation?
                </MenuItem>
                <MenuItem value="Straight">Straight</MenuItem>
                <MenuItem value="Bi">Bi</MenuItem>
                <MenuItem value="Bi-curious">Bi-curious</MenuItem>
                <MenuItem value="Open minded">Open minded</MenuItem>
              </Select>
              {errors.sexualOrientation && (
                <Typography color="error" variant="body2">
                  {errors.sexualOrientation}
                </Typography>
              )}
              <Typography
                variant="h6"
                sx={{ color: "#fff", fontWeight: "bold", mt: 2 }}
              >
                Your Partner's Info
              </Typography>
              <TextField
                fullWidth
                label="What's your partner's Age?"
                value={partnerBirthday}
                onChange={(e) => setPartnerBirthday(e.target.value)}
                variant="filled"
                size="small"
                sx={sharedFieldStyles}
                error={!!errors.partnerBirthday}
                helperText={errors.partnerBirthday}
              />
              <Select
                fullWidth
                value={partnerGender}
                onChange={handlePartnerGenderChange}
                variant="filled"
                displayEmpty
                size="small"
                sx={sharedFieldStyles}
                inputProps={{ "aria-label": "What's your partner's Gender?" }}
                error={!!errors.partnerGender}
              >
                <MenuItem value="" disabled>
                  What's your partner's Gender?
                </MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
              {errors.partnerGender && (
                <Typography color="error" variant="body2">
                  {errors.partnerGender}
                </Typography>
              )}
              <Select
                fullWidth
                value={partnerOrientation}
                onChange={handlePartnerOrientationChange}
                variant="filled"
                displayEmpty
                size="small"
                sx={sharedFieldStyles}
                inputProps={{ "aria-label": "What's your partner's orientation?" }}
                error={!!errors.partnerOrientation}
              >
                <MenuItem value="" disabled>
                  What's your partner's orientation?
                </MenuItem>
                <MenuItem value="Straight">Straight</MenuItem>
                <MenuItem value="Bi">Bi</MenuItem>
                <MenuItem value="Bi-curious">Bi-curious</MenuItem>
                <MenuItem value="Open minded">Open minded</MenuItem>
              </Select>
              {errors.partnerOrientation && (
                <Typography color="error" variant="body2">
                  {errors.partnerOrientation}
                </Typography>
              )}
            </Suspense>
          </>
        );

      default:
        return null;
    }
  };



  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Box
        sx={{
          backgroundColor: "#000",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: "#121212",
            borderRadius: "16px",
            maxWidth: "600px",
            padding: "32px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{ color: "#fff", fontWeight: "bold", mb: 2 }}
            >
              I am a
            </Typography>
            <Typography sx={{ color: "#aaa", fontSize: "0.85rem", mt: 1 }}>
              Everyone's welcome on SwingSocial
            </Typography>
            <Select
              fullWidth
              value={selectedOption}
              onChange={handleOptionChange}
              variant="filled"
              displayEmpty
              sx={{
                backgroundColor: "#2a2a2a",
                color: "#fff",
                mb: 2,
                mt: 2,
                borderRadius: "4px",
              }}
              inputProps={{ "aria-label": "Select your option" }}
            >
              <MenuItem value="" disabled>
                Select your option
              </MenuItem>
              <MenuItem value="Man">Man</MenuItem>
              <MenuItem value="Women">Women</MenuItem>
              <MenuItem value="Throuple">Throuple</MenuItem>
              <MenuItem value="Couple">Couple</MenuItem>
            </Select>
            {renderAdditionalFields()}
          </Grid>
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Button
              sx={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#c2185b",
                color: "#fff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto",
                mt: 2,
                "&:hover": { backgroundColor: "#ad1457" },
              }}
              onClick={handleContinue}
            >
              <ArrowForwardIosIcon />
            </Button>
          </Grid>

          <Grid item xs={12} sx={{ textAlign: "center", mt: 4 }}>
            <Typography
              sx={{ color: "#c2185b", fontWeight: "bold", fontSize: "1rem" }}
            >
              Come party with us
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Suspense>
  );
}
