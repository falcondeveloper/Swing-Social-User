import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useRouter } from 'next/navigation';

type RSVP = {
  Username: string;
  ProfileId: string;
  Email: string;
  Avatar: string;
  Name: string;
  Phone: string;
  TicketType: string;
  Price: number;
};

type RSVPListProps = {
  rsvp: RSVP[];
  loginId: any;
  eventId: any;
};

const RSVPListComponent: React.FC<RSVPListProps> = ({ rsvp, loginId, eventId }) => {

  const router = useRouter();
  console.log(rsvp)

  return (
    <Box
      sx={{
        marginTop: 1,
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
        {rsvp.map((item) => (
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
                // router.push(`/members?q=${item.ProfileId}`);
                router.push(`/attendeeswing?q=${item.ProfileId}&id=${loginId}&eventid=${eventId}`);
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
  );
};

export default RSVPListComponent;
