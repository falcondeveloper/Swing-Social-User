"use client";

import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Container } from "@mui/material";

const CreateEventForm = () => {
  return (
    <>
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
          pb: { xs: 8 },
        }}
      ></Container>
      <Footer />
    </>
  );
};

export default CreateEventForm;
