"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/effect-coverflow";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";
import DialogTitle from "@mui/material/DialogTitle";
import SwiperCore from "swiper";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y, Autoplay]);

const demoImages = [
  "/images/event.png",
  "/images/event.png",
  "/images/event.png",
  "/images/event.png",
  "/images/event.png",
];

const Carousel = ({ title }: { title: string }) => {
  const [openProfileModal, setOpenProfileModal] = useState(false);
  return (
    <>
      <Grid
        item
        xs={12}
        sx={{ textAlign: "center", mt: 6 }}
        style={{ padding: "0 16px" }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            fontWeight: "bold",
            mb: 2,
            fontSize: "1.10rem",
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            width: "100%",
            mx: "auto",
            position: "relative",
          }}
        >
          {/* Left Arrow */}
          <IconButton
            className="custom-prev"
            sx={{
              position: "absolute",
              top: "50%",
              left: {
                xs: "-20px",
                sm: "-20px",
                md: "-20px",
                lg: "-20px",
              },
              transform: "translateY(-50%)",
              zIndex: 2,
              backgroundColor: "#e91e63",
              color: "#fff",
              "&:hover": { backgroundColor: "#d81b60" },
            }}
          >
            <ChevronLeft />
          </IconButton>

          {/* Right Arrow */}
          <IconButton
            className="custom-next"
            sx={{
              position: "absolute",
              top: "50%",
              right: {
                xs: "-20px",
                sm: "-20px",
                md: "-20px",
                lg: "-20px",
              },
              transform: "translateY(-50%)",
              zIndex: 2,
              backgroundColor: "#e91e63",
              color: "#fff",
              "&:hover": { backgroundColor: "#d81b60" },
            }}
          >
            <ChevronRight />
          </IconButton>

          {/* Gradient Overlays */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "50px",
              height: "100%",
              background: "linear-gradient(to right, #000000cc, transparent)",
              zIndex: 1,
              pointerEvents: "none",
              borderRadius: "16px 0 0 16px",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "50px",
              height: "100%",
              background: "linear-gradient(to left, #000000cc, transparent)",
              zIndex: 1,
              pointerEvents: "none",
              borderRadius: "0 16px 16px 0",
            }}
          />

          {/* Swiper Slider */}
          <Swiper
            modules={[
              Navigation,
              Pagination,
              Scrollbar,
              A11y,
              Autoplay,
              EffectCoverflow,
            ]}
            effect={"coverflow"}
            grabCursor={true}
            centeredSlides={true}
            spaceBetween={16}
            slidesPerView={3}
            loop={true}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              0: {
                slidesPerView: 3,
              },
              480: {
                slidesPerView: 3,
              },
              768: {
                slidesPerView: 3,
              },
            }}
            navigation={{
              nextEl: ".custom-next",
              prevEl: ".custom-prev",
            }}
          >
            {demoImages.map((img, index) => (
              <SwiperSlide key={index}>
                <Box
                  onClick={() => setOpenProfileModal(true)}
                  sx={{
                    cursor: "pointer",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: "16px",
                    overflow: "hidden",
                    mx: "auto",
                  }}
                >
                  <img
                    src={img}
                    alt={`user-${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "16px",
                    }}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Grid>

      <Dialog
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            bgcolor: "#1a1a1a",
            borderRadius: 4,
            mx: 2,
            overflow: "hidden",
            boxShadow: 10,
          },
        }}
      >
        {/* Title */}
        <DialogTitle
          sx={{
            color: "#fff",
            textAlign: "center",
            fontWeight: 700,
            fontSize: { xs: "1rem", sm: "1rem" },
            py: 2,
          }}
        >
          These are real profile pics!
        </DialogTitle>

        {/* Message */}
        <DialogContent
          sx={{
            color: "#ccc",
            textAlign: "center",
            px: 3,
            py: 3,
            fontSize: { xs: "0.95rem", sm: "1rem" },
          }}
        >
          Finish your signup and you can view all of our members.
        </DialogContent>

        {/* Button */}
        <DialogActions
          sx={{
            justifyContent: "center",
            py: 2,
          }}
        >
          <Button
            onClick={() => setOpenProfileModal(false)}
            variant="contained"
            sx={{
              px: 4,
              py: 1,
              fontWeight: "bold",
              fontSize: "1rem",
              borderRadius: 9999,
              textTransform: "none",
              bgcolor: "#ff006e",
              color: "#fff",
              width: "100%",
              maxWidth: 120,
              "&:hover": {
                bgcolor: "#e60060",
              },
            }}
          >
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Carousel;
