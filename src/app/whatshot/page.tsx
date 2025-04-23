"use client";

import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import SidebarList from "@/components/SidebarList";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    IconButton,
    Modal,
    FormControlLabel,
    Checkbox,
    Container,
    CardMedia,
    CardActions,
    Chip,
    Fade,
    Paper,
    useMediaQuery,
    useTheme,
    List,
    ListItem,
    Avatar,
    Stack,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from "@mui/material";

import {
    Favorite,
    FavoriteBorder,
    Comment,
    Flag,
    MoreVert,
    Verified,
    Add,
    Edit,
    Delete
} from '@mui/icons-material';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { ArrowLeft } from 'lucide-react';
import UserProfileModal from "@/components/UserProfileModal";
import Swal from "sweetalert2";

export default function Whatshot() {

    const router = useRouter();

    const [posts, setPosts] = useState<any>([]);
    const [likesCount, setLikesCount] = useState(posts?.LikesCount || 0);
    const [hasLiked, setHasLiked] = useState(false); // Track if the user has liked the post
    const [profileId, setProfileId] = useState<any>(""); // Animation direction
    const [targetId, setTargetId] = useState<any>(null); // Animation direction
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<any>("What's Hot");
    const [isLoading, setIsLoading] = useState(true);
    const [showDetail, setShowDetail] = useState<any>(false);
    const [selectedUserId, setSelectedUserId] = useState<any>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const theme = useTheme();
    const [reportOptions, setReportOptions] = useState({
        reportUser: false,
        blockUser: false,
    });

    //const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isMobile = useMediaQuery('(max-width: 480px)') ? true : false;

    const shimmerKeyframes = `
      @keyframes shimmer {
        0% {
          transform: translateX(-100%) skewX(-15deg);
        }
        100% {
          transform: translateX(100%) skewX(-15deg);
        }
      }
    `;

    const loadingBarKeyframes = `
      @keyframes loadingBar {
        0% {
          left: -30%;
          width: 30%;
        }
        50% {
          width: 40%;
        }
        100% {
          left: 100%;
          width: 30%;
        }
      }
    `;

    interface LoadingScreenProps {
        logoSrc?: string;
    }

    interface LoadingScreenProps {
        logoSrc?: string;
    }

    const handleClose = () => {
        setShowDetail(false);
        setSelectedUserId(null);
    }

    const handleGrantAccess = async () => {
        try {
            // const checkResponse = await fetch('/api/user/sweeping/grant', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ profileid: profileId, targetid: userProfiles[currentIndex]?.Id }),
            // });

            // const checkData = await checkResponse.json();
            const checkData = "121212"

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const LoadingScreen: React.FC<LoadingScreenProps> = ({ logoSrc = '/loading.png' }) => {
        return (
            <>
                <style>
                    {shimmerKeyframes}
                    {loadingBarKeyframes}
                </style>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        backgroundColor: '#121212',
                        position: 'relative',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 1,
                            gap: '12px',
                        }}
                    >
                        <Box
                            component="img"
                            src={logoSrc}
                            alt="Logo"
                            sx={{
                                width: '50px',
                                height: 'auto',
                            }}
                        />
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: '32px',
                                letterSpacing: '-0.02em', // Reduced letter spacing
                                fontWeight: 'bold',
                                color: '#C2185B',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',

                                },
                            }}
                        >
                            SWINGSOCIAL
                        </Typography>
                    </Box>

                    {/* Loading Bar */}
                    <Box
                        sx={{
                            position: 'relative',
                            width: '120px',
                            height: '2px',
                            backgroundColor: 'rgba(194,24,91,0.2)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                backgroundColor: '#C2185B',
                                borderRadius: '4px',
                                animation: 'loadingBar 1.5s infinite',
                            }}
                        />
                    </Box>

                    {/* Subtitle */}
                    <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontSize: '14px',
                                letterSpacing: '0.02em',
                                opacity: 0.9,
                                color: '#C2185B',
                                // color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                fontWeight: 'bold',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                },
                            }}
                        >
                            The best dating and events platform for Swingers
                        </Typography>
                    </Box>
                </Box>
            </>
        );
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
        }
    }, []);

    useEffect(() => {
        handleWhatshotPosts();
    }, []);

    const sidebarItems = [
        { label: "What's Hot", route: "/whatshot" },
        { label: "Events", route: "/events" },
        { label: "Travel", route: "/travel" },
        { label: "Learn", route: "/learn" },
        { label: "Coming soon...", route: "/coming-soon" },
        { label: "Playdates", route: "/playdates" },
        { label: "Marketplace", route: "/marketplace" },
        { label: "Groups", route: "/groups" },
    ];

    const handleNavigation = (route: string) => {
        console.log(route);
        router.push(route);
    };

    const handleWhatshotPosts = async () => {
        try {
            const userid = localStorage.getItem('logged_in_profile');
            const response = await fetch('/api/user/whatshot?id=' + userid);
            const data = await response.json();
            console.log(data?.posts);
            setPosts(data?.posts || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handlePostLike = async (postId: string) => {
        try {
            const response = await fetch('/api/user/whatshot/post/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId,
                    profileId: localStorage.getItem('logged_in_profile'),
                }),
            });
            if (response.ok) {
                handleWhatshotPosts(); // Refresh posts after like
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleReportModalToggle = (pid: string) => {
        setTargetId(pid);
        setIsReportModalOpen(!isReportModalOpen);
    };

    const handleReportSubmit = async () => {
        try {
            await fetch('/api/user/sweeping/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileid: localStorage.getItem('logged_in_profile'),
                    targetid: targetId
                }),
            });
            setIsReportModalOpen(false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (posts.length === 0) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
                bgcolor="#121212"
            >
                <LoadingScreen logoSrc="/loading.png"></LoadingScreen>
            </Box>
        )
    }

    const handleDeletePost = async (postId: string) => {
        console.log("postId", postId)
        try {
            await fetch('/api/user/whatshot/post/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId }),
            })
            Swal.fire({
                title: 'Success!',
                text: 'Post updated successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            })
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update post',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
        // Add your delete logic here
        // Example:
        // await deletePost(postId);
        // refreshPosts();
    };

    return (
        <Box sx={{ bgcolor: '#121212', minHeight: '100vh' }}>
            <Header />

            {isMobile === false ? (
                <Container maxWidth="xl" sx={{ mt: 12, mb: 8 }}>
                    <Grid container spacing={3}>
                        {/* Main Content */}
                        <Grid item xs={12} md={12}>
                            {/* <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> */}
                            <Button
                                onClick={() => router.back()}
                                startIcon={<ArrowLeft />}
                                sx={{
                                    textTransform: "none",
                                    color: "rgba(255, 255, 255, 0.7)",
                                    textAlign: "center",
                                    minWidth: 'auto',
                                    fontSize: "16px",
                                    fontWeight: "medium",
                                    "&:hover": {
                                        color: "#fff",
                                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                                    },
                                }}
                            >
                                Back
                            </Button>
                            <UserProfileModal handleGrantAccess={handleGrantAccess} handleClose={handleClose} open={showDetail} userid={selectedUserId} />
                            <Paper
                                elevation={3}
                                sx={{
                                    bgcolor: "#1E1E1E",
                                    borderRadius: 2,
                                    p: 3,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 3
                                    }}
                                >
                                    <Box sx={{ color: "white" }}>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 800,
                                                letterSpacing: '0.05em',
                                                textTransform: 'uppercase',
                                                background: 'linear-gradient(45deg, #fff 30%, #f50057 90%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                position: 'relative',
                                                animation: 'glow 2s ease-in-out infinite',
                                                '@keyframes glow': {
                                                    '0%': {
                                                        textShadow: '0 0 10px rgba(245, 0, 87, 0.5)',
                                                    },
                                                    '50%': {
                                                        textShadow: '0 0 20px rgba(245, 0, 87, 0.8), 0 0 30px rgba(245, 0, 87, 0.4)',
                                                    },
                                                    '100%': {
                                                        textShadow: '0 0 10px rgba(245, 0, 87, 0.5)',
                                                    },
                                                },
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    bottom: -8,
                                                    left: 0,
                                                    width: '50px',
                                                    height: '3px',
                                                    background: '#f50057',
                                                    transition: 'width 0.3s ease',
                                                },
                                                '&:hover::after': {
                                                    width: '100px',
                                                }
                                            }}
                                        >
                                            What's Hot
                                        </Typography>
                                    </Box>
                                    <Button
                                        onClick={() => router.push("/whatshot/post/create")}
                                        startIcon={<Add />}
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#f50057',
                                            '&:hover': { bgcolor: '#c51162' },
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            px: 3,
                                        }}
                                    >
                                        Create Post
                                    </Button>
                                </Box>
                                {/* </Box> */}

                                <Grid container spacing={3}>
                                    {posts.map((post: any, index: number) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Fade in={true} timeout={500 + index * 100}>
                                                <Card
                                                    sx={{
                                                        bgcolor: "rgba(45, 45, 45, 0.8)",
                                                        backdropFilter: "blur(10px)",
                                                        borderRadius: 3,
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        overflow: "hidden",
                                                        transition: "all 0.3s ease",
                                                        position: "relative",
                                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                                        cursor: "pointer",
                                                        "&:hover": {
                                                            transform: "translateY(-4px)",
                                                            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)",
                                                            "& .media-overlay": {
                                                                opacity: 1
                                                            }
                                                        },
                                                    }}
                                                >
                                                    {/* Ribbon */}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 20,
                                                            right: -40,
                                                            transform: 'rotate(45deg)',
                                                            backgroundColor: '#f50057',
                                                            padding: '6px 30px',
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                                                            zIndex: 1,
                                                            '&::before, &::after': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                top: 0,
                                                                width: '7px',
                                                                height: '7px',
                                                            },
                                                            '&::before': {
                                                                left: 0,
                                                                borderLeft: '3px solid #b3003b',
                                                                borderBottom: '3px solid #b3003b',
                                                            },
                                                            '&::after': {
                                                                right: 0,
                                                                borderRight: '3px solid #b3003b',
                                                                borderBottom: '3px solid #b3003b',
                                                            }
                                                        }}
                                                    >
                                                        What's Hot!
                                                    </Box>

                                                    {/* User Info Header */}
                                                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} 
                                                    // onClick={() => router.push(`/members/${post?.ProfileId}`)}
                                                    onClick={() => {
                                                        setShowDetail(true);
                                                        setSelectedUserId(post?.ProfileId);
                                                    }}
                                                    >
                                                        <Stack direction="row" spacing={2} alignItems="center" >
                                                            <Avatar
                                                                src={post?.Avatar}
                                                                
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    border: '2px solid #f50057'
                                                                }}
                                                            />
                                                            <Box>
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                                                                        by {post?.Username}
                                                                    </Typography>
                                                                    <Verified sx={{ color: '#f50057', fontSize: 16 }} />
                                                                </Stack>
                                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                                                    on {new Date(post?.CreatedAt).toLocaleDateString()}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </Box>

                                                    {/* Main Image */}
                                                    <Box sx={{ position: 'relative', cursor: 'pointer', }} 
                                                    onClick={() => router.push(`/whatshot/post/detail/${post?.Id}`)}
                                                    // onClick={() => {
                                                    //     setShowDetail(true);
                                                    //     setSelectedUserId(post?.ProfileId);
                                                    // }}
                                                    >
                                                        <CardMedia
                                                            component="img"
                                                            height="280"
                                                            image={post?.PhotoLink}
                                                            alt="Post"
                                                            sx={{
                                                                cursor: 'pointer',
                                                                objectFit: 'cover',
                                                            }}
                                                        // onClick={() => router.push(`/whatshot/post/detail/${post?.Id}`)}
                                                        />
                                                        <Box
                                                            className="media-overlay"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
                                                                opacity: 0,
                                                                transition: 'opacity 0.3s ease'
                                                            }}
                                                        />
                                                    </Box>

                                                    {/* Content */}
                                                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                                        <Chip
                                                            label={post?.ImageCaption || "No Caption"}
                                                            sx={{
                                                                bgcolor: 'rgba(245, 0, 87, 0.1)',
                                                                color: '#f50057',
                                                                width: '100%',
                                                                mb: 2,
                                                                fontWeight: 'bold',
                                                                '& .MuiChip-label': {
                                                                    px: 1
                                                                }
                                                            }}
                                                        />
                                                        
                                                    </CardContent>

                                                    {/* Actions */}
                                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                                        <Grid container spacing={1} alignItems="center">
                                                            <Grid item xs={6}>
                                                                <Button
                                                                    fullWidth
                                                                    onClick={() => handlePostLike(post?.Id)}
                                                                    startIcon={post?.hasLiked ? <Favorite /> : <FavoriteBorder />}
                                                                    sx={{
                                                                        color: post?.hasLiked ? '#f50057' : 'white',
                                                                        borderColor: post?.hasLiked ? '#f50057' : 'rgba(255,255,255,0.3)',
                                                                        '&:hover': {
                                                                            borderColor: '#f50057',
                                                                            bgcolor: 'rgba(245, 0, 87, 0.08)',
                                                                        },
                                                                        textTransform: 'none'
                                                                    }}
                                                                    variant="outlined"
                                                                >
                                                                    {post?.LikesCount || 0} Likes
                                                                </Button>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Button
                                                                    fullWidth
                                                                    onClick={() => router.push(`/whatshot/post/detail/${post?.Id}`)}
                                                                    startIcon={<Comment />}
                                                                    sx={{
                                                                        color: 'white',
                                                                        borderColor: 'rgba(255,255,255,0.3)',
                                                                        '&:hover': {
                                                                            borderColor: 'white',
                                                                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                                                                        },
                                                                        textTransform: 'none'
                                                                    }}
                                                                    variant="outlined"
                                                                >
                                                                    {post?.CommentsCount || 0} Comments
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleReportModalToggle(post?.UserId)}
                                                            sx={{
                                                                color: '#f50057',
                                                                ml: 1,
                                                                '&:hover': {
                                                                    bgcolor: 'rgba(245, 0, 87, 0.08)',
                                                                }
                                                            }}
                                                        >
                                                            <Flag fontSize="small" />
                                                        </IconButton>
                                                        {[post.ProfileId, 
                                                            "347313ee-89c1-4f81-a089-4cbc2e2358ca",
                                                            "4454da1b-010d-4daf-a580-e5a30f61dd08",
                                                            "b4fc8e46-0e0a-48b3-824a-0142c44739c1"
                                                        ].includes(profileId) ? <>
                                                            <IconButton 
                                                            size="small" 
                                                            sx={{ color: "white" }}
                                                            onClick={(event) => setAnchorEl(event.currentTarget)}
                                                            >
                                                            <MoreVert />
                                                            </IconButton>
                                                            <Menu
                                                            anchorEl={anchorEl}
                                                            open={Boolean(anchorEl)}
                                                            onClose={() => setAnchorEl(null)}
                                                            PaperProps={{
                                                                sx: {
                                                                bgcolor: '#1A1A1A',
                                                                color: 'white',
                                                                }
                                                            }}
                                                            >
                                                            <MenuItem 
                                                                onClick={() => {
                                                                setAnchorEl(null);
                                                                router.push(`/whatshot/post/detail/${post?.Id}`);
                                                                }}
                                                                sx={{ '&:hover': { bgcolor: 'rgba(245, 0, 87, 0.1)' } }}
                                                            >
                                                                <ListItemIcon>
                                                                <Edit sx={{ color: '#f50057' }} />
                                                                </ListItemIcon>
                                                                <ListItemText>Edit with Comments</ListItemText>
                                                            </MenuItem>
                                                            <MenuItem 
                                                                onClick={() => {
                                                                setAnchorEl(null);
                                                                // Add your delete handler here
                                                                handleDeletePost(post?.Id);
                                                                }}
                                                                sx={{ '&:hover': { bgcolor: 'rgba(245, 0, 87, 0.1)' } }}
                                                            >
                                                                <ListItemIcon>
                                                                <Delete sx={{ color: '#f50057' }} />
                                                                </ListItemIcon>
                                                                <ListItemText>Delete</ListItemText>
                                                            </MenuItem>
                                                            </Menu>
                                                        </> : null}
                                                    </CardActions>
                                                </Card>
                                            </Fade>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            ) : (
                <Grid container sx={{ marginTop: 10 }}>
                    <UserProfileModal handleGrantAccess={handleGrantAccess} handleClose={handleClose} open={showDetail} userid={selectedUserId} />
  {/* Right Column (col-10) */}
  <Grid
    item
    xs={12}
    sm={12}
    lg={12}
    md={12}
    sx={{
      px: { xs: 0, sm: 0 }, // Remove horizontal padding for xs and sm breakpoints
    }}
  >
    <Card
      sx={{
        borderRadius: "10px",
        backgroundColor: "#0a0a0a",
        padding: "0px",
        mx: { xs: 0, sm: 0 }, // Remove horizontal margin for xs and sm breakpoints
      }}
    >
      <CardContent>
        <Typography variant="h5" color="white" textAlign={"center"}>
          What's Hot
        </Typography>
        {/* Create New Post Button */}
        <Button
          onClick={() => router.push("/whatshot/post/create")}
          startIcon={<Add />}
          variant="contained"
          color="primary"
          sx={{
            mt: 1,
            textTransform: "none",
            backgroundColor: "#f50057",
            fontSize: "16px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#c51162",
            },
          }}
        >
          Create New Post
        </Button>
        <Box
          sx={{
            maxHeight: "700px", // Set max height for scroll
            overflowY: "auto", // Enable vertical scroll
            marginTop: "10px",
          }}
        >
          {/* Post Card */}
          {posts.map((post: any, index: number) => {
            return (
              <Card
                key={index}
                sx={{
                  borderRadius: "10px",
                  marginBottom: "20px",
                  marginTop: "20px",
                  backgroundColor: "#2d2d2d",
                  mx: { xs: 0, sm: 0 }, // Remove horizontal margin for xs and sm breakpoints
                }}
              >
                {/* Added Box for user information */}
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                //   onClick={() => router.push(`/members/${post?.ProfileId}`)}
                
                >
                  <Stack direction="row" spacing={2} alignItems="center" onClick={() => {
                    setShowDetail(true);
                    setSelectedUserId(post?.ProfileId);
                    }}>
                    <Avatar
                      src={post?.Avatar}
                      sx={{
                        width: 40,
                        height: 40,
                        border: "2px solid #f50057",
                      }}
                    />
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "white", fontWeight: "bold" }}
                        >
                          by {post?.Username}
                        </Typography>
                        <Verified sx={{ color: "#f50057", fontSize: 16 }} />
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        on {new Date(post?.CreatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>
                  {[post.ProfileId, 
                    "347313ee-89c1-4f81-a089-4cbc2e2358ca",
                    "4454da1b-010d-4daf-a580-e5a30f61dd08",
                    "b4fc8e46-0e0a-48b3-824a-0142c44739c1"
                  ].includes(profileId) ? <>
                    <IconButton 
                      size="small" 
                      sx={{ color: "white" }}
                      onClick={(event) => setAnchorEl(event.currentTarget)}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => setAnchorEl(null)}
                      PaperProps={{
                        sx: {
                          bgcolor: '#1A1A1A',
                          color: 'white',
                        }
                      }}
                    >
                      <MenuItem 
                        onClick={() => {
                          setAnchorEl(null);
                          router.push(`/whatshot/post/detail/${post?.Id}`);
                        }}
                        sx={{ '&:hover': { bgcolor: 'rgba(245, 0, 87, 0.1)' } }}
                      >
                        <ListItemIcon>
                          <Edit sx={{ color: '#f50057' }} />
                        </ListItemIcon>
                        <ListItemText>Edit with Comments</ListItemText>
                      </MenuItem>
                      <MenuItem 
                        onClick={() => {
                          setAnchorEl(null);
                          // Add your delete handler here
                          handleDeletePost(post?.Id);
                        }}
                        sx={{ '&:hover': { bgcolor: 'rgba(245, 0, 87, 0.1)' } }}
                      >
                        <ListItemIcon>
                          <Delete sx={{ color: '#f50057' }} />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                      </MenuItem>
                    </Menu>
                  </> : null}
                               
                </Box>
                {/* Image Section */}
                <Box
                  sx={{
                    padding: "10px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    onClick={() =>
                      router.push("/whatshot/post/detail/" + post?.Id)
                    }
                    // onClick={() => {
                    //     setShowDetail(true);
                    //     setSelectedUserId(post?.ProfileId);
                    // }}
                    src={post?.PhotoLink}
                    alt="Post Image"
                    style={{
                      width: "100%",
                      height: "200px",
                      borderRadius: "10px",
                      objectFit: "cover",
                    }}
                  />
                </Box>
                <CardContent
                  sx={{
                    padding: 0,
                    paddingBottom: { xs: 0, sm: 0, md: 0 },
                    "&:last-child": {
                      paddingBottom: 0,
                    },
                  }}
                >
                  {post?.ImageCaption ? (
                    <Typography
                      variant="body1"
                      sx={{
                        marginBottom: "10px",
                        color: "#fff",
                        backgroundColor: "#f50057",
                        textAlign: "center",
                      }}
                    >
                      {post?.ImageCaption}
                    </Typography>
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        marginBottom: "10px",
                        color: "#fff",
                        backgroundColor: "#f50057",
                        textAlign: "center",
                      }}
                    >
                      No Caption
                    </Typography>
                  )}

                  <Grid container justifyContent="space-between">
                    <Grid item lg={5} md={5} sm={5} xs={5}>
                      <Button
                        onClick={() => handlePostLike(post?.Id)}
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{
                          textTransform: "none",
                          backgroundColor: "#f50057",
                          py: 1.5,
                          fontSize: "16px",
                          fontWeight: "bold",
                        }}
                      >
                        Like {post?.LikesCount}
                      </Button>
                    </Grid>
                    <Grid item lg={5} md={5} sm={5} xs={5}>
                      <Button
                        onClick={() =>
                          router.push("/whatshot/post/detail/" + post?.Id)
                        }
                        fullWidth
                        sx={{
                          color: "#fff",
                          backgroundColor: "transparent",
                          textTransform: "none",
                          py: 1.5,
                          fontSize: { lg: "16px", md: "16px", sm: 12, xs: 12 },
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          },
                        }}
                      >
                        Comment {post?.CommentsCount}
                      </Button>
                    </Grid>
                    <Grid
                      item
                      lg={2}
                      md={2}
                      sm={2}
                      xs={2}
                      sx={{ textAlign: "right" }}
                    >
                      <IconButton
                        sx={{ color: "#f50057" }}
                        onClick={() => handleReportModalToggle(post?.UserId)}
                      >
                        <Flag />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  </Grid>
