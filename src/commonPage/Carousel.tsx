"use client";
import React, { useEffect, useState, useRef } from "react";
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
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
import SwiperCore, { Swiper as SwiperType } from "swiper";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y, Autoplay]);

type CarouselUser = {
  Avatar: string;
  Username: string;
  [key: string]: any;
};

const Carousel = ({ title }: { title: string }) => {
  const [data, setData] = useState<CarouselUser[]>([]);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Hold the Swiper instance
  const swiperRef = useRef<SwiperType | null>(null);

  const selected = selectedIndex != null ? data[selectedIndex] : null;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user/carouselList", {
          cache: "no-store",
        });
        const raw = await res.text();
        let json: any;
        try {
          json = JSON.parse(raw);
        } catch {
          throw new Error("Response is not valid JSON");
        }
        const pineapples = json?.pineapples ?? json?.data ?? json;
        const products = pineapples?.products ?? pineapples;
        setData(products);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    })();
  }, []);

  const hardLockSwiper = (idx?: number) => {
    const s = swiperRef.current;
    if (!s) return;

    // Move to the clicked slide instantly (no animation)
    if (typeof idx === "number") {
      // when loop is true, use slideToLoop
      s.slideToLoop(idx, 0, false);
    } else {
      // cancel any ongoing transition
      s.slideTo(s.activeIndex, 0, false);
    }

    // Stop autoplay + lock movement so nothing can advance
    try {
      s.autoplay?.stop();
    } catch {}
    s.allowSlideNext = false;
    s.allowSlidePrev = false;
    s.allowTouchMove = false;
  };

  const unlockSwiper = (idx?: number | null) => {
    const s = swiperRef.current;
    if (!s) return;

    // Ensure we’re exactly on the intended slide before unlocking
    if (typeof idx === "number") {
      s.slideToLoop(idx, 0, false);
    } else {
      s.slideTo(s.activeIndex, 0, false);
    }

    s.allowSlideNext = true;
    s.allowSlidePrev = true;
    s.allowTouchMove = true;
    try {
      s.autoplay?.start();
    } catch {}
  };

  const openWithIndex = (idx: number) => {
    setSelectedIndex(idx);
    setOpenProfileModal(true);

    // Immediately hard-lock swiper at the clicked slide
    // (Do it right away to prevent "one more" tick)
    hardLockSwiper(idx);
  };

  const closeModal = () => {
    // snapshot current selected index (we want to stay on it)
    const idx = selectedIndex;

    setOpenProfileModal(false);

    // Put swiper back on the same slide and unlock + restart autoplay
    unlockSwiper(idx ?? undefined);

    // Now we can clear the selection
    setSelectedIndex(null);
  };

  const gotoPrev = () => {
    if (!data.length || selectedIndex == null) return;
    setSelectedIndex((selectedIndex - 1 + data.length) % data.length);
  };

  const gotoNext = () => {
    if (!data.length || selectedIndex == null) return;
    setSelectedIndex((selectedIndex + 1) % data.length);
  };

  return (
    <>
      {data?.length > 0 && (
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

          <Box sx={{ width: "100%", mx: "auto", position: "relative" }}>
            {/* Left Arrow */}
            <IconButton
              className="custom-prev"
              sx={{
                position: "absolute",
                top: "50%",
                left: { xs: "-20px", sm: "-20px", md: "-20px", lg: "-20px" },
                transform: "translateY(-50%)",
                zIndex: 2,
                backgroundColor: "#e91e63",
                color: "#fff",
                "&:hover": { backgroundColor: "#d81b60" },
              }}
              // Even if clicked, Swiper won't move while locked
            >
              <ChevronLeft />
            </IconButton>

            {/* Right Arrow */}
            <IconButton
              className="custom-next"
              sx={{
                position: "absolute",
                top: "50%",
                right: { xs: "-20px", sm: "-20px", md: "-20px", lg: "-20px" },
                transform: "translateY(-50%)",
                zIndex: 2,
                backgroundColor: "#e91e63",
                color: "#fff",
                "&:hover": { backgroundColor: "#d81b60" },
              }}
            >
              <ChevronRight />
            </IconButton>

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
              autoplay={{ delay: 2000, disableOnInteraction: false }}
              breakpoints={{
                0: { slidesPerView: 3 },
                480: { slidesPerView: 3 },
                768: { slidesPerView: 3 },
              }}
              navigation={{ nextEl: ".custom-next", prevEl: ".custom-prev" }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
            >
              {data.map((img, index) => (
                <SwiperSlide key={index}>
                  <Box
                    onClick={() => openWithIndex(index)}
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
                      src={img?.Avatar}
                      alt={`user-${img?.Username}`}
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
      )}

      {/* Dialog shows the selected image */}
      <Dialog
        open={openProfileModal}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
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
        <DialogTitle
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontSize: { xs: "1rem", sm: "1rem" },
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {selected?.ImageType === "Event"
            ? "Don't miss this wild event! You must have a valid avatar to attend"
            : "Real Profiles waiting to meet you!"}

          {/* Right side close icon */}
          <IconButton
            onClick={closeModal}
            sx={{ color: "#fff", "&:hover": { opacity: 0.8 } }}
          >
            <X />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
          }}
        >
          {/* Prev / Next inside dialog */}
          <IconButton
            onClick={gotoPrev}
            sx={{
              position: "absolute",
              left: 8,
              zIndex: 2,
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.12)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
            }}
            disabled={selectedIndex == null}
          >
            <ChevronLeft />
          </IconButton>

          {/* The selected image */}
          {selected?.Avatar && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                backgroundColor: "#000",
              }}
            >
              <img
                src={selected.Avatar}
                alt={selected.Username}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}

          <IconButton
            onClick={gotoNext}
            sx={{
              position: "absolute",
              right: 8,
              zIndex: 2,
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.12)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
            }}
            disabled={selectedIndex == null}
          >
            <ChevronRight />
          </IconButton>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", py: 2 }}>
          <Button
            onClick={closeModal}
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
              maxWidth: 160,
              "&:hover": { bgcolor: "#e60060" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Carousel;
