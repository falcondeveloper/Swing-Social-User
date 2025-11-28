"use client";

import UserBottomNavigation from "@/components/BottomNavigation";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
} from "@mui/material";
import { useEffect, useState } from "react";


export default function Community() {

        const [profileId, setProfileId] = useState<any>();
        useEffect(() => {
            if (typeof window !== 'undefined') {
                setProfileId(localStorage.getItem('logged_in_profile'));
            }
        }, []);
          useEffect(() => {
            if (profileId) {
              getCurrentLocation();
            }
          }, [profileId]);
        
          const getCurrentLocation = () => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const { latitude, longitude } = position.coords;
        
                  // Reverse geocoding to get the location name (you may need a third-party service here)
                  const locationName = await getLocationName(latitude, longitude);
        
                  // Send the location to your API
                  await sendLocationToAPI(locationName, latitude, longitude);
                },
                (error) => {
                  console.error('Geolocation error:', error);
                }
              );
            } else {
              console.error('Geolocation is not supported by this browser.');
            }
          };
        
          const getLocationName = async (latitude: number, longitude: number) => {
            const apiKey = 'AIzaSyDv-b2OlvhI1HmMyfHoSEwHkKpPkKlX4vc'; // Replace with your actual API key
          
            try {
              // Call the Google Maps Geocoding API
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
              );
          
              if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
              }
          
              const data = await response.json();
          
              // Extract the location name from the response
              if (data.status === 'OK' && data.results.length > 0) {
                return data.results[0].formatted_address; // Return the formatted address of the first result
              }
          
              console.error('No results found or status not OK:', data);
              return 'Unknown Location';
            } catch (error) {
              console.error('Error fetching location name:', error);
              return 'Unknown Location';
            }
          };
          
          const sendLocationToAPI = async (locationName: string, latitude: number, longitude: number) => {
            if (!profileId) {
              console.error('Profile ID is missing.');
              return;
            }
        
            try {
              const response = await fetch('/api/user/location', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  profileId,
                  locationName,
                  latitude,
                  longitude,
                }),
              });
        
              const data = await response.json();
              if (response.ok) {
              } else {
                console.error('Error sending location:', data.message);
              }
            } catch (error) {
              console.error('Error sending location to API:', error);
            }
          };
    return (
        <Box sx={{ color: "white" }}>
            {/* Full-Width Heading with Background Image */}
            <Box
                sx={{
                    width: "100%",
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundImage: 'url("/images/home-hero-bg.png")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    sx={{
                        color: "white",
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
                        fontWeight: "bold",
                    }}
                >
                    Swing Social Community
                </Typography>
            </Box>

            {/* Category Card List */}
            <Box
                sx={{
                    padding: {
                        xs: 2, // Small padding for mobile screens
                        sm: 3, // Slightly larger padding for tablets
                        md: 4, // Medium padding for laptops
                    },
                }}
            >
                <Grid container spacing={3}>
                    {[
                        { title: "Events", img: "/placeholder.jpg" },
                        { title: "Learning & Blogs", img: "/placeholder1.jpg" },
                        { title: "What's Hot", img: "/placeholder2.jpg" },
                        { title: "Marketplace", img: "/placeholder3.jpg" },
                        { title: "Search", img: "/placeholder4.jpg" },
                        { title: "Travel", img: "/placeholder5.jpg" },
                    ].map((category, index) => (
                        <Grid item xs={6} sm={6} md={6} lg={6} key={index}>
                            <Card
                                sx={{
                                    backgroundColor: "#222",
                                    color: "white",
                                    position: "relative",
                                    overflow: "hidden",
                                    width: "100%",
                                    aspectRatio: "1", // Square shape
                                }}
                            >
                                <CardContent
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "100%",
                                        position: "relative",
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        align="center"
                                        sx={{
                                            position: "absolute",
                                            zIndex: 2,
                                            color: "white",
                                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
                                        }}
                                    >
                                        {category.title}
                                    </Typography>
                                    <Box
                                        sx={{
                                            backgroundImage: `url(${category.img})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            filter: "brightness(0.6)",
                                            width: "100%",
                                            height: "100%",
                                            position: "absolute",
                                        }}
                                    ></Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
             {/* Bottom Navigation Bar */}
            <UserBottomNavigation/>
        </Box>
    );
}
