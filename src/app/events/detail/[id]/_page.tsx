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
    Modal,
    FormControlLabel,
    Checkbox,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    CircularProgress,
    FormHelperText,
    Slide,
} from "@mui/material";
import { ThumbUp, Comment, Flag } from "@mui/icons-material"; // Import icons for like, comment, and flag
import { useEffect, useState } from "react";
import TicketListComponent from "@/components/DTicketListComponent";
import RSVPListComponent from "@/components/RSVPListComponent";
import AttendeesListComponent from "@/components/AttendeesListComponent";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter } from "next/navigation";
import * as Papa from 'papaparse';

type Params = Promise<{ id: string }>

export default function EventDetail(props: { params: Params }) {
    const router = useRouter();
    const [id, setId] = useState<string>(''); // State for error messages
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const getIdFromParam = async () => {
            const params = await props.params;
            const pid: any = params.id;
            console.log(pid);
            setId(pid)
            console.log(pid, "===========id");
        }
        getIdFromParam();
    }, [props]);
    useEffect(() => {
        if (id) {
            handleGetEventDetail(id);
        }
    }, [id]);
    const [posts, setPosts] = useState<any>([]);
    const [comment, setComment] = useState<any>(null);
    const [eventDetail, setEventDetail] = useState<any>(null);
    const [rsvp, setRsvp] = useState<any>([]);
    const [attendees, setAttendees] = useState<any>([]);
    const [tickets, setTicket] = useState<any>([]);
    const [summary, setSummary] = useState<any>({
        totalQuantity: 0,
        totalPrice: 0,
        ticketName: "",
        ticketType: ""
    });
    const allImages = [eventDetail?.CoverImageUrl, ...(eventDetail?.Images || [])];

    const handleSlideChange = (direction: any) => {
        if (direction === 'next') {
            setCurrentImageIndex((prev) =>
                prev === allImages.length - 1 ? 0 : prev + 1
            );
        } else {
            setCurrentImageIndex((prev) =>
                prev === 0 ? allImages.length - 1 : prev - 1
            );
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            handleSlideChange('next');
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, [currentImageIndex]);

    console.log(summary, "============summary");
    const handleTicketsChange = (quantity: any = 0, price: any = 0, name: any, type: any) => {
        setSummary({
            totalQuantity: quantity,
            totalPrice: price,
            ticketName: name,
            ticketType: type
        });
    };

    const handleGetEventDetail = async (eventId: any) => {
        try {
            const checkResponse = await fetch('/api/user/events?eventId=' + eventId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const eventData = await checkResponse.json();
            console.log(eventData?.events, "===========events");
            setEventDetail(eventData?.event)
            setRsvp(eventData?.rsvp)
            setAttendees(eventData?.attendees)
            setTicket(eventData?.tickets)

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

    console.log(eventDetail, "===========", profileId);
    const [targetId, setTargetId] = useState<any>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const handleReportModalToggle = (pid: string) => {
        setTargetId(pid);
        setIsReportModalOpen((prev) => !prev);
    };

    const [reportOptions, setReportOptions] = useState({
        reportUser: false,
        blockUser: false,
    });

    const handleCheckboxChange = (event: any) => {
        const { name, checked } = event.target;
        setReportOptions((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };
    const handleEmailCheckboxChange = (field: any) => {
        setFormState((prev: any) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleReportUser = async () => {
        try {
            // Check if t
            // he username exists
            const checkResponse = await fetch('/api/user/sweeping/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ profileid: profileId, targetid: targetId }), // Pass the username to check
            });
            setIsReportModalOpen((prev) => !prev);
            const checkData = await checkResponse.json();

        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleReportSubmit = () => {
        console.log("Report Options:", reportOptions);
        setIsReportModalOpen(false);
        handleReportUser();
        // Add logic to handle report or block user action
    };


    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setError] = useState<any>(null);

    const handleSendEmail = async (): Promise<void> => {
        setLoading(true);

        try {
            // Determine recipients based on formState
            let recipients: any[] = [];

            if (formState.rsvpChecked) {
                recipients = [...recipients, ...rsvp];
            }

            if (formState.attendeeChecked) {
                recipients = [...recipients, ...attendees];
            }

            // Avoid duplicates if both are checked
            recipients = Array.from(new Set(recipients));

            // Ensure recipients array is not empty
            if (recipients.length === 0) {
                setError("Please select at least one recipient group (RSVP or Attendee).");
                setLoading(false);
                return;
            }

            // Send the email
            const response = await fetch('/api/user/events/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipients,
                    subject: formState.emailSubject,
                    htmlBody: formState.emailDescription,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to send email. Status: ${response.status}`);
            }

            alert('Emails sent successfully!');
        } catch (error: any) {
            console.error('Error sending bulk email:', error);
            setError('Failed to send emails.');
        } finally {
            setLoading(false);
            // setOpen(false);
        }
    };


    const [formState, setFormState] = useState({
        emailDescription: "",
        emailSubject: "",
        rsvpChecked: false,
        attendeeChecked: false,
    });

    const handleEditorChange = (field: any, value: any) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
    };

    const handleInputChange = (event: any) => {
        const { name, value } = event.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [openSaveRsvp, setOpenSaveRsvp] = useState(false);
    const handleSaveRsvp = () => {
        setOpenSaveRsvp(!openSaveRsvp);
    }

    const handleTicketCheckout = () => {
        if (summary?.totalQuantity > 0) {
            localStorage.setItem('event_name', eventDetail?.Name);
            localStorage.setItem('ticketPrice', summary?.totalPrice);
            localStorage.setItem('ticketName', summary?.ticketName);
            localStorage.setItem('ticketType', summary?.ticketType);
            localStorage.setItem('ticketQuantity', summary?.totalQuantity);
            localStorage.setItem('eventId', id);
            router.push('/events/ticket');
        }
    }


    const [openDownloadModal, setOpenDownloadModal] = useState(false); // Modal visibility state
    const [downloadAttendee, setDownloadAttendee] = useState(false); // Checkbox for Attendees
    const [downloadRsvp, setDownloadRsvp] = useState(false); // Checkbox for RSVP
    console.log(openDownloadModal);

    // Function to handle opening the download modal
    const handleOpenDownloadModal = () => setOpenDownloadModal(true);

    // Function to handle closing the download modal
    const handleCloseDownloadModal = () => setOpenDownloadModal(false);

    // Handle the change of checkboxes
    const handleDownloadAttendeeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDownloadAttendee(event.target.checked);
    };
    const handleDownloadRsvpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDownloadRsvp(event.target.checked);
    };

    // Updated handleDownloadList function
    const handleDownloadList = () => {
        if (!downloadAttendee && !downloadRsvp) {
            alert("Please select at least one option to download.");
            return;
        }

        // Check if downloadAttendee is selected
        if (downloadAttendee && attendees.length > 0) {
            handleExportCSV("Attendees", attendees);
        } else if (downloadAttendee) {
            alert("No Attendee data available to export.");
        }

        // Check if downloadRsvp is selected
        if (downloadRsvp && rsvp.length > 0) {
            handleExportCSV("RSVP", rsvp);
        } else if (downloadRsvp) {
            alert("No RSVP data available to export.");
        }

        handleCloseDownloadModal(); // Close the modal after the download action
    };

    // Updated handleExportCSV function
    const handleExportCSV = (type: any, data: any) => {
        console.log(`Exporting ${type} as CSV`);

        // Format data for CSV
        const csvData = data.map((entry: any) => ({
            ProfileId: entry.ProfileId,
            Name: entry.Name,
            Email: entry.Email,
            Status: type === "RSVP" ? entry.RSVPStatus : entry.AttendanceStatus, // Adjust field name based on type
        }));

        // Convert to CSV and trigger download
        const csvContent = Papa.unparse(csvData);
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", `${type}_List.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


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
                            <Typography variant="h2" color="white" textAlign={'center'}>
                                {eventDetail?.Name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', justifyContent: 'center' }}>
                                <Typography variant="body2" color="text.secondary" style={{ color: "white" }}>
                                    <strong style={{ color: "white" }}>Start at:</strong> {new Intl.DateTimeFormat('en-US', {
                                        month: 'short',
                                        day: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    }).format(new Date(eventDetail?.StartTime || "2025-01-12T15:00:26.555Z"))}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" style={{ color: "white" }}>
                                    <strong style={{ color: "white" }}>End at:</strong> {new Intl.DateTimeFormat('en-US', {
                                        month: 'short',
                                        day: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    }).format(new Date(eventDetail?.EndTime || "2025-01-12T15:00:26.555Z"))}
                                </Typography>
                            </Box>

                            {/* Post Card */}
                            <Card
                                sx={{
                                    borderRadius: "10px",
                                    marginTop: 10,
                                    background: "#000000"
                                }}
                            >
                                <img
                                    src={eventDetail?.CoverImageUrl} // Placeholder image for the post
                                    alt="Post Image"
                                    style={{
                                        width: "100%",
                                        borderTopLeftRadius: "10px",
                                        borderTopRightRadius: "10px",
                                    }}
                                />
                                <CardContent sx={{ padding: 0, paddingBottom: 0 }}>
                                    <Grid container sx={{ paddingBottom: 0, justifyContent: 'right' }}>
                                        <Grid item lg={2} md={2} sm={2} xs={2} sx={{ textAlign: 'right' }}>
                                            <IconButton sx={{ color: "#f50057" }} onClick={() => handleReportModalToggle(eventDetail?.UserId)}>
                                                <Flag sx={{ fontSize: "40px" }} />
                                            </IconButton>
                                        </Grid>
                                        {profileUsername === eventDetail?.Username &&
                                            <Grid item lg={6} md={6} sm={6} xs={6}>
                                                <Button
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
                            <Box>
                                <Typography variant="h6" fontWeight="bold" color="white">
                                    Details
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Table sx={{ borderRadius: 4 }}>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: "lightgray",
                                                    width: "30%", // First cell takes 30% of the row
                                                    whiteSpace: "nowrap", // Prevents text wrapping
                                                }}
                                            >
                                                <Typography variant="body2" color="white">
                                                    Start Time:
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: "darkgray", width: "70%" }}>
                                                <Typography color="white">{eventDetail?.StartTime || "N/A"}</Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: "lightgray",
                                                    width: "30%",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <Typography variant="body2" color="white">
                                                    End Time
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: "darkgray", width: "70%" }}>
                                                <Typography color="white">{eventDetail?.EndTime || "N/A"}</Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: "lightgray",
                                                    width: "30%",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <Typography variant="body2" color="white">
                                                    Venue
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: "darkgray", width: "70%" }}>
                                                <Typography color="white">{eventDetail?.Venue || "N/A"}</Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: "lightgray",
                                                    width: "30%",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <Typography variant="body2" color="white">
                                                    Address
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: "darkgray", width: "70%" }}>
                                                <Typography color="white">
                                                    {eventDetail?.Address}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: "lightgray",
                                                    width: "30%",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <Typography variant="body2" color="white">
                                                    Type
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: "darkgray", width: "70%" }}>
                                                <Typography color="white">
                                                    {eventDetail?.Type}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    backgroundColor: "lightgray",
                                                    width: "30%",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <Typography variant="body2" color="white">
                                                    Host
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: "darkgray", width: "70%" }}>
                                                <Typography color="white">
                                                    {eventDetail?.Host}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Box>

                            <Box sx={{ marginTop: 4 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        border: "1px solid white",
                                        padding: 2,
                                        borderRadius: "10px",
                                        backgroundColor: "transparent",
                                        textAlign: "center", // Center align the text inside the box
                                    }}
                                >
                                    {/* Heading */}
                                    <Typography color="white" variant="h5" sx={{ fontWeight: "bold" }}>
                                        Join the fun
                                    </Typography>

                                    {/* Paragraph */}
                                    <Typography variant="body1" color="white">
                                        Be one of the first to RSVP
                                    </Typography>

                                    {/* RSVP Button */}
                                    <Button
                                        variant="contained"
                                        onClick={handleSaveRsvp}
                                        sx={{
                                            background: "#aa1f72",
                                            width: "20%",
                                            marginLeft: "auto",
                                            marginRight: "auto",
                                            marginTop: 2,
                                            borderRadius: "10px", // Rounded corners
                                            padding: "10px 20px", // Adjust padding to make it look better
                                        }}
                                    >
                                        RSVP
                                    </Button>
                                </Box>

                            </Box>

                            <TicketListComponent tickets={tickets} onTicketsChange={handleTicketsChange} />
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    border: "1px solid white",
                                    padding: 1,
                                    borderRadius: "10px",
                                    backgroundColor: "transparent",
                                    textAlign: "center", // Center align the text inside the box
                                }}
                            >
                                <Button
                                    variant="contained"
                                    onClick={handleTicketCheckout}
                                    sx={{
                                        backgroundColor: "transparent",
                                        width: { lg: "20%", md: "20%", sm: "100%", xs: "100%" },
                                        marginLeft: "auto",
                                        marginRight: "auto",
                                        borderRadius: "10px", // Rounded corners
                                        padding: "10px 20px", // Adjust padding to make it look better
                                    }}
                                >
                                    Checkout
                                </Button>
                            </Box>
                            <Box sx={{ marginTop: 4 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        border: "1px solid white",
                                        padding: 2,
                                        borderRadius: "10px",
                                        backgroundColor: "transparent",
                                        textAlign: "center", // Center align the text inside the box
                                    }}
                                >
                                    {/* Heading */}
                                    <Typography color="white" variant="h5" sx={{ fontWeight: "bold" }}>
                                        Remind RSVPs & Attendees
                                    </Typography>

                                    {/* RSVP Button */}
                                    <Button
                                        variant="contained"
                                        onClick={handleOpen}
                                        sx={{
                                            background: "#aa1f72",
                                            width: { lg: "20%", md: "20%", sm: "100%", xs: "100%" },
                                            marginLeft: "auto",
                                            marginRight: "auto",
                                            marginTop: 2,
                                            borderRadius: "10px", // Rounded corners
                                            padding: "10px 20px", // Adjust padding to make it look better
                                        }}
                                    >
                                        Send Email
                                    </Button>
                                </Box>
                            </Box>
                            <Box sx={{ marginTop: 4 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                        border: "1px solid white",
                                        padding: 2,
                                        borderRadius: "10px",
                                        backgroundColor: "transparent",
                                        textAlign: "center", // Center align the text inside the box
                                    }}
                                >
                                    {/* Heading */}
                                    <Typography color="white" variant="h5" sx={{ fontWeight: "bold" }}>
                                        Download Attendees & RSVP list
                                    </Typography>

                                    {/* RSVP Button */}
                                    <Button
                                        variant="contained"
                                        onClick={() => setOpenDownloadModal(true)}
                                        sx={{
                                            background: "#aa1f72",
                                            width: { lg: "30%", md: "30%", sm: "100%", xs: "100%" },
                                            marginLeft: "auto",
                                            marginRight: "auto",
                                            marginTop: 2,
                                            borderRadius: "10px", // Rounded corners
                                            padding: "10px 20px", // Adjust padding to make it look better
                                        }}
                                    >
                                        Download Attendees List
                                    </Button>
                                </Box>

                            </Box>
                            <Box
                                sx={{ marginTop: 4, color: "#fff" }}
                                dangerouslySetInnerHTML={{ __html: eventDetail?.Description }}
                            />

                            <Typography variant="body1" color="white" sx={{ marginTop: 4 }}>
                                RSVP
                            </Typography>
                            {/* <RSVPListComponent rsvp={rsvp} /> */}

                            <Typography variant="body1" color="white" sx={{ marginTop: 4 }}>
                                Attendees
                            </Typography>
                            {/* <AttendeesListComponent attendees={attendees} /> */}

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Modal */}
            <Dialog
                open={openDownloadModal}
                // onClose={handleCloseDownloadModal}
                transitionDuration={500} // Smooth transition for the modal
                sx={{
                    '& .MuiDialog-paper': {
                        padding: '20px',
                        borderRadius: '12px',
                        backgroundColor: '#333', // Dark background for modal
                    },
                }}
            >
                <DialogTitle sx={{ color: '#fff', fontWeight: 'bold' }}>Download List</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Attendees Checkbox */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={downloadAttendee}
                                onChange={handleDownloadAttendeeChange}
                                sx={{
                                    color: '#fff',
                                    '&.Mui-checked': {
                                        color: '#4caf50', // Green when checked
                                    },
                                }}
                            />
                        }
                        label="Attendees"
                        sx={{ color: '#fff' }}
                    />
                    {/* RSVP Checkbox */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={downloadRsvp}
                                onChange={handleDownloadRsvpChange}
                                sx={{
                                    color: '#fff',
                                    '&.Mui-checked': {
                                        color: '#4caf50', // Green when checked
                                    },
                                }}
                            />
                        }
                        label="RSVP"
                        sx={{ color: '#fff' }}
                    />
                </DialogContent>

                {/* Modal Actions (Download Button) */}
                <DialogActions>
                    <Button
                        onClick={handleDownloadList}
                        variant="contained"
                        sx={{
                            backgroundColor: '#4caf50',
                            '&:hover': {
                                backgroundColor: '#45a049',
                            },
                            padding: '10px 20px',
                            borderRadius: '8px',
                            textTransform: 'capitalize',
                            transition: 'background-color 0.3s ease', // Cool button hover effect
                        }}
                    >
                        Download Attendees & RSVP
                    </Button>
                </DialogActions>
            </Dialog>
            <Modal open={isReportModalOpen} onClose={handleReportModalToggle}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 300,
                        bgcolor: "#1e1e1e", // Dark background
                        color: "white", // Default text color for dark background
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Report or Block User
                    </Typography>
                    <FormControlLabel
                        sx={{
                            color: "white", // Label color
                            "& .MuiCheckbox-root": {
                                color: "#9c27b0", // Checkbox color
                            },
                            "& .MuiCheckbox-root.Mui-checked": {
                                color: "#9c27b0", // Checked checkbox color
                            },
                        }}
                        control={
                            <Checkbox
                                checked={reportOptions.reportUser}
                                onChange={handleCheckboxChange}
                                name="reportUser"
                            />
                        }
                        label="Report User"
                    />
                    <FormControlLabel
                        sx={{
                            color: "white", // Label color
                            "& .MuiCheckbox-root": {
                                color: "#9c27b0", // Checkbox color
                            },
                            "& .MuiCheckbox-root.Mui-checked": {
                                color: "#9c27b0", // Checked checkbox color
                            },
                        }}
                        control={
                            <Checkbox
                                checked={reportOptions.blockUser}
                                onChange={handleCheckboxChange}
                                name="blockUser"
                            />
                        }
                        label="Block User"
                    />
                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button onClick={handleReportSubmit} variant="contained" color="secondary">
                            Submit
                        </Button>
                        <Button style={{ marginLeft: 10 }} onClick={() => handleReportModalToggle("null")} variant="contained" color="secondary">
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
            {/* MUI Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogContent
                    sx={{
                        backgroundColor: "#000", // Dialog background color
                        color: "white", // Text color
                    }}
                >
                    {/* Checkboxes */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, backgroundColor: "#2d2d2d", borderRadius: 2 }}>
                            <Checkbox
                                color="primary"
                                sx={{
                                    color: "white", // Default color when unchecked
                                    "&.Mui-checked": {
                                        color: "#9c27b0", // Custom color when checked
                                    },
                                }}
                                checked={formState.rsvpChecked}
                                onChange={() => handleEmailCheckboxChange("rsvpChecked")}
                            />
                            <Box>
                                <Typography variant="h6">RSVP</Typography>
                                <Typography>Send email to RSVPs</Typography>
                            </Box>
                        </Box>
                        <Box sx={{
                            display: "flex", alignItems: "center", gap: 2,
                            backgroundColor: "#2d2d2d", borderRadius: 2
                        }}>
                            <Checkbox
                                sx={{
                                    color: "white", // Default color when unchecked
                                    "&.Mui-checked": {
                                        color: "#9c27b0", // Custom color when checked
                                    },
                                }}
                                checked={formState.attendeeChecked}
                                onChange={() => handleEmailCheckboxChange("attendeeChecked")}
                            />
                            <Box>
                                <Typography variant="h6">Attendee</Typography>
                                <Typography>Send email to attendees</Typography>
                            </Box>
                        </Box>
                        {errors && <FormHelperText error>{errors}</FormHelperText>}
                    </Box>

                    {/* Card for Email Subject and Description */}
                    <Card
                        sx={{
                            padding: 2,
                            marginTop: 2,
                            backgroundColor: "#2d2d2d",
                            color: "white",
                            borderRadius: "10px",
                        }}
                    >
                        <TextField
                            fullWidth
                            name="emailSubject"
                            label="Email Subject"
                            variant="outlined"
                            value={formState.emailSubject}
                            onChange={handleInputChange}
                            sx={{
                                marginBottom: 2,
                                input: { color: "white" },
                                "& .MuiInputLabel-root": { color: "white" },
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "white" },
                                    "&:hover fieldset": { borderColor: "#61c800" },
                                },
                            }}
                        />
                        <Typography>Email Description</Typography>
                        <Editor
                            apiKey={"3yffl36ic8qni4zhtxbmc0t1sujg1m25sc4l638375rwb5vs"}
                            value={formState.emailDescription}
                            onEditorChange={(content) => handleEditorChange("emailDescription", content)}
                            init={{
                                height: 200, // Ensures the editor displays correctly
                                menubar: false,
                                toolbar: "bold italic underline | alignleft aligncenter alignright | bullist numlist",
                                statusbar: false,
                                plugins: ["advlist", "autolink", "lists", "link", "image"],
                                content_style:
                                    "body { background-color: #2d2d2d; color: white; font-family: Arial, sans-serif; }",
                                skin: "oxide-dark", // Dark mode for editor
                            }}
                        />
                    </Card>
                </DialogContent>
                <DialogActions
                    sx={{
                        backgroundColor: "#000", // Dialog footer background color
                    }}
                >
                    <Button onClick={handleClose} color="secondary" variant="outlined">
                        Cancel
                    </Button>
                    <Button

                        onClick={handleSendEmail}
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        Send Email
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog open={openSaveRsvp}>
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Confirm
                </DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        RSVP Successfully save
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleSaveRsvp} sx={{ color: 'red' }}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Bottom Navigation Bar */}
            <UserBottomNavigation />
        </Box>
    );
}
