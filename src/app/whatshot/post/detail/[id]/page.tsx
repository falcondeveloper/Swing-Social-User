"use client";

import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import {
    Box,
    Typography,
    Grid,
    useTheme,
    useMediaQuery,
    Button,
    IconButton,
    TextField,
    Avatar,
    Container,
    Paper,
    Divider,
    Fade,
    Chip,
} from "@mui/material";
import {
    Favorite,
    FavoriteBorder,
    Flag,
    Reply,
    Delete,
    Send,
    Edit
} from "@mui/icons-material";
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { Save, X } from 'lucide-react';
import Swal from "sweetalert2";

type Params = Promise<{ id: string }>;

export default function PostDetail(props: { params: Params }) {
    const [id, setId] = useState('');
    const [postDetail, setPostDetail] = useState<any>({});
    const [comments, setComments] = useState<any>([]);
    const [comment, setComment] = useState('');
    const [commentReply, setCommentReply] = useState('');
    const [parentCommentId, setParentCommentId] = useState(null);
    const [profileId, setProfileId] = useState('');
    const [profileUsername, setProfileUsername] = useState('');
    const [hasLiked, setHasLiked] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedContent, setEditedContent] = useState('');

    const router = useRouter();

    const theme = useTheme();
    //const isMobile = useMediaQuery('(max-width: 480px)') ? true : false;
    const isMobile = useMediaQuery('(max-width: 480px)') ? true : false;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile') || '');
            setProfileUsername(localStorage.getItem('profileUsername') || '');
        }
    }, []);

    useEffect(() => {
        const getIdFromParam = async () => {
            const params = await props.params;
            setId(params.id);
        };
        getIdFromParam();
    }, [props]);

    useEffect(() => {
        if (id) {
            handleWhatshotPosts(id);
            handleGetPostComments();
        }
    }, [id, parentCommentId, hasLiked]);

    const handleWhatshotPosts = async (userid: string) => {
        try {
            const response = await fetch('/api/user/whatshot/post?id=' + userid + "&postId=" + id);
            const data = await response.json();
            console.log(data);
            setPostDetail(data?.posts?.[0]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleGetPostComments = async () => {
        try {
            const response = await fetch('/api/user/whatshot/post/comment?&postId=' + id);
            const data = await response.json();
            console.log("comment", data);
            setComments(data?.comments || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCommentSubmit = async () => {
        if (!comment.trim()) return;

        try {
            const response = await fetch('/api/user/whatshot/post/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: id,
                    comment,
                    profileId,
                }),
            });

            if (response.ok) {
                handleGetPostComments();
                setComment('');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handlePostLike = async () => {
        try {
            setHasLiked(!hasLiked);

            await fetch('/api/user/whatshot/post/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: id,
                    profileId,
                }),
            });

            handleWhatshotPosts(id);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCommentReply = (commentId: any) => {
        setParentCommentId(commentId);
    };

    const handleCommentReplySubmit = async () => {
        if (!commentReply.trim()) return;

        try {
            const response = await fetch('/api/user/whatshot/post/comment/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: id,
                    parentId: parentCommentId,
                    comment: commentReply,
                    profileId,
                }),
            });

            if (response.ok) {
                setParentCommentId(null);
                setCommentReply('');
                handleGetPostComments();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handlePostDelete = async () => {
        try {
            const response = await fetch('/api/user/whatshot/post', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: id }),
            });

            if (response.ok) {
                // Handle successful deletion (e.g., redirect)
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEditClick = (commentId: any, currentContent: any) => {
        setEditingCommentId(commentId);
        setEditedContent(currentContent);
    };

    const handleCommentUpdate = async (commentId: any, editedContent: any) => {
        console.log(commentId, editedContent);

        try {
            const response = await fetch('/api/user/whatshot/post/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId: commentId, content: editedContent }),
            });

            if (response.ok) {
                // Handle successful deletion (e.g., redirect)
                console.log("333333");
                handleGetPostComments();
            }
        } catch (error) {
            console.error('Error:', error);
        }

    }
    const handleSaveEdit = (commentId: any) => {
        handleCommentUpdate(commentId, editedContent);
        setEditingCommentId(null);
        setEditedContent('');
    };

    const handleDeleteComment = async (commendId: any, postId: any) => {
        console.log(editedContent);

        try {
            const response = await fetch('/api/user/whatshot/post/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: commendId }),
            });

            if (response.ok) {
                // Handle successful deletion (e.g., redirect)
                window.location.reload();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditedContent('');
    };

    return (
        <Box sx={{ bgcolor: '#121212', minHeight: '100vh' }}>
            <Header />

            <Container maxWidth="lg" sx={{ mt: 12, mb: 8 }} >
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
                <Paper
                    elevation={3}
                    sx={{
                        bgcolor: '#1E1E1E',
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer'
                    }}
                >
                    {/* Post Image */}
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            height: { xs: '300px', sm: '400px', md: '500px' },
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: '#000', // Add black background to prevent empty spaces
                        }}
                    >
                        <Box
                            component="img"
                            src={postDetail?.PhotoLink}
                            alt="Post"
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain', // Changed from 'cover' to 'contain'
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                        />
                    </Box>

                    {/* Post Actions */}
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs>
                                <Button
                                    onClick={handlePostLike}
                                    startIcon={hasLiked ? <Favorite /> : <FavoriteBorder />}
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#f50057',
                                        '&:hover': { bgcolor: '#c51162' },
                                        borderRadius: 2,
                                    }}
                                >
                                    Like {postDetail?.LikesCount || 0}
                                </Button>
                            </Grid>
                            {profileUsername === postDetail?.Username && (
                                <Grid item>
                                    <Button
                                        onClick={handlePostDelete}
                                        startIcon={<Delete />}
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#f50057',
                                            '&:hover': { bgcolor: '#c51162' },
                                            borderRadius: 2,
                                        }}
                                    >
                                        Delete Post
                                    </Button>
                                </Grid>
                            )}
                        </Grid>

                        {postDetail?.ImageCaption && (
                            <Chip
                                label={postDetail.ImageCaption}
                                sx={{
                                    mt: 2,
                                    bgcolor: '#f50057',
                                    color: 'white',
                                    fontSize: '1rem',
                                    borderRadius: 2,
                                }}
                            />
                        )}
                    </Box>

                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

                    {/* Comments Section */}
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" color="white" gutterBottom>
                            Comments ({comments?.length || 0})
                        </Typography>

                        {/* Comment Input */}
                        <Paper
                            sx={{
                                p: 2,
                                mb: 3,
                                bgcolor: '#2D2D2D',
                                borderRadius: 2,
                            }}
                        >
                            <TextField
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Write a comment..."
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        bgcolor: '#1E1E1E',
                                        '& fieldset': {
                                            borderColor: 'rgba(255,255,255,0.2)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: '#f50057',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#f50057',
                                        },
                                    },
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    onClick={handleCommentSubmit}
                                    startIcon={<Send />}
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#f50057',
                                        '&:hover': { bgcolor: '#c51162' },
                                        borderRadius: 2,
                                    }}
                                >
                                    Comment
                                </Button>
                            </Box>
                        </Paper>

                        {/* Comments List */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {comments.map((comment: any, index: number) => (
                                <Fade in={true} timeout={500 + index * 100} key={comment.CommentId}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            bgcolor: '#2D2D2D',
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Avatar
                                                src={comment.Avatar}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    border: '2px solid #f50057',
                                                }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    color="white"
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    {comment.Username}
                                                </Typography>

                                                {editingCommentId === comment.CommentId ? (
                                                    <Box sx={{ mt: 2, mr: 2 }}>
                                                        <TextField
                                                            fullWidth
                                                            multiline
                                                            rows={3}
                                                            value={editedContent}
                                                            onChange={(e) => setEditedContent(e.target.value)}
                                                            sx={{
                                                                mr: 1,
                                                                bgcolor: '#3D3D3D',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    color: 'white',
                                                                    '& fieldset': {
                                                                        borderColor: 'rgba(255,255,255,0.23)',
                                                                    },
                                                                    '&:hover fieldset': {
                                                                        borderColor: '#f50057',
                                                                    },
                                                                    '&.Mui-focused fieldset': {
                                                                        borderColor: '#f50057',
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                            <Button
                                                                size="small"
                                                                startIcon={<Save />}
                                                                onClick={() => handleSaveEdit(comment.CommentId)}
                                                                sx={{
                                                                    color: '#f50057',
                                                                    '&:hover': { bgcolor: 'rgba(61, 52, 55, 0.08)' },
                                                                }}
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                startIcon={<X />}
                                                                onClick={handleCancelEdit}
                                                                sx={{
                                                                    color: '#f50057',
                                                                    '&:hover': { bgcolor: 'rgba(245,0,87,0.08)' },
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                ) : (
                                                    <Typography
                                                        variant="body1"
                                                        color="rgba(255,255,255,0.7)"
                                                        sx={{ mt: 1 }}
                                                    >
                                                        {comment.Comment}
                                                    </Typography>
                                                )}

                                                <Box sx={{ display: 'flex', gap: `${isMobile === true ? "2px" : "8px"}`, mt: `${isMobile === true ? "10px" : "2"}`, ml: `${isMobile === true ? "-60px" : "20"}`, mb: 1 }}>
                                                    <Button
                                                        size="small"
                                                        startIcon={<Reply />}
                                                        onClick={() => handleCommentReply(comment.CommentId)}
                                                        sx={{
                                                            color: '#f50057',
                                                            '&:hover': { bgcolor: 'rgba(245,0,87,0.08)' },
                                                        }}
                                                    >
                                                        Reply
                                                    </Button>
                                                    {profileUsername === comment.Username && (
                                                        <>
                                                            <Button
                                                                size="small"
                                                                startIcon={<Edit />}
                                                                onClick={() => handleEditClick(comment.CommentId, comment.Comment)}
                                                                sx={{
                                                                    color: '#f50057',
                                                                    '&:hover': { bgcolor: 'rgba(245,0,87,0.08)' },
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                startIcon={<Delete />}
                                                                onClick={() => handleDeleteComment(comment.CommentId, id)}
                                                                sx={{
                                                                    color: '#f50057',
                                                                    '&:hover': { bgcolor: 'rgba(245,0,87,0.08)' },
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </>
                                                    )}
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: '#f50057' }}
                                                    >
                                                        <Flag />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Fade>
                            ))}
                        </Box>

                        {/* Reply Input */}
                        {parentCommentId && (
                            <Fade in={true}>
                                <Paper
                                    sx={{
                                        p: isMobile ? 1 : 2, // Adjust padding for mobile
                                        mt: 2,
                                        bgcolor: '#2D2D2D',
                                        borderRadius: 2,
                                    }}
                                >
                                    <TextField
                                        value={commentReply}
                                        onChange={(e) => setCommentReply(e.target.value)}
                                        fullWidth
                                        placeholder="Write a reply..."
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                color: 'white',
                                                bgcolor: '#1E1E1E',
                                                fontSize: isMobile ? '0.875rem' : '1rem', // Adjust font size
                                                '& fieldset': {
                                                    borderColor: 'rgba(255,255,255,0.2)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#f50057',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#f50057',
                                                },
                                            },
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: isMobile ? 0.5 : 1, // Reduce gap between buttons on mobile
                                            mt: isMobile ? 1 : 2, // Adjust margin-top for mobile
                                            justifyContent: 'flex-end',
                                            flexDirection: isMobile ? 'column' : 'row', // Stack buttons vertically on mobile
                                        }}
                                    >
                                        <Button
                                            size="small"
                                            onClick={() => setParentCommentId(null)}
                                            sx={{
                                                color: 'rgba(255,255,255,0.7)',
                                                textAlign: 'center',
                                                width: isMobile ? '100%' : 'auto', // Full-width button on mobile
                                                mb: isMobile ? 1 : 0, // Add margin between buttons on mobile
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={handleCommentReplySubmit}
                                            sx={{
                                                bgcolor: '#f50057',
                                                '&:hover': { bgcolor: '#c51162' },
                                                width: isMobile ? '100%' : 'auto', // Full-width button on mobile
                                            }}
                                        >
                                            Reply
                                        </Button>
                                    </Box>
                                </Paper>
                            </Fade>
                        )}
                    </Box>
                </Paper>
            </Container>
            <Footer />
        </Box >
    );
}