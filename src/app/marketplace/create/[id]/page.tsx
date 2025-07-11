"use client";

import React, { useEffect, useState } from "react";
import { useMediaQuery, Input, Button } from "@mui/material";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import CreateProductModal from "../../../../components/CreateProductModal";
import ChangeImageModal from "../../../../components/ChangeImageModal";
import { toast } from "react-toastify";

type Params = Promise<{ id: string }>;

export default function ResponsivePage(props: { params: Params }) {
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
  const [data, setData] = useState<any>([]);
  const [editStatus, setEditStatus] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [link, setLink] = useState<any>("");
  const [categories, setCategories] = useState<any>([]);
  const [category, setCategory] = useState<any>("");
  const [openModal, setOpenModal] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [active, setActive] = useState<any>(false);

  const getIdFromParam = async () => {
    const params = await props.params;
    const pid: any = params.id;
    const data = await fetch(`/api/marketplace/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: pid }),
    }).then((res) => {
      return res.json();
    });
    const categories = await fetch("/api/marketplace/category", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      return res.json();
    });
    const datas = data.error ? [] : data.products;
    setData(datas);
    setCategories(categories.products);
  };

  useEffect(() => {
    getIdFromParam();
  }, [props]);

  useEffect(() => {
    getIdFromParam();
  }, [refresh]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLink(e.target.value);
  };

  const handleCategoryChange = (event: any) => {
    setCategory(event.target.value);
  };

  const onEdit = async (product: any) => {
    setEditStatus(product.Id);
    setPrice(product.Price);
    setTitle(product.Title);
    setDescription(product.Description);
    setCategory(product.Category);
    setLink(product.ExternalURL);
    setActive(product.Active);
  };

  const onDelete = async (productId: any) => {
    const result = await fetch("/api/marketplace/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: productId }),
    });
    if (result.ok) {
    } else {
      console.log("failed");
    }
  };

  const onSave = async (productId: any) => {
    const result = await fetch("/api/marketplace/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: productId,
        price: price,
        title: title,
        description: description,
        link: link,
        category: category,
        active: active,
      }),
    });
    if (result.ok) {
      toast.success("Product updated successfully");
    } else {
      toast.error("Failed to update product");
    }
  };

  const openChangeImageModal = (product: any) => {
    setSelectedProduct(product);
    setOpenImageModal(true);
  };

  return (
    <>
      <Header />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 20px 100px 20px",
          boxSizing: "border-box",
        }}
      >
        {isMobile ? (
          <div style={{ marginTop: "100px" }}>
            <CreateProductModal
              open={openModal}
              onClose={() => setOpenModal(false)}
              categories={categories}
            />
            <ChangeImageModal
              open={openImageModal}
              onClose={() => setOpenImageModal(false)}
              product={selectedProduct} // Pass selected product to the modal
            />
            <div style={{ display: "flex" }}>
              <div
                style={{ flex: "2", display: "flex", flexDirection: "column" }}
              >
                <h6 style={{ color: "white" }}>Your Products</h6>
              </div>
              <div
                style={{ flex: "1", display: "flex", flexDirection: "column" }}
              >
                <button onClick={() => setOpenModal(true)}>Add +</button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                maxWidth: "600px",
                marginTop: "10px",
              }}
            >
              {data.length > 0 ? (
                data.map((item: any, index: any) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "20px",
                      display: "flex",
                      gap: "20px",
                    }}
                  >
                    {/* Image Section */}
                    {/* <div
											style={{
												flex: "1", // This will make the image section take up one part of the row
												display: "flex",
												justifyContent: "center",
												alignItems: "center",
											}}
											onClick={() => openChangeImageModal(item)}
										>
											<img
												src={item.CoverImageUrl}
												alt="Product"
												style={{
													width: "100%",
													borderRadius: "8px",
													maxWidth: "300px",
												}} // Set a maxWidth to constrain image size
											/>
										</div> */}
                    <div
                      style={{
                        flex: "1", // This will make the image section take up one part of the row
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative", // Add relative position to the parent container
                        cursor: "pointer", // Add cursor pointer
                      }}
                      onClick={() => openChangeImageModal(item)} // Open modal on click
                    >
                      {/* Image */}
                      <img
                        src={item.CoverImageUrl}
                        alt="Product"
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          maxWidth: "300px",
                        }} // Set a maxWidth to constrain image size
                      />

                      {/* Overlay Text */}
                      <div
                        style={{
                          position: "absolute", // Position the text overlay absolutely relative to the parent
                          top: "50%", // Center vertically
                          left: "50%", // Center horizontally
                          transform: "translate(-50%, -50%)", // Adjust for perfect centering
                          color: "white", // Text color
                          fontSize: "10px", // Text size
                          backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
                          padding: "5px 10px", // Padding around the text
                          borderRadius: "5px", // Rounded edges
                        }}
                      >
                        Tap to we edit
                      </div>
                    </div>

                    {/* Details Section */}
                    <div
                      style={{
                        flex: "2", // This will make the details section take up two parts of the row
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        color: "white",
                        border: "1px solid #666",
                      }}
                    >
                      {/* Price and Title */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          margin: "10px 0",
                          gap: "10px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            padding: "0px 30px 0px 10px",
                          }}
                        >
                          Price :
                          {editStatus == item.Id && openEdit ? (
                            <input
                              defaultValue={price}
                              onChange={handlePriceChange}
                            />
                          ) : (
                            `$${item.Price}`
                          )}
                        </p>
                      </div>
                      <div style={{ padding: "10px" }}>
                        <p style={{ margin: 0, fontSize: "12px" }}>
                          Title :
                          {editStatus == item.Id && openEdit ? (
                            <input
                              defaultValue={title}
                              onChange={handleTitleChange}
                            />
                          ) : (
                            `${item.Title}`
                          )}
                        </p>
                      </div>

                      {/* Description */}
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          marginBottom: "20px",
                          fontSize: "12px",
                        }}
                      >
                        Description :
                        {editStatus == item.Id && openEdit ? (
                          <input
                            defaultValue={description}
                            onChange={handleDescriptionChange}
                          />
                        ) : (
                          `${item.Description}`
                        )}
                      </div>
                      {/* Link */}
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          marginBottom: "20px",
                          fontSize: "12px",
                        }}
                      >
                        Affiliate Product Link :
                        {editStatus == item.Id && openEdit ? (
                          <input
                            defaultValue={link}
                            onChange={handleLinkChange}
                          />
                        ) : (
                          `${item.ExternalURL}`
                        )}
                      </div>
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          marginBottom: "20px",
                          fontSize: "12px",
                        }}
                      >
                        Category :
                        {editStatus == item.Id && openEdit ? (
                          <select
                            value={category}
                            onChange={handleCategoryChange}
                          >
                            {categories.map((cat: any, index: any) => (
                              <option key={index} value={cat.id}>
                                {cat.Category}
                              </option>
                            ))}
                          </select>
                        ) : (
                          `${item.Category || "Unknown"}`
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between", // Distribute buttons evenly
                          alignItems: "center",
                          padding: "10px",
                          gap: "10px", // Add spacing between buttons
                        }}
                      >
                        {editStatus == item.Id && openEdit ? (
                          <button
                            onClick={() => onSave(item.Id)}
                            style={{
                              flex: 1,
                              padding: "10px",
                              fontSize: "12px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                              backgroundColor: "#444",
                              color: "white",
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                        ) : null}
                        <button
                          onClick={() => {
                            onEdit(item);
                            setOpenEdit(!openEdit);
                          }}
                          style={{
                            flex: 1, // Each button takes equal width
                            padding: "10px",
                            fontSize: "12px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            backgroundColor: "#444",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          {editStatus == item.Id && openEdit ? "Close" : "Edit"}
                        </button>
                        <button
                          onClick={() => onDelete(item.Id)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            fontSize: "12px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            backgroundColor: "#444",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                        {editStatus == item.Id && openEdit ? (
                          <button
                            onClick={() => setActive(!active)}
                            style={{
                              flex: 1,
                              padding: "10px",
                              fontSize: "12px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                              backgroundColor: "#444",
                              color: "white",
                              cursor: "pointer",
                            }}
                          >
                            {active ? "Unactive" : "Active"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    width: "100%",
                    maxWidth: "330px", // Adjust width for desktop
                    minWidth: "300px",
                    border: "1px solid #666",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#333",
                    color: "white",
                  }}
                >
                  No Product
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: "100px" }}>
            <CreateProductModal
              open={openModal}
              onClose={() => setOpenModal(false)}
              categories={categories}
            />
            <ChangeImageModal
              open={openImageModal}
              onClose={() => setOpenImageModal(false)}
              product={selectedProduct}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 20px",
              }}
            >
              <div
                style={{ flex: "3", display: "flex", flexDirection: "column" }}
              >
                <h3 style={{ color: "white" }}>Your Products</h3>
              </div>
              <div
                style={{ flex: "1", display: "flex", flexDirection: "column" }}
              >
                <button
                  onClick={() => setOpenModal(true)}
                  style={{
                    padding: "10px",
                    fontSize: "14px",
                    borderRadius: "5px",
                    backgroundColor: "#007BFF",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Add +
                </button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap", // Allows items to wrap to the next row if needed
                gap: "20px", // Spacing between items
                padding: "20px",
                justifyContent: "center", // Center items horizontally
              }}
            >
              {data.length > 0 ? (
                data.map((item: any, index: any) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "row", // Horizontal layout for desktop
                      gap: "20px",
                      width: "100%",
                      maxWidth: "1200px", // Adjust width for desktop
                      border: "1px solid #666",
                      borderRadius: "8px",
                      padding: "20px",
                      backgroundColor: "#333",
                      color: "white",
                    }}
                  >
                    <div
                      style={{
                        flex: "1", // This will make the image section take up one part of the row
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative", // Add relative position to the parent container
                        cursor: "pointer", // Add cursor pointer
                      }}
                      onClick={() => openChangeImageModal(item)} // Open modal on click
                    >
                      {/* Image */}
                      <img
                        src={item.CoverImageUrl}
                        alt="Product"
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          maxWidth: "300px",
                        }} // Set a maxWidth to constrain image size
                      />

                      {/* Overlay Text */}
                      <div
                        style={{
                          position: "absolute", // Position the text overlay absolutely relative to the parent
                          top: "50%", // Center vertically
                          left: "50%", // Center horizontally
                          transform: "translate(-50%, -50%)", // Adjust for perfect centering
                          color: "white", // Text color
                          fontSize: "14px", // Text size
                          backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
                          padding: "5px 10px", // Padding around the text
                          borderRadius: "5px", // Rounded edges
                        }}
                      >
                        Tap to we edit
                      </div>
                    </div>
                    {/* Details Section */}
                    <div
                      style={{
                        flex: "2", // This will make the details section take up two parts of the row
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      {/* Price and Title */}
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          marginBottom: "20px",
                          fontSize: "12px",
                        }}
                      >
                        Price :
                        {editStatus == item.Id && openEdit ? (
                          <Input
                            style={{ backgroundColor: "white", width: "100%" }}
                            defaultValue={price}
                            onChange={handlePriceChange}
                          />
                        ) : (
                          `${item.Price}`
                        )}
                      </div>
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          marginBottom: "20px",
                          fontSize: "12px",
                        }}
                      >
                        Title :
                        {editStatus == item.Id && openEdit ? (
                          <Input
                            style={{ backgroundColor: "white", width: "100%" }}
                            defaultValue={title}
                            onChange={handleTitleChange}
                          />
                        ) : (
                          `${item.Title}`
                        )}
                      </div>

                      {/* Description */}
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          marginBottom: "20px",
                          fontSize: "12px",
                        }}
                      >
                        Description :
                        {editStatus == item.Id && openEdit ? (
                          <Input
                            style={{ backgroundColor: "white", width: "100%" }}
                            defaultValue={description}
                            onChange={handleDescriptionChange}
                          />
                        ) : (
                          `${item.Description}`
                        )}
                      </div>
                      {/* Link */}
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          marginBottom: "20px",
                          fontSize: "12px",
                        }}
                      >
                        Affiliate Product Link :
                        {editStatus == item.Id && openEdit ? (
                          <Input
                            style={{ backgroundColor: "white", width: "100%" }}
                            defaultValue={link}
                            onChange={handleLinkChange}
                          />
                        ) : (
                          `${item.ExternalURL}`
                        )}
                      </div>
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          marginBottom: "20px",
                          fontSize: "12px",
                        }}
                      >
                        Category :
                        {editStatus == item.Id && openEdit ? (
                          <select
                            value={category}
                            onChange={handleCategoryChange}
                          >
                            {categories.map((cat: any, index: any) => (
                              <option key={index} value={cat.id}>
                                {cat.Category}
                              </option>
                            ))}
                          </select>
                        ) : (
                          `${item.Category || "Unknown"}`
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-around", // Space buttons evenly
                          alignItems: "center",
                          gap: "10px", // Add spacing between buttons
                        }}
                      >
                        {editStatus == item.Id && openEdit ? (
                          <button
                            onClick={() => onSave(item.Id)}
                            style={{
                              flex: 1,
                              padding: "10px",
                              fontSize: "12px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                              backgroundColor: "#444",
                              color: "white",
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                        ) : null}
                        <button
                          onClick={() => {
                            onEdit(item);
                            setOpenEdit(!openEdit);
                          }}
                          style={{
                            flex: 1, // Each button takes equal width
                            padding: "10px",
                            fontSize: "14px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            backgroundColor: "#444",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          {editStatus == item.Id && openEdit ? "Close" : "Edit"}
                        </button>
                        <button
                          onClick={() => onDelete(item.Id)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            fontSize: "14px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            backgroundColor: "#444",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                        {editStatus == item.Id && openEdit ? (
                          <button
                            onClick={() => setActive(!active)}
                            style={{
                              flex: 1,
                              padding: "10px",
                              fontSize: "12px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                              backgroundColor: "#444",
                              color: "white",
                              cursor: "pointer",
                            }}
                          >
                            {active ? "Unactive" : "Active"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    width: "600px",
                    maxWidth: "1200px", // Adjust width for desktop
                    border: "1px solid #666",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#333",
                    color: "white",
                  }}
                >
                  No Product
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
