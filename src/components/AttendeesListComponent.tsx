import React, { useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useRouter } from "next/navigation";
import UserProfileModal from "./UserProfileModal";

type Attendees = {
  Username: string;
  ProfileId: string;
  Email: string;
  Avatar: string;
  Name: string;
  Phone: string;
  TicketType: string;
  Price: number;
};

// type AttendeesListProps = {
//   attendees: Attendees[];
// };

type AttendeesListProps = {
  attendees: Attendees[];
  eventId: any;
  loginId: any;
};

const AttendeesListComponent: React.FC<AttendeesListProps> = ({
  attendees,
  loginId,
  eventId,
}) => {
  const [openModalUser, setOpenModalUser] = useState<{
    state: boolean;
    id: null | string;
  }>({
    state: false,
    id: null,
  });

  const handleGrantAccess = async () => {
    try {
      // const checkResponse = await fetch('/api/user/sweeping/grant', {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({ profileid: profileId, targetid: userProfiles[currentIndex]?.Id }),
      // });

      // const checkData = await checkResponse.json();
      const checkData = "121212";
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Box
        sx={{
          marginTop: 4,
          maxHeight: "400px", // Set max height for scroll
          overflowY: "auto", // Enable vertical scroll
          border: "1px solid white",
          padding: 2,
          borderRadius: "10px",
          backgroundColor: "transparent",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "space-between",
          }}
        >
          {attendees.map((item) => (
            <Box
              key={item.ProfileId}
              sx={{
                width: { lg: "30%", md: "30%", sm: "30%", xs: "25%" }, // Approximately 3 items per row
                textAlign: "center",
              }}
            >
              {/* Avatar Image */}
              <Avatar
                src={item.Avatar}
                alt={item.Name}
                onClick={() => {
                  //Open modal with profile
                  setOpenModalUser({
                    state: true,
                    id: item.ProfileId,
                  });
                }}
                sx={{
                  width: "100%",
                  height: "auto",
                  aspectRatio: "1", // Make it square
                  borderRadius: "10px", // Slightly rounded corners
                }}
              />
              {/* Name */}
              <Typography
                variant="body2"
                color="white"
                sx={{ marginTop: 1, overflowWrap: "break-word" }}
              >
                {item.Username}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <UserProfileModal
        handleGrantAccess={handleGrantAccess}
        open={openModalUser.state}
        userid={openModalUser.id}
        handleClose={() => setOpenModalUser({ state: false, id: null })}
      />
    </>
  );
};

export default AttendeesListComponent;
