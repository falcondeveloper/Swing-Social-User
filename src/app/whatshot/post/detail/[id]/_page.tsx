"use client";

import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton,
    TextField,
    Avatar,
} from "@mui/material";
import { ThumbUp, Comment, Flag } from "@mui/icons-material"; // Import icons for like, comment, and flag
import { useEffect, useState } from "react";
type Params = Promise<{ id: string }>

export default function PostDetail(props: { params: Params }) {
    const [id, setId] = useState<string>(''); // State for error messages
    const [posts, setPosts] = useState<any>([]);
    const [comment, setComment] = useState<any>(null);
    const [commentReply, setCommentReply] = useState<any>(null);
    const [parentCommentId, setParentCommentId] = useState<any>(null);
    const [postDetail, setPostDetail] = useState<any>([]);
    const [comments, setComments] = useState<any>([]);
    // Initialize LikesCount state with the current value of postDetail.LikesCount
    const [likesCount, setLikesCount] = useState(postDetail?.LikesCount || 0);
    const [hasLiked, setHasLiked] = useState(false); // Track if the user has liked the post

    useEffect(() => {
        const getIdFromParam = async () => {
            const params = await props.params;
            const pid: any = params.id;
            console.log(pid);
            setId(pid)
            console.log(pid, "===========id");
            console.log(params);
        }
        getIdFromParam();
    }, [props]);

    useEffect(() => {
        if (id) {
            handleWhatshotPosts(id);
            handleGetPostComments();
        }
    }, [id, parentCommentId, hasLiked]);

    const handleWhatshotPosts = async (userid: any) => {
        try {
            // Check if t
            // he username exists
            const checkResponse = await fetch('/api/user/whatshot/post?id=' + userid + "&postId=" + id, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const posts = await checkResponse.json();
            console.log(posts?.posts?.[0].LikesCount, "===========posts");
            setPostDetail(posts?.posts?.[0])

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleGetPostComments = async () => {
        try {
            // Check if t
            // he username exists
            const checkResponse = await fetch('/api/user/whatshot/post/comment?&postId=' + id, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const commentData = await checkResponse.json();
            setComments(commentData?.comments)

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const [profileId, setProfileId] = useState<any>(); // Animation direction
    const [profileUsername, setProfileUsername] = useState<any>(); // Animation direction
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
            setProfileUsername(localStorage.getItem('profileUsername'))
        }
    }, []);
    const handleCommentSubmit = async () => {
        try {
            const response = await fetch('/api/user/whatshot/post/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: id,
                    comment: comment,
                    profileId: profileId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Comment submitted successfully:', data.message);
                handleGetPostComments();
                setComment(null);
                // Optionally update UI or clear form fields here
            } else {
                console.error('Failed to submit comment:', data.message);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };


    // Function to handle the Like button click (toggle functionality)
    const handleLikeClick = async () => {
        if (hasLiked) {
            // If already liked, decrement the like count
            setLikesCount(parseInt(likesCount) - 1);
        } else {
            // If not liked yet, increment the like count
            setLikesCount(parseInt(likesCount) + 1);
        }

        // Toggle the hasLiked state
        setHasLiked(!hasLiked);

        // Call the handlePostLike function to handle the like action
        handlePostLike();
    };

    const handlePostLike = async () => {
        try {
            const response = await fetch('/api/user/whatshot/post/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: id,
                    profileId: profileId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Comment submitted successfully:', data.message);
                // handleWhatshotPosts(id);
                // Optionally update UI or clear form fields here
            } else {
                console.error('Failed to submit comment:', data.message);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    }
    useEffect(() => {
        if (postDetail?.Id) {
            setLikesCount(postDetail?.LikesCount)
        }
    }, [postDetail]);

    const handleCommentReply = (commentId: any) => {
        setParentCommentId(commentId);
    }

    const handleCommentReplySubmit = async () => {
        try {
            const response = await fetch('/api/user/whatshot/post/comment/reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: id,
                    parentId: parentCommentId,
                    comment: commentReply,
                    profileId: profileId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Comment submitted successfully:', data.message);
                setParentCommentId(null);

                // Optionally update UI or clear form fields here
            } else {
                console.error('Failed to submit comment:', data.message);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };
    const handlePostDelete = async () => {
        try {
            const response = await fetch('/api/user/whatshot/post', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId: id
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Optionally update UI or clear form fields here
            } else {
                console.error('Failed to submit comment:', data.message);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    }

    console.log(postDetail, "===========", profileId);

    return (
        <Box sx={{ color: "white", padding: "10px" }}>
            <Header />

            <Grid container spacing={2} sx={{ marginTop: 10 }}>
                {/* Right Column (col-10) */}
                <Grid item xs={12} sm={12} lg={12}>
                    <Card sx={{ borderRadius: "10px", backgroundColor: "#1d1d1d", marginBottom: 5 }}>
                        <CardContent sx={{
                            backgroundColor: "#0a0a0a"
                        }}>
                            {/* Post Card */}
                            <Card
                                sx={{
                                    borderRadius: "10px",
                                    marginTop: "20px",
                                    backgroundColor: "#0a0a0a",
                                }}
                            >
                                <img
                                    src={postDetail?.PhotoLink} // Placeholder image for the post
                                    alt="Post Image"
                                    style={{
                                        width: "100%",
                                        borderTopLeftRadius: "10px",
                                        borderTopRightRadius: "10px",
                                    }}
                                />
                                <CardContent sx={{ padding: 0, paddingBottom: 0 }}>
                                    <Grid container sx={{ paddingBottom: 0 }}>
                                        <Grid item lg={6} md={6} sm={6} xs={6}>
                                            <Button
                                                onClick={handleLikeClick}
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
                                                Like {postDetail?.LikesCount}
                                            </Button>
                                        </Grid>
                                        {profileUsername === postDetail?.Username &&
                                            <Grid item lg={6} md={6} sm={6} xs={6}>
                                                <Button
                                                    onClick={handlePostDelete}
                                                    fullWidth
                                                    variant="contained"
                                                    color="primary"
                                                    sx={{
                                                        textTransform: "none",
                                                        backgroundColor: "#f50057",
                                                        py: 1.5,
                                                        marginLeft: 1,
                                                        fontSize: "16px",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </Grid>
                                        }
                                    </Grid>
                                </CardContent>
                            </Card>

                            {/* Comment Section */}
                            <Box sx={{ marginTop: 4 }}>

                                {/* Comment Input */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        border: "1px solid white",
                                        padding: 2,
                                        borderRadius: "10px",
                                        backgroundColor: "transparent",
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{ color: "#fff", fontWeight: "bold" }}
                                    >
                                        {comments?.length || 0} Comments
                                    </Typography>
                                    <Box sx={{
                                        padding: 2,
                                        background: "#fff",
                                        borderRadius: "8px",
                                    }}>
                                        <TextField
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            fullWidth
                                            variant="standard"
                                            placeholder="Write a comment..."
                                            InputProps={{
                                                disableUnderline: true,
                                            }}
                                            sx={{
                                                background: "#fff",
                                                color: "#000",
                                                borderBottom: "1px solid #f50057",
                                                "& input": { color: "#000" },
                                                "& .MuiInput-underline:before": { borderBottom: "1px solid #f50057" },
                                            }}
                                        />
                                    </Box>
                                    <Button
                                        onClick={handleCommentSubmit}
                                        variant="contained"
                                        color="primary"
                                        sx={{
                                            textTransform: "none",
                                            backgroundColor: "#f50057",
                                            fontSize: "14px",
                                            alignSelf: "flex-end",
                                        }}
                                    >
                                        Save
                                    </Button>
                                </Box>

                                {/* Display Comments */}
                                <Box sx={{ marginTop: 3 }}>
                                    {comments.map((val: any, index: number) => {
                                        return (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    borderRadius: "10px",
                                                    padding: 0,
                                                    marginBottom: 2,
                                                }}
                                            >
                                                <Avatar
                                                    src={val?.Avatar}
                                                    alt="Profile Picture"
                                                    sx={{ width: 40, height: 40 }}
                                                />
                                                <Box sx={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    padding: 2,
                                                    gap: 8.5,
                                                    border: "1px solid white",
                                                    borderRadius: "10px",
                                                    width: "100%",
                                                }}>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="body1" sx={{ color: "#fff", fontWeight: "bold" }}>
                                                            {val?.Username}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: "#ccc" }}>
                                                            {val?.Comment}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Button
                                                            onClick={() => handleCommentReply(val?.CommentId)}
                                                            variant="contained"
                                                            color="primary"
                                                            sx={{
                                                                textTransform: "none",
                                                                backgroundColor: "#f50057",
                                                            }}
                                                        >
                                                            Reply
                                                        </Button>
                                                        <Flag sx={{ color: "#f50057" }} />
                                                    </Box>

                                                </Box>
                                            </Box>
                                        )
                                    })

                                    }


                                    {/* Reply Box */}
                                    {parentCommentId &&
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "row",
                                                width: "100%",
                                                gap: 2,
                                                border: "1px solid white",
                                                padding: 2,
                                                borderRadius: "10px",
                                                backgroundColor: "transparent",
                                            }}
                                        >
                                            <Box sx={{
                                                padding: 2,
                                                background: "#fff",
                                                borderRadius: "8px",
                                                width: "100%",
                                            }}>
                                                <TextField
                                                    value={commentReply}
                                                    onChange={(e: any) => setCommentReply(e.target.value)}
                                                    fullWidth
                                                    variant="standard"
                                                    placeholder="Write a reply..."
                                                    InputProps={{
                                                        disableUnderline: true,
                                                    }}
                                                    sx={{
                                                        background: "#fff",
                                                        color: "#000",
                                                        borderBottom: "1px solid #f50057",
                                                        "& input": { color: "#000" },
                                                        "& .MuiInput-underline:before": { borderBottom: "1px solid #f50057" },
                                                    }}
                                                />
                                            </Box>
                                            <Button
                                                onClick={handleCommentReplySubmit}
                                                variant="contained"
                                                color="primary"
                                                sx={{
                                                    textTransform: "none",
                                                    backgroundColor: "#f50057",
                                                    fontSize: "14px",
                                                    alignSelf: "flex-end",
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </Box>

                                    }

                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


            {/* Bottom Navigation Bar */}
            <UserBottomNavigation />
        </Box>
    );
}
