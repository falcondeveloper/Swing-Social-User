"use client";

import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function Home() {
    const [profileId, setProfileId] = useState<any>(); // Animation direction
    const [location, setLocation] = useState<{ name: string; latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
        }
       
    }, []);

    useEffect(() => {
       if(profileId){
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
    
              // Update the location state
              setLocation({
                name: locationName,
                latitude,
                longitude,
              });
    
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
        // Use a geocoding API to get the location name (e.g., Google Maps, OpenCage, etc.)
        // For this example, I'll assume you're using an external API for reverse geocoding.
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          return data.locality || 'Unknown Location';
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
            console.log('Location sent successfully:', data);
          } else {
            console.error('Error sending location:', data.message);
          }
        } catch (error) {
          console.error('Error sending location to API:', error);
        }
      };
    
    const router = useRouter();

    const handleNavigate=(category:any)=>{
        if(category?.isComingSoon){
            Swal.fire({
                title: 'Coming Soon',
                timer: 2000
              })
        }else{
            router.push(category?.url)
        }
    }
    
    return (
        <Box sx={{ color: "white", padding:"10px"}}>
          <Header/>
            {/* Full-Width Heading with Background Image */}
            <Box
                sx={{
                    width: "100%",
                    height: {lg:200,md:200,sm:90,xs:90},
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundImage: 'url("/images/home-hero-bg.png")',
                    backgroundSize: {lg:"cover",md:"cover",sm:"cover",xs:"cover"},
                    backgroundRepeat:{sm:"no-repeat",xs:"no-repeat"},
                    backgroundPosition: "center",
                    marginTop:{lg:"98px",md:"90px",sm:"90px",xs:"90px"}
                }}
            >
            </Box>

            {/* Category Card List */}
            <Box
                sx={{
                    padding: {
                        xs: 0, // Small padding for mobile screens
                        sm: 0, // Slightly larger padding for tablets
                        md: 0, // Medium padding for laptops
                        lg:0
                    },
                    marginTop:"10px",
                
                }}
            >
                <Grid container spacing={1} sx={{padding:"0px"}}>
                    {[
                        { title: "Events", img: "/images/event.png" ,url:"/events"},
                        { title: "Learning & Blogs", img: "/images/learning-blog.jpg" ,url:"https://swingsocial.co/blog/"},
                        { title: "What's Hot", img: "/images/whatshot.jpg" ,url:"/whatshot"},
                        { title: "Marketplace", img: "/images/marketplace.jpg",url:"/whatshot",isComingSoon:true },
                        { title: "Search", img: "/images/search.jpg",url:"/whatshot",isComingSoon:true },
                        { title: "Travel", img: "/images/travel.jpg" ,url:"https://swingsocial.co/travel/"},
                    ].map((category, index) => (
                        <Grid  item xs={6} sm={6} md={6} lg={6} key={index} style={{
                            cursor:"pointer"
                        }}
                        >
                            <Card
                            onClick={()=>handleNavigate(category)}
                                sx={{
                                    backgroundColor: "#0a0a0a",
                                    color: "white",
                                    position: "relative",
                                    overflow: "hidden",
                                    width: "100%",
                                    height:{sm:150,xs:150,lg:570,md:570},
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
