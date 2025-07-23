"use client";
import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Avatar, Modal, Button, Checkbox, FormControlLabel, BottomNavigation, BottomNavigationAction } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Flag } from "@mui/icons-material";
import TinderCard from "react-tinder-card";
import { useRouter } from "next/navigation";
import InstructionModal from "@/components/InstructionModal";
import UserProfileModal from "@/components/UserProfileModal";

export default function Home() {
  const [userProfiles, setUserProfiles] = useState<any[]>([]); // User profiles fetched from API
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current card index
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null); // Track swipe direction for animations
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(false);
  const [selectedUserId, setSelectedUserId] = useState<any>(null);
  const [relationCategory, setRelationCategory] = useState(null);
  const [profileId, setProfileId] = useState<any>("");
  const [bottomNav, setBottomNav] = useState();
  const [customProfile, setCustomProfile] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    // Simulate fetching user profiles
    const fetchUserProfiles = async () => {
      try {
        const response = await fetch("/api/user/sweeping?page=1&size=1000", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log(data);
        setUserProfiles(data?.profiles || []);
      } catch (error) {
        console.error("Error fetching user profiles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfiles();
    fetchData("");
  }, []);

  const fetchData = async (userId: string) => {
    if (userId) {
      console.log(userId, "======userId in view");
      setLoading(true);
      try {
        // Fetch advertiser data using the custom API
        const response = await fetch(`/api/user/sweeping/user?id=${userId}`);
        if (!response.ok) {
          console.error('Failed to fetch advertiser data:', response.statusText);
          setCustomProfile(undefined);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { user: advertiserData } = await response.json();
        if (!advertiserData) {
          console.error('Advertiser not found');
          setCustomProfile(undefined);
        } else {
          console.log(advertiserData, "=========advertiser data");
          setCustomProfile(advertiserData);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }

    }
  };

  const handleClose = () => {
    setShowDetail(false);
    setSelectedUserId(null);
  }

  const handleGrantAccess = async () => {
    try {
      // Check if t
      // he username exists
      const checkResponse = await fetch('/api/user/sweeping/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileid: profileId, targetid: userProfiles[currentIndex]?.Id }), // Pass the username to check
      });

      const checkData = await checkResponse.json();

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSwipe = (direction: string) => {
    // Set swipe direction state for feedback
    setSwipeDirection(direction);

    // Handle swipe logic
    if (direction === "left") {
      console.log("Disliked");
    } else if (direction === "right") {
      console.log("Liked");
    } else if (direction === "down") {
      console.log("Maybe");
    }

    // Move to the next card after a small delay
    setTimeout(() => {
      setSwipeDirection(null); // Reset swipe direction
      setCurrentIndex((prevIndex) => prevIndex + 1); // Increment index
    }, 500); // Reset after animation
  };

  const handleReportModalToggle = () => {
    setIsReportModalOpen((prev) => !prev);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center" // Centers horizontally
        alignItems="center" // Centers vertically
        height="100vh" // Full viewport height
        bgcolor="#121212" // Background color
      >
        <Box
          component="img"
          src="/loading.png"
          alt="Logo"
          sx={{
            width: '50px', // Set a fixed width
            height: 'auto', // Maintain aspect ratio
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#C2185B', paddingLeft: '10px', fontSize: '32px' }}>SWINGSOCIAL</span>
      </Box >
    );
  }

  if (userProfiles.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="#121212"
      >
        <Typography variant="h6" color="white">
          Please wait...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="#121212"
        position="relative"
        overflow="hidden"
        style={{ cursor: 'url(/icon.png) 16 16, auto' }}
      >
        <InstructionModal />
        <Box
          sx={{
            position: "absolute",
            top: "20px", // Adjust the top margin
            right: "20px", // Adjust the right margin
            zIndex: 10, // Ensure the button stays on top
          }}
        >
          <Button
            onClick={() => router.push("/profile/")} // Navigate to /profile page on click
            sx={{
              backgroundColor: "transparent",
              padding: 0,
              minWidth: 0,
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <Box
              component="img"
              src="/ProfileEdit.png"
              alt="Edit Profile"
              sx={{
                width: "50px", // Set a fixed width
                height: "auto", // Maintain aspect ratio
                flexShrink: 0,
              }}
            />
          </Button>
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="absolute"
          zIndex={1}
          sx={{
            top: '120px'
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{
              width: '200px', // Set a fixed width
              height: 'auto', // Maintain aspect ratio
              flexShrink: 0,
            }}
          />
        </Box>
        <UserProfileModal handleGrantAccess={handleGrantAccess} handleClose={handleClose} open={showDetail} userid={selectedUserId} />
        {userProfiles.slice(currentIndex, currentIndex + 1).map((profile, index) => (
          <TinderCard
            key={profile.Id}
            onSwipe={(dir) => handleSwipe(dir)}
            preventSwipe={["up"]}
          >
            <Box
              position="absolute"
              top="50%"
              left="50%"
              sx={{
                transform: "translate(-50%, -50%)",
                zIndex: userProfiles.length - index,
              }}
            >
              <Card
                sx={{
                  width: 300,
                  height: 450,
                  boxShadow: 5,
                  backgroundColor: "#1e1e1e",
                  color: "white",
                  borderRadius: "16px",
                  position: "relative",
                }}
              >
                <Box position="relative" width="100%" height="300px">
                  <Avatar
                    src={profile.Avatar || "noavatar.png"} // Provide the path to your default image here
                    alt={profile.Username} // Optionally handle a default alt as well
                    sx={{
                      width: "100%",
                      height: "100%",
                      borderTopLeftRadius: "16px",
                      borderTopRightRadius: "16px",
                      borderBottomLeftRadius: "0px",
                      borderBottomRightRadius: "0px",
                    }}
                  />
                  {/* Display feedback image based on swipe direction */}
                  {swipeDirection && (
                    <Box
                      position="absolute"
                      top="50%"
                      left="50%"
                      sx={{
                        transform: "translate(-50%, -50%)",
                        zIndex: 3,
                      }}
                    >
                      {swipeDirection === "left" && (
                        <img
                          src="/delete.png"
                          alt="Dislike"
                          style={{ width: "100px", height: "100px" }}
                        />
                      )}
                      {swipeDirection === "right" && (
                        <img
                          src="/like.png"
                          alt="Like"
                          style={{ width: "100px", height: "100px" }}
                        />
                      )}
                      {swipeDirection === "down" && (
                        <img
                          src="/maybe.png"
                          alt="Maybe"
                          style={{ width: "100px", height: "100px" }}
                        />
                      )}
                    </Box>
                  )}
                  <Box
                    position="absolute"
                    top={8}
                    right={8}
                    bgcolor="rgba(0,0,0,0.6)"
                    color="white"
                    p={1}
                    borderRadius={1}
                    fontSize={12}
                    sx={{
                      cursor: "pointer",
                    }}
                  >
                    <InfoIcon
                      sx={{
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setShowDetail(true);
                        if (profile?.Id != null) {
                          setSelectedUserId(profile.Id);
                        }
                      }} />
                  </Box>
                  <Box
                    position="absolute"
                    bottom={8}
                    right={8}
                    bgcolor="rgba(0,0,0,0.6)"
                    color="white"
                    p={1}
                    borderRadius={1}
                    fontSize={12}
                    sx={{ cursor: "pointer" }}
                    onClick={handleReportModalToggle}
                  >
                    <Flag sx={{ color: "#9c27b0" }} />
                  </Box>
                </Box>
                <CardContent>
                  <Typography variant="h6">{profile.Username}</Typography>
                  <Typography variant="body2" color="secondary">
                    {profile.Location}
                  </Typography>
                  <Typography variant="body2" color="secondary">
                    {profile.About}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </TinderCard>
        ))}

        <Modal open={isReportModalOpen} onClose={handleReportModalToggle}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              bgcolor: "#1e1e1e",
              color: "white",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6">Report or Block User</Typography>
            <FormControlLabel
              control={<Checkbox />}
              label="Report User"
              sx={{ color: "white" }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Block User"
              sx={{ color: "white" }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={() => console.log("Report submitted")}
            >
              Submit
            </Button>
          </Box>
        </Modal>
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
            icon={<img src="/icons/home.png" alt="Home" style={{ width: 40, height: 60, paddingTop: 15 }} />}
            sx={{
              color: "#c2185b",
              transition: "transform 0.3s ease-in-out",
              "&:hover": { transform: "translateY(-10px)" },
            }}
          />
          <BottomNavigationAction
            label="Community"
            icon={<img src="/icons/community.png" alt="Community" style={{ width: 40, height: 60, paddingTop: 15 }} />}
            sx={{
              color: "#c2185b",
              transition: "transform 0.3s ease-in-out",
              "&:hover": { transform: "translateY(-10px)" },
            }}
          />
          <BottomNavigationAction
            label="Members"
            icon={<img src="/icons/members.png" alt="Members" style={{ width: 40, height: 60, paddingTop: 15 }} />}
            sx={{
              color: "#c2185b",
              transition: "transform 0.3s ease-in-out",
              "&:hover": { transform: "translateY(-10px)" },
            }}
          />
          <BottomNavigationAction
            label="Pineapples"
            icon={<img src="/icons/pineapple.png" alt="Pineapples" style={{ width: 40, height: 60, paddingTop: 15 }} />}
            sx={{
              color: "#c2185b",
              transition: "transform 0.3s ease-in-out",
              "&:hover": { transform: "translateY(-10px)" },
            }}
          />
          <BottomNavigationAction
            label="Messaging"
            icon={<img src="/icons/messaging.png" alt="Messaging" style={{ width: 40, height: 60, paddingTop: 15 }} />}
            sx={{
              color: "#c2185b",
              transition: "transform 0.3s ease-in-out",
              "&:hover": { transform: "translateY(-10px)" },
            }}
          />
          <BottomNavigationAction
            label="Matches"
            icon={<img src="/icons/matches.png" alt="Matches" style={{ width: 40, height: 60, paddingTop: 15 }} />}
            sx={{
              color: "#c2185b",
              transition: "transform 0.3s ease-in-out",
              "&:hover": { transform: "translateY(-10px)" },
            }}
          />
        </BottomNavigation>
      </Box>

    </>
  );
}