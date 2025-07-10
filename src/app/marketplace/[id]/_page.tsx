"use client";

import React, { useEffect, useState } from "react";
import { useMediaQuery, Input, Box, Button } from "@mui/material";
import Slider from "react-slick";
import { jwtDecode } from "jwt-decode";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

type Params = Promise<{ id: string }>;

export default function ResponsivePage(props: { params: Params }) {
  const isMobile = useMediaQuery("(max-width: 480px)") ? true : false;
  const [id, setId] = useState<string>("");
  const [data, setData] = useState<any>({});
  const [images, setImages] = useState<any>([]);
  const [profile, setProfile] = useState<any>({});
  const [content, setContent] = useState<any>("");
  const [loginUserEmail, setLoginUserEmail] = useState<any>("");

  useEffect(() => {
    const getIdFromParam = async () => {
      const params = await props.params;
      const pid: any = params.id;
      const data = await fetch(`/api/marketplace/oneproduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: pid }),
      }).then((res) => {
        return res.json();
      });
      console.log(data.products[0]);
      setData(data.products[0]);
      const images = [
        { img: data.products[0].Image1 },
        { img: data.products[0].Image2 },
        { img: data.products[0].Image3 },
        { img: data.products[0].Image4 },
      ].filter((image) => image.img !== null && image.img !== undefined);
      console.log("images", images);
      setImages(images);
      setId(pid);
    };
    const getLoginUser = async () => {
      console.log("-----------------------");
      const loginUserId = localStorage.getItem("logged_in_profile");
      if (loginUserId) {
        try {
          const response = await fetch(
            `/api/user/sweeping/user?id=${loginUserId}`
          );
          if (!response.ok) {
            console.error(
              "Failed to fetch advertiser data:",
              response.statusText
            );
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const { user: userData } = await response.json();
          if (!userData) {
            console.error("Advertiser not found");
          } else {
            setLoginUserEmail(userData.Email);
          }
        } catch (error: any) {
          console.error("Error fetching data:", error.message);
        }
      }
    };
    getIdFromParam();
    getLoginUser();
  }, [props]);

  const onSendEmail = async () => {
    console.log(content, loginUserEmail);

    const result = await fetch("/api/marketplace/sendemail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        owner: data.Email,
        loginuser: loginUserEmail,
        content: content,
        subject: `About ${data.Title} in Swing Social Marketplace`,
      }),
    });
    console.log(result);
  };

  // const handleSendMessage = async () => {
  // 	if (newMessage.trim()) {
  // 		sendMessage();
  // 		// Add the message to the local messages state
  // 		const newUserMessage = {
  // 			AvatarFrom: myProfile?.Avatar || "/noavatar.png", // User's avatar
  // 			AvatarTo: userProfile?.Avatar, // This can be set to the recipient's avatar if needed
  // 			ChatId: "temporary-chat-id", // Temporary ID or handle as needed
  // 			Conversation: newMessage, // The text of the message
  // 			ConversationId: "temporary-conversation-id", // Temporary ID for this message
  // 			CreatedAt: new Date().toISOString(), // Current timestamp
  // 			FromUsername: myProfile?.Username || "You", // Sender's username
  // 			MemberIdFrom: profileId, // Current user's ID
  // 			MemberIdTo: userProfile?.Id, // Recipient's ID (you can dynamically pass this)
  // 			ToUsername: userProfile?.Username || "Recipient", // Recipient's username
  // 			lastcommentinserted: 1, // You can adjust this if needed
  // 		};

  // 		// Update the messages state
  // 		setMessages([...messages, newUserMessage]);

  // 		if (userDeviceToken) {
  // 			sendNotification(newUserMessage?.Conversation);
  // 		}
  // 		// Prepare the API payload
  // 		const payload = {
  // 			chatid:
  // 				existingChatIndex === -1 ? 0 : chatList[existingChatIndex]?.ChatId, // Replace with actual chat ID if available
  // 			ProfileIdfrom: myProfile?.Id, // Replace with sender's profile ID
  // 			ProfileIDto: userProfile?.Id, // Replace with recipient's profile ID
  // 			Conversation: newMessage,
  // 		};

  // 		// Clear the input
  // 		setNewMessage("");

  // 		try {
  // 			// Send the message to the API
  // 			const response = await fetch("/api/user/messaging", {
  // 				method: "POST",
  // 				headers: {
  // 					"Content-Type": "application/json",
  // 				},
  // 				body: JSON.stringify(payload),
  // 			});

  // 			// Handle the API response
  // 			if (response.ok) {
  // 				const result = await response.json();

  // 				// // Optionally update the messages state with a server response
  // 				// setMessages((prevMessages:any) => [
  // 				//     ...prevMessages,
  // 				//     { sender: "user", text: "Message delivered!" }, // Replace with actual server response if needed
  // 				// ]);
  // 			} else {
  // 				const errorData = await response.json();
  // 				console.error("Error sending message:", errorData);
  // 			}
  // 		} catch (error) {
  // 			console.error("Network error while sending message:", error);

  // 			// Optionally add an error message to the UI
  // 			setMessages((prevMessages: any) => [
  // 				...prevMessages,
  // 				{
  // 					sender: "error",
  // 					text: "Failed to send message. Please try again.",
  // 				},
  // 			]);
  // 		}
  // 	}
  // };

  const onEmailContent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
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
          // Mobile Layout
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "600px",
              marginTop: "80px",
            }}
          >
            {/* Image Section */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginBottom: "10px",
              }}
            >
              {/* {images.length > 0 ? (
								<Slider {...sliderSettings}>
									{images.map((image: any, index: any) => (
										<Box key={index} sx={{ position: "relative" }}>
											<img
												src={image.img} // Use the `img` property of the object
												alt={`Product ${index + 1}`}
												style={{
													width: "100%",
													maxWidth: "500px",
													borderRadius: "8px",
													height: "200px",
													objectFit: "cover",
												}}
											/>
										</Box>
									))}
								</Slider>
							) : ( */}
              <img
                src={data.CoverImageUrl}
                alt={`Product`}
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  borderRadius: "8px",
                }}
              />
              {/* )} */}
            </div>

            <div style={{ marginTop: "10px", color: "white" }}>
              {/* Title Section */}
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
                {/* Price Section */}
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    padding: "0px 30px 0px 10px",
                  }}
                >
                  ${data.Price}
                </p>
                <h1
                  style={{
                    fontSize: "24px",
                    margin: 0,
                  }}
                >
                  {data.Title}
                </h1>
              </div>

              <div
                style={{
                  border: "1px solid #666",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                Category: {data.Category}
              </div>

              <div
                style={{
                  border: "1px solid #666",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                }}
              >
                Description: {data.Description}
                {data.ExternalURL ? (
                  <div
                    style={{
                      paddingTop: "10px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      textAlign: "right",
                    }}
                  >
                    {/* <a
										href={data.ExternalURL}
										target="_blank"
										rel="noopener noreferrer"
									>
										{data.ExternalURL}
									</a> */}
                    <Button
                      href={data.ExternalURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ backgroundColor: "#FF1B6B", color: "#444" }}
                    >
                      Order
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Send Message Section */}
            <div
              style={{
                border: "1px solid #666",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <p style={{ color: "white" }}>
                Send seller({data.Username}) a message
              </p>
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <Input
                  style={{ backgroundColor: "white", width: "70%" }}
                  onChange={onEmailContent}
                />
                <button
                  style={{
                    width: "20%",
                    padding: "12px",
                    fontSize: "16px",
                    backgroundColor: "#0070f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginLeft: "10px",
                    marginTop: "5px",
                    marginBottom: "5px",
                  }}
                  onClick={onSendEmail}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Desktop Layout
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              maxWidth: "1200px",
              width: "100%",
              margin: "0 auto",
              marginTop: "150px",
              marginBottom: "100px",
              gap: "20px",
            }}
          >
            {/* First Column - Image Slider */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "10px",
                flex: 4,
              }}
            >
              {/* {images.length > 0 ? (
								<Slider {...sliderSettings}>
									{images.map((image: any, index: any) => (
										<Box key={index} sx={{ position: "relative" }}>
											<img
												src={image.img} // Use the `img` property of the object
												alt={`Product ${index + 1}`}
												style={{
													width: "100%",
													maxWidth: "500px",
													borderRadius: "8px",
													height: "1000px",
													objectFit: "cover",
												}}
											/>
										</Box>
									))}
								</Slider>
							) : ( */}
              <img
                src={data.CoverImageUrl}
                alt={`Product`}
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  borderRadius: "8px",
                }}
              />
              {/* )} */}
            </div>

            {/* Second Column - Content */}
            <div
              style={{
                flex: 4,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "white",
                marginLeft: "100px",
              }}
            >
              {/* Title */}
              <h1
                style={{
                  fontSize: "32px",
                  marginBottom: "60px",
                  textAlign: "left",
                }}
              >
                {data.Title}
              </h1>

              {/* Price */}
              <p
                style={{
                  fontSize: "16px",
                  marginBottom: "10px",
                  textAlign: "left",
                }}
              >
                Price: ${data.Price}
              </p>

              {/* Location and Time */}
              <div
                style={{
                  fontSize: "16px",
                  marginBottom: "15px",
                  textAlign: "left",
                }}
              >
                Category: {data.Category}
              </div>
              <div>
                <p>Description : {data.Description}</p>
              </div>
              {data.ExternalURL ? (
                <div
                  style={{
                    marginTop: "20px",
                  }}
                >
                  <Button
                    href={data.ExternalURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ backgroundColor: "#FF1B6B", color: "#444" }}
                  >
                    Order
                  </Button>
                </div>
              ) : null}

              {/* Send Message Button */}
              <p style={{ color: "white", marginTop: "20px" }}>
                Send seller({data.Username}) a message
              </p>
              <div style={{ border: "1px solid #666" }}>
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Input
                    style={{ backgroundColor: "white", width: "60%" }}
                    onChange={onEmailContent}
                  />
                  <button
                    style={{
                      width: "15%",
                      padding: "12px",
                      fontSize: "16px",
                      backgroundColor: "#0070f3",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      marginLeft: "10px",
                      marginTop: "5px",
                      marginBottom: "5px",
                    }}
                    onClick={onSendEmail}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
