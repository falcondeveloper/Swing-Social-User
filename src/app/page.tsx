"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Autocomplete,
  Button,
  Typography,
  Container,
  TextField,
} from "@mui/material";
import FcmTokenComp from "@/hooks/firebaseForeground";
import { getMessaging, onMessage } from "firebase/messaging";
import app from "../../firebase";
import useFcmToken from "@/hooks/useFCMToken";

interface UserProfile {
  Id: any;
  Username: any;
}

const UserSelectionPage = () => {
  const router = useRouter();
  const [profileId, setProfileId] = useState<any>("");
  const [profileUsername, setProfileUsername] = useState<any>("");
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { token, notificationPermissionStatus } = useFcmToken();

  useEffect(() => {
    router.push('/login');
  }, []);

  // useEffect(() => {
  //   const fetchUserProfiles = async () => {
  //     if (loading || !hasMore) return;

  //     try {
  //       setLoading(true);
  //       const response = await fetch(
  //         `/api/user/sweeping?page=${page}&size=50&search=${encodeURIComponent(searchQuery)}`
  //       );
  //       const data = await response.json();

  //       if (data?.profiles?.length > 0) {
  //         setUserProfiles((prevProfiles) =>
  //           page === 1 ? data.profiles : [...prevProfiles, ...data.profiles]
  //         );
  //       } else {
  //         setHasMore(false); // No more results
  //       }

  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching user profiles:", error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserProfiles();
  // }, [page, searchQuery]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (
      target.scrollHeight - target.scrollTop === target.clientHeight &&
      !loading &&
      hasMore
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const debounce = (func: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleSearchChange = debounce((value: string) => {
    setPage(1); // Reset to first page for new search
    setHasMore(true); // Reset pagination
    setSearchQuery(value);
  }, 300);

  const handleNext = () => {
    if (profileId) {
      localStorage.setItem("logged_in_profile", profileId);
      localStorage.setItem("profileUsername", profileUsername);
      router.push(`/home`);
    }
  };

  return (
    <>
      {/* <Container maxWidth="md">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100vh"
          bgcolor="#121212"
          color="white"
          paddingTop={5}
        >
          <Typography variant="h4" gutterBottom>
            Swing Social Beta
          </Typography>
          <Autocomplete
            value={userProfiles.find((user) => user.Id === profileId) || null}
            onChange={(event, newValue) => {
              if (newValue) {
                setProfileId(newValue.Id);
                setProfileUsername(newValue?.Username);
              } else {
                setProfileId("");
                setProfileUsername("");
              }
            }}
            options={userProfiles}
            getOptionLabel={(option) => option.Username || ""}
            isOptionEqualToValue={(option, value) => option.Id === value.Id}
            loading={loading}
            onScroll={handleScroll}
            filterOptions={(options, { inputValue }) => {
              const normalizedInput = inputValue.toLowerCase();
              return options.sort((a, b) => {
                const aStartsWith = a.Username.toLowerCase().startsWith(normalizedInput);
                const bStartsWith = b.Username.toLowerCase().startsWith(normalizedInput);
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                return a.Username.toLowerCase().localeCompare(b.Username.toLowerCase());
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Please select a User"
                variant="outlined"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  style: { color: "white" },
                }}
                style={{
                  backgroundColor: "#333",
                }}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.Id} style={{ color: "white", backgroundColor: "#333" }}>
                {option.Username}
              </li>
            )}
            noOptionsText="No users found"
            style={{
              backgroundColor: "#333",
              border: "1px solid white",
              width: "100%",
            }}
          />

          <Box marginTop={2}>
            <Button
              onClick={handleNext}
              disabled={!profileId}
              style={{
                backgroundColor: profileId ? "#4caf50" : "#555",
                color: "white",
                marginRight: "8px",
              }}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Container> */}
    </>
  );
};

export default UserSelectionPage;
