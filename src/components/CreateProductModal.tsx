import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  Typography,
  useMediaQuery,
} from "@mui/material";

export default function CreateProductModal({
  open,
  onClose,
  categories,
  onProductCreated,
}: {
  open: boolean;
  onClose: () => void;
  categories: any;
  onProductCreated?: (product: any) => void;
}) {
  const isMobile = useMediaQuery("(max-width:480px)");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState(""); // optional
  const [link, setLink] = useState(""); // optional
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [active, setActive] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setLink("");
    setPrice("");
    setImages([]);
    setPreviewImages([]);
    setActive(false);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const updatedImages = [...images];
      updatedImages[index] = file;
      setImages(updatedImages);

      const updatedPreviews = [...previewImages];
      updatedPreviews[index] = URL.createObjectURL(file);
      setPreviewImages(updatedPreviews);
    }
  };

  const uploadImage = async (image: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("image", image);
      const res = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload image");
      return data.blobUrl || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setSnackbar({
        open: true,
        message: "Title is required",
        severity: "error",
      });
      return;
    }
    if (!category) {
      setSnackbar({
        open: true,
        message: "Category is required",
        severity: "error",
      });
      return;
    }
    if (!price || isNaN(+price) || +price < 0) {
      setSnackbar({
        open: true,
        message: "Valid price is required",
        severity: "error",
      });
      return;
    }
    if (!images.length || !images.some((img) => img)) {
      setSnackbar({
        open: true,
        message: "At least 1 image is required",
        severity: "error",
      });
      return;
    }

    try {
      const uploadedImageUrls: string[] = [];
      for (const image of images) {
        if (image) {
          const url = await uploadImage(image);
          if (url) uploadedImageUrls.push(url);
        }
      }

      const OrganizerId = localStorage.getItem("logged_in_profile");

      const res = await fetch("/api/marketplace/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description: description.trim() || null, // optional
          link: link.trim() || null, // optional
          price,
          images: uploadedImageUrls,
          OrganizerId,
          active,
        }),
      });

      if (!res.ok) throw new Error("Failed to create product");

      const createdProduct = await res.json();

      setSnackbar({
        open: true,
        message: "Product created successfully!",
        severity: "success",
      });
      resetForm();
      onClose();
      if (onProductCreated) onProductCreated(createdProduct);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Error creating product",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "90%" : "50%",
            bgcolor: "#222",
            color: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" textAlign="center">
            Create Product
          </Typography>

          <Box
            display="flex"
            gap={2}
            flexDirection={isMobile ? "column" : "row"}
          >
            <TextField
              label="Title *"
              size="small"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{
                backgroundColor: "#333",
                input: { color: "white" },
                label: { color: "#aaa" },
              }}
            />
            <FormControl
              size="small"
              fullWidth
              sx={{ backgroundColor: "#333" }}
            >
              <InputLabel sx={{ color: "#aaa" }}>Category *</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{
                  color: "white",
                  ".MuiOutlinedInput-notchedOutline": { borderColor: "#aaa" },
                }}
              >
                {categories.map((cat: any, idx: number) => (
                  <MenuItem key={idx} value={cat.Category}>
                    {cat.Category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Description (optional)"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              backgroundColor: "#333",
              textarea: { color: "white" },
              label: { color: "#aaa" },
            }}
          />

          <Box
            display="flex"
            gap={2}
            flexDirection={isMobile ? "column" : "row"}
          >
            <TextField
              label="Affiliate Product Link (optional)"
              size="small"
              fullWidth
              value={link}
              onChange={(e) => setLink(e.target.value)}
              sx={{
                backgroundColor: "#333",
                input: { color: "white" },
                label: { color: "#aaa" },
              }}
            />
            <TextField
              label="Price ($) *"
              size="small"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              sx={{
                backgroundColor: "#333",
                input: { color: "white" },
                label: { color: "#aaa" },
              }}
            />
          </Box>

          <Typography variant="body2" sx={{ color: "#ccc", fontSize: "12px" }}>
            Add a link ONLY if you want the buyer to click into another website
            to purchase. Otherwise the buyer will contact you directly to
            arrange payment.
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
            }}
          >
            {[...Array(5)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "#000",
                  borderRadius: 1,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {previewImages[index] ? (
                  <img
                    src={previewImages[index]}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <label
                    htmlFor={`file-${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src="/photocamera.png"
                      alt="Upload"
                      style={{ width: 30 }}
                    />
                    <input
                      id={`file-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
              </Box>
            ))}
          </Box>

          <Button
            variant={active ? "outlined" : "contained"}
            color={active ? "error" : "success"}
            onClick={() => setActive(!active)}
          >
            {active ? "Deactivate" : "Activate"}
          </Button>

          <Button
            variant="contained"
            sx={{ bgcolor: "#007BFF", "&:hover": { bgcolor: "#0056b3" } }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
