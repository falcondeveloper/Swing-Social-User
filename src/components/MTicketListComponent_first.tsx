import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, Button, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

type Ticket = {
    TicketPackageId: string;
    Name: string;
    Description: string | null;
    Type: string;
    Price: number;
    Quantity: number;
    EventId: string;
};

type TicketListProps = {
    tickets: Ticket[];
    onTicketsChange: any;
    summary: any
};

const TicketListComponent: React.FC<TicketListProps> = ({ tickets, onTicketsChange, summary }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [ticketStates, setTicketStates] = useState(
        tickets.map((ticket) => ({
            id: ticket.TicketPackageId,
            quantity: 0,
            error: "",
        }))
    );
    console.log(ticketStates, "-============ticket state");
    const toggleBox = () => {
        setIsOpen(!isOpen);
    };

    const handleInputChange = (index: number, value: string, price: any, type: any, name: any) => {
        let total: any = parseInt(value) * parseFloat(price);
        onTicketsChange(value, parseInt(total), name, type)
        const parsedValue = parseInt(value, 10) || 0;
        // Update the state for the specific index
        setQuantity((prevQuantity) => ({
            ...prevQuantity,
            [index]: parsedValue,
        }));
    };


    const [quantity, setQuantity] = useState<{ [key: number]: any }>(
        () =>
            tickets?.reduce((acc, row, index) => {
                acc[index] = 0; // Set the initial value if available, else "Pending"
                return acc;
            }, {} as { [key: number]: any }) || {}
    );
    useEffect(() => {
        setQuantity(
            () =>
                tickets?.reduce((acc, row, index) => {
                    acc[index] = 0; // Set the initial value if available, else "Pending"
                    return acc;
                }, {} as { [key: number]: any }) || {}
        );
    }, [tickets]);
    return (
        <Box sx={{ marginTop: 4 }}>
            {/* Title with Toggle Icon */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h6" fontWeight="bold" color="white">
                    Tickets
                </Typography>
                <IconButton onClick={toggleBox} sx={{ color: "white" }}>
                    {isOpen ? <RemoveIcon /> : <AddIcon />}
                </IconButton>
            </Box>

            {/* Scrollable Ticket List */}
            {isOpen && (
                <Box
                    sx={{
                        maxHeight: "200px", // Set max height for scroll
                        overflowY: "auto", // Enable vertical scroll
                        marginTop: "10px",
                    }}
                >
                    {tickets.map((ticket, index) => {
                        const ticketState = ticketStates.find((state) => state.id === ticket.TicketPackageId);
                        return (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    border: "1px solid white",
                                    padding: 2,
                                    borderRadius: "10px",
                                    backgroundColor: "transparent",
                                    marginTop: "10px",
                                }}
                            >
                                {/* Ticket Row */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Button variant="contained" sx={{ background: "#420b8f" }}>
                                        {ticket.Type.toUpperCase()}
                                    </Button>
                                    <Button variant="contained" sx={{ background: "#aa1f72" }}>
                                        ${ticket.Price}
                                    </Button>
                                </Box>

                                {/* Input Field */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        marginY: 2,
                                    }}
                                >
                                    <TextField
                                        size="small"
                                        placeholder="Enter quantity"
                                        type="number"
                                        value={quantity[index] || ""}
                                        onChange={(e) => handleInputChange(index, e.target.value, ticket.Price, ticket?.Type, ticket?.Name)}
                                        sx={{
                                            background: "#fff",
                                            textAlign: "center",
                                            width: { lg: "10%", md: "10%", sm: "40%", xs: "40%" },
                                            "& .MuiInputBase-input": {
                                                color: "#000", // Text color
                                                textAlign: "center",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": {
                                                    borderColor: "white", // Border color
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: "white", // Hover border color
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "white", // Focused border color
                                                },
                                            },
                                        }}
                                    />
                                    {ticketState?.error && (
                                        <Typography
                                            variant="body2"
                                            color="error"
                                            sx={{ marginTop: 1, textAlign: "center" }}
                                        >
                                            {ticketState.error}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Paragraph */}
                                <Typography variant="body2" color="white" textAlign="center">
                                    {ticket.Name} - {ticket.Quantity} Available
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default TicketListComponent;