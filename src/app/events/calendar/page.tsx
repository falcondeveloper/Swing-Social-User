"use client";

import UserBottomNavigation from "@/components/BottomNavigation";
import Header from "@/components/Header";
import {
    Box,
    Button,
    Typography,
    Checkbox,
    FormControlLabel,
    Grid,
    useTheme,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import isBetween from 'dayjs/plugin/isBetween';
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

dayjs.extend(isBetween);
export default function Calendar() {

    const router = useRouter();
    const [currentDate, setCurrentDate] = useState<any>(dayjs());
    const [selectedDays, setSelectedDays] = useState<any>([]);
    const [showWeekends, setShowWeekends] = useState(true);
    const [showOtherMonthDays, setShowOtherMonthDays] = useState(true);

    const theme = useTheme();
    //const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isMobile = useMediaQuery('(max-width: 480px)') ? true : false;

    const startOfMonth = currentDate.startOf("month");
    const endOfMonth = currentDate.endOf("month");
    const daysInMonth = endOfMonth.date();
    const startDayOfWeek = startOfMonth.day();

    useEffect(() => {
        if (isMobile === false) {
            router.push("/events");
        }
        setCalendarModal(true);
    }, []);
    const goToPreviousMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
    const goToNextMonth = () => setCurrentDate(currentDate.add(1, "month"));
    const [events, setEvents] = useState<any>([]);
    const generateCalendar = () => {
        const days = [];
        let dayCounter = 1;

        // Define current month and year
        const currentMonth = currentDate.month();
        const currentYear = currentDate.year();

        for (let week = 0; week < 6; week++) {
            const weekRow = [];
            let isNextMonthWeek = true; // Flag to check if entire week is from next month

            for (let day = 0; day < 7; day++) {
                if (week === 0 && day < startDayOfWeek) {
                    // Days before the start of the current month
                    const prevMonthDay = endOfMonth.subtract(1, 'month').endOf('month').date() - (startDayOfWeek - day - 1);
                    weekRow.push(
                        <Box
                            key={`other-${week}-${day}`}
                            sx={{
                                textAlign: "center",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                color: "rgba(255, 255, 255, 0.3)",
                                cursor: "default",
                            }}
                        >
                            {prevMonthDay}
                        </Box>
                    );
                    isNextMonthWeek = false;
                } else if (dayCounter > daysInMonth) {
                    // Days after the end of the current month
                    weekRow.push(
                        <Box
                            key={`other-${week}-${day}`}
                            sx={{
                                textAlign: "center",
                                padding: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                color: "rgba(255, 255, 255, 0.3)",
                                cursor: "default",
                            }}
                        >
                            {dayCounter - daysInMonth}
                        </Box>
                    );
                    dayCounter++;
                } else {
                    isNextMonthWeek = false;
                    // Current month's days
                    const currentDay = dayCounter;
                    const isWeekend = day === 0 || day === 6;

                    // Correctly build the current date for the day in the current month
                    const currentDateCheck = dayjs()
                        .year(currentYear)
                        .month(currentMonth)
                        .date(currentDay);

                    // Find the event for this specific day
                    const eventForDay = events.find((event: any) => {
                        const eventStart = dayjs(event.StartTime);
                        return currentDateCheck.isSame(eventStart, "day");
                    });

                    if (showWeekends || !isWeekend) {
                        weekRow.push(
                            <Box
                                key={`day-${week}-${day}`}
                                onClick={() => {
                                    if (eventForDay) {
                                        // Navigate to the event details page
                                        router.push(`/events/detail/${eventForDay.Id}`);
                                    }
                                }}
                                sx={{
                                    cursor: eventForDay ? "pointer" : "default",
                                    textAlign: "center",
                                    padding: "8px",
                                    position: "relative",
                                    backgroundColor: selectedDays.includes(currentDay)
                                        ? "#f50057"
                                        : "transparent",
                                    color: selectedDays.includes(currentDay) ? "#fff" : "inherit",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    userSelect: "none",
                                }}
                            >
                                {currentDay}
                                {eventForDay && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            bottom: "4px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            width: "6px",
                                            height: "6px",
                                            backgroundColor: "red",
                                            borderRadius: "50%",
                                        }}
                                    ></span>
                                )}
                            </Box>
                        );
                    } else {
                        weekRow.push(<Box key={`empty-${week}-${day}`} />);
                    }
                    dayCounter++;
                }
            }

            // Only add the week if it's not entirely next month's days
            if (!isNextMonthWeek) {
                days.push(
                    <Grid container spacing={1} justifyContent="center" key={`week-${week}`}>
                        {weekRow.map((day, index) => (
                            <Grid item xs={1.5} key={index}>
                                {day}
                            </Grid>
                        ))}
                    </Grid>
                );
            }
        }
        return days;
    };

    const toggleDaySelection = (day: any) => {
        console.log(day, "==========day");
        setSelectedDays((prev: any) =>
            prev.includes(day) ? prev.filter((d: any) => d !== day) : [...prev, day]
        );
    };

    const [openCalendar, setCalendarModal] = useState(false);

    const [profileId, setProfileId] = useState<any>();
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfileId(localStorage.getItem('logged_in_profile'));
        }
    }, []);

    useEffect(() => {
        if (profileId) {
            handleGetEvents(profileId);
        }
        else {
            handleGetEvents("a0cf00e0-6245-4d03-9d07-48d6626f4f57");
        }
    }, []);
    const handleGetEvents = async (userid: any) => {
        try {
            const response = await fetch('/api/user/events?id=' + userid, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const eventsData = await response.json();
            setEvents(eventsData?.events || []);
            console.log(eventsData);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <Box sx={{ color: "white", padding: "10px" }}>
            <Header />
            
            <Typography
                    variant="h6"
                    sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        mb: 2,
                        color: "#f50057",
                    }}
                >
                    {currentDate.format("MMMM YYYY")}
            </Typography>
            
            <Box sx={{ padding: { lg: 4, md: 4, sm: 0, xs: 0 }, marginTop: 7 }}>
                {/* Current Month and Year */}
                <Button
                    onClick={() => router.back()}
                    startIcon={<ArrowLeft />}
                    sx={{
                        textTransform: "none",
                        color: "rgba(255, 255, 255, 0.7)",
                        textAlign: "center",
                        minWidth: "auto",
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
                <Typography
                    variant="h6"
                    sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        mb: 2,
                        color: "#f50057",
                    }}
                >
                    {currentDate.format("MMMM YYYY")}
                </Typography>

                {/* Calendar Grid */}
                <Box>
                    <Grid container spacing={1} sx={{ textAlign: "center", padding: "8px", justifyContent: 'center' }}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <Grid
                                item
                                xs={1.5}
                                key={day}
                                sx={{
                                    fontWeight: "bold",
                                    padding: "8px",
                                }}
                            >
                                {day}
                            </Grid>
                        ))}
                    </Grid>
                    {generateCalendar()}
                </Box>

                {/* Selected Days */}
                {/* <Typography variant="body1" sx={{ mt: 2 }}>
                    Select Days:
                </Typography> */}

                {/* Options */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                    {/* <FormControlLabel
                        control={
                            <Checkbox
                                checked={showWeekends}
                                onChange={(e) => setShowWeekends(e.target.checked)}
                                sx={{
                                    "&.Mui-checked": {
                                        color: "#f50057", // Custom color for the checked state
                                    },
                                }}
                            />
                        }
                        label="Show Weekends"
                    /> */}
                    {/* <FormControlLabel
                        control={
                            <Checkbox
                                checked={showOtherMonthDays}
                                onChange={(e) => setShowOtherMonthDays(e.target.checked)}
                                sx={{
                                    "&.Mui-checked": {
                                        color: "#f50057", // Custom color for the checked state
                                    },
                                }}
                            />
                        }
                        label="Show Days from Other Months"
                    /> */}
                </Box>


                {/* Navigation Buttons */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Button onClick={goToPreviousMonth} variant="outlined">
                    {/* {currentDate.subtract(1, 'month').format('MMM')} */}
                    {currentDate.subtract(1, 'month').format('MMM YYYY')}
                    
                    </Button>
                    <Button onClick={goToNextMonth} variant="outlined">
                    {currentDate.add(1, 'month').format('MMM YYYY')}
                    </Button>
                </Box>
            </Box>
            {/* <Dialog open={openCalendar}>
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Info
                </DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Loading events with delay, and changing current view
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={() => { setCalendarModal(!openCalendar); }} sx={{ color: 'red' }}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog> */}
            <Footer />
        </Box>
    );
}
