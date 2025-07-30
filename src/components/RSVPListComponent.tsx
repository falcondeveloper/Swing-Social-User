import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useRouter } from "next/navigation";

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

const RSVPListComponent: React.FC<RSVPListProps> = ({
  rsvp,
  loginId,
  eventId,
}) => {
  const router = useRouter();

  return (
    <Box
      sx={{
        marginTop: 1,
        maxHeight: "400px",
        overflowY: "auto",
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
              width: { lg: "30%", md: "30%", sm: "30%", xs: "25%" },
              textAlign: "center",
            }}
          >
            <Avatar
              src={item.Avatar}
              alt={item.Name}
              onClick={() => {
                router.push(
                  `/attendeeswing?q=${item.ProfileId}&id=${loginId}&eventid=${eventId}`
                );
              }}
              sx={{
                width: "100%",
                height: "auto",
                aspectRatio: "1",
                borderRadius: "10px",
              }}
            />
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
