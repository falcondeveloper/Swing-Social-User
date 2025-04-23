import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Stack,
    Grid,
} from '@mui/material';

interface UserProfile {
    miles: number;
    Id: string;
    Username: string;
    Avatar: string;
    ProfileBanner: string;
    SwingStyleTags: string[];
    About: string;
    Location: string;
}

interface ProfileCardProps {
    profile: UserProfile | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
    const [profileImages, setProfileImages] = useState<string[]>([]);

    useEffect(() => {
        const fetchProfileImages = async () => {
            if (profile?.Id) {
                try {
                    const response = await fetch(`/api/user/sweeping/images/profile?id=${profile.Id}`);
                    const data = await response.json();
                    setProfileImages(data?.images || []);
                } catch (error) {
                    console.error('Error fetching profile images:', error);
                }
            }
        };

        fetchProfileImages();
    }, [profile?.Id]);

    if (!profile) return null;

    return (
        <Box
            flex={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{
                background: 'linear-gradient(135deg, #1e1e1e 0%, #2d1f3d 100%)',
                padding: '2rem',
                borderRadius: '16px',
                color: 'white',
                position: 'relative',
            }}
        >
            <Card
                sx={{
                    width: '100%',
                    background: '#2d1f3d',
                    borderRadius: '16px',
                    boxShadow: 5,
                }}
            >
                {/* Profile Banner */}
                {profile.ProfileBanner && (
                    <CardMedia
                        component="img"
                        image={profile.ProfileBanner}
                        alt={profile.Username}
                        sx={{
                            height: 200,
                            borderTopLeftRadius: '16px',
                            borderTopRightRadius: '16px',
                            objectFit: 'cover',
                        }}
                    />
                )}

                {/* Profile Avatar */}
                <Avatar
                    src={profile.Avatar}
                    alt={profile.Username}
                    sx={{
                        width: 100,
                        height: 100,
                        border: '3px solid white',
                        position: 'absolute',
                        top: profile.ProfileBanner ? 140 : 20, // Adjust position if banner is missing
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                />

                {/* Card Content */}
                <CardContent sx={{ textAlign: 'center', mt: profile.ProfileBanner ? 8 : 4 }}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                        {profile.Username}
                    </Typography>
                    <Typography variant="body2" color="primary">
                        {profile.Location}
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        mt={2}
                        sx={{ flexWrap: 'wrap' }}
                    >
                        {profile.SwingStyleTags.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                variant="outlined"
                                sx={{
                                    color: 'white',
                                    borderColor: '#9c27b0',
                                    background: 'rgba(156, 39, 176, 0.2)',
                                }}
                            />
                        ))}
                    </Stack>

                    {/* Images Section */}
                    <Box mt={3}>
                        <Typography variant="subtitle1" color="secondary" gutterBottom>
                            Photo Gallery
                        </Typography>
                        {profileImages.length > 0 ? (
                            <Grid container spacing={2}>
                                {profileImages.map((image: any, index: number) => (
                                    <Grid item xs={6} sm={4} md={3} key={index}>
                                        <CardMedia
                                            component="img"
                                            image={image?.Url}
                                            alt={`Profile Image ${index + 1}`}
                                            sx={{
                                                borderRadius: '8px',
                                                height: 266,
                                                objectFit: 'cover',
                                                boxShadow: 3,
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Typography variant="body2" color="white">
                                No Photos Provided
                            </Typography>
                        )}
                    </Box>

                    {/* Additional Profile Info */}
                    <Box
                        mt={2}
                        p={2}
                        bgcolor="rgba(255, 255, 255, 0.1)"
                        borderRadius="8px"
                        textAlign="left"
                    >
                        <Typography variant="body2" sx={{ color: 'white' }}>
                            <strong>About:</strong>{' '}
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: profile.About,
                                }}
                            />
                        </Typography>
                        {/* Other details can go here */}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ProfileCard;
