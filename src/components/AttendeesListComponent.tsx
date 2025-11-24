import React, { useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
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

type AttendeesListProps = {
  attendees: Attendees[];
  eventId: any;
  loginId: any;
};

const AttendeesListComponent: React.FC<AttendeesListProps> = ({
  attendees,
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
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
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
        {attendees?.length === 0 ? (
          <Typography
            sx={{
              textAlign: "center",
              width: "100%",
              py: 3,
              color: "rgba(255,255,255,0.7)",
              fontSize: "16px",
            }}
          >
            No attendees yet
          </Typography>
        ) : (
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
                  width: { lg: "30%", md: "30%", sm: "30%", xs: "25%" },
                  textAlign: "center",
                }}
              >
                <Avatar
                  src={item.Avatar}
                  alt={item.Name}
                  onClick={() => {
                    setOpenModalUser({
                      state: true,
                      id: item.ProfileId,
                    });
                  }}
                  sx={{
                    width: "100%",
                    height: "auto",
                    aspectRatio: "1",
                    borderRadius: "10px",
                    cursor: "pointer",
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
        )}
      </Box>

      {/* Modal */}
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
