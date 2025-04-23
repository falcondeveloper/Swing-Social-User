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

export default function Home() {
        const router = useRouter();
    
    return (
        <Box sx={{ color: "white" ,padding:"10px"}}>
          <Header/>
            {/* Full-Width Heading with Background Image */}
            <Box
                sx={{
                    width: "100%",
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundImage: 'url("/images/home-hero-bg.png")',
                    backgroundSize: {lg:"cover",md:"cover",sm:"contain",xs:"contain"},
                    backgroundRepeat:{sm:"no-repeat",xs:"no-repeat"},
                    backgroundPosition: "center",
                    marginTop:"98px"
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
                        { title: "Events", img: "/images/event.png" ,url:"/whatshot"},
                        { title: "Learning & Blogs", img: "/images/learning-blog.jpg" ,url:"/whatshot"},
                        { title: "What's Hot", img: "/images/whatshot.jpg" ,url:"/whatshot"},
                        { title: "Marketplace", img: "/images/marketplace.jpg",url:"/whatshot" },
                        { title: "Search", img: "/images/search.jpg",url:"/whatshot" },
                        { title: "Travel", img: "/images/travel.jpg" ,url:"/whatshot"},
                    ].map((category, index) => (
                        <Grid  item xs={6} sm={6} md={6} lg={6} key={index} style={{
                            cursor:"pointer"
                        }}
                        >
                            <Card
                            onClick={()=>router.push("/whatshot")}
                                sx={{
                                    backgroundColor: "#0a0a0a",
                                    color: "white",
                                    position: "relative",
                                    overflow: "hidden",
                                    width: "100%",
                                    height:{sm:180,xs:180,lg:570,md:570},
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