</Grid>
            )}

            {/* Report Modal */}
            <Modal
                open={isReportModalOpen}
                onClose={() => handleReportModalToggle("null")}
                closeAfterTransition
            >
                <Fade in={isReportModalOpen}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 300,
                        bgcolor: '#1E1E1E',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}>
                        <Typography variant="h6" color="white" gutterBottom>
                            Report or Block User
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={reportOptions.reportUser}
                                    onChange={(e) => setReportOptions(prev => ({
                                        ...prev,
                                        reportUser: e.target.checked
                                    }))}
                                    sx={{
                                        color: '#f50057',
                                        '&.Mui-checked': { color: '#f50057' }
                                    }}
                                />
                            }
                            label="Report User"
                            sx={{ color: 'white', display: 'block', mb: 1 }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={reportOptions.blockUser}
                                    onChange={(e) => setReportOptions(prev => ({
                                        ...prev,
                                        blockUser: e.target.checked
                                    }))}
                                    sx={{
                                        color: '#f50057',
                                        '&.Mui-checked': { color: '#f50057' }
                                    }}
                                />
                            }
                            label="Block User"
                            sx={{ color: 'white', display: 'block', mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                onClick={() => handleReportModalToggle("null")}
                                sx={{ bgcolor: '#333', '&:hover': { bgcolor: '#444' } }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleReportSubmit}
                                sx={{ bgcolor: '#f50057', '&:hover': { bgcolor: '#c51162' } }}
                            >
                                Submit
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            <Footer />
        </Box>
    );
}
