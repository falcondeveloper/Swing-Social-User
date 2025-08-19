"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Collapse,
  Fade,
  Divider,
  Chip,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface Ticket {
  TicketPackageId: string;
  Type: string;
  Price: number;
  Name: string;
  Quantity: number;
  EventName: string;
  EmailDescription: string;
  OriginalQuantity: number;
}

interface TicketQuantities {
  [key: string]: number;
}

interface TicketListProps {
  tickets: Ticket[];
  eventDescription?: string;
  emailDescriptions: any;
  onTicketsChange: (
    quantity: number,
    price: number,
    name?: string,
    type?: string,
    eventName?: string
  ) => void;
}

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  onTicketsChange,
  emailDescriptions,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [ticketQuantities, setTicketQuantities] = useState<TicketQuantities>(
    {}
  );
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [selectedTicketName, setSelectedTicketName] = useState<string>("");
  const [selectedEventName, setSelectedEventName] = useState<string>("");
  const [selectedEventDescription, setSelectedEventDescription] =
    useState<string>("");
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");

  const toggleBox = () => {
    setIsOpen(!isOpen);
  };

  const handleQuantityChange = (
    ticketId: string,
    value: string,
    ticket: Ticket
  ): void => {
    // Convert value to number and handle invalid inputs
    const quantity = parseInt(value) || 0;
    if (quantity < 0 || quantity > ticket.OriginalQuantity) return;

    // Update quantities for this ticket
    setTicketQuantities((prev) => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

  // Calculate totals whenever quantities change
  useEffect(() => {
    const calculateTotals = () => {
      let price = 0;
      let quantity = 0;
      let ticketName = "";
      let ticketType = "";
      let eventName = "";
      let eventDescription = "";

      // Calculate totals from all tickets
      Object.entries(ticketQuantities).forEach(([ticketId, ticketQuantity]) => {
        const ticket = tickets.find((t) => t.TicketPackageId === ticketId);
        if (ticket && ticketQuantity > 0) {
          price += ticket.Price * ticketQuantity;
          quantity += ticketQuantity;
          // Only store details of the first non-zero quantity ticket
          if (!ticketName) {
            ticketName = ticket.Name;
            ticketType = ticket.Type;
            eventName = ticket.EventName;
            eventDescription = emailDescriptions;
          }
        }
      });

      setTotalPrice(price);
      setTotalQuantity(quantity);
      setSelectedTicketName(ticketName);
      setSelectedTicketType(ticketType);
      setSelectedEventName(eventName);
      setSelectedEventDescription(eventDescription);

      // Call parent component's callback with updated summary
      onTicketsChange(quantity, price, ticketName, ticketType, eventName);
    };

    calculateTotals();
  }, [ticketQuantities, tickets, onTicketsChange]);

  const handleTicketCheckout = (): void => {
    if (totalQuantity > 0) {
      // Store overall ticket information
      localStorage.setItem("event_name", selectedEventName || "");
      localStorage.setItem("event_description", selectedEventDescription || "");
      localStorage.setItem("ticketPrice", totalPrice.toString());
      localStorage.setItem("ticketQuantity", totalQuantity.toString());
      localStorage.setItem("eventId", tickets[0]?.TicketPackageId || "");
      localStorage.setItem("ticketName", selectedTicketName || "");
      localStorage.setItem("ticketType", selectedTicketType || "");

      // Store individual ticket quantities
      const ticketDetails = tickets
        .map((ticket) => ({
          id: ticket.TicketPackageId,
          name: ticket.Name,
          description: emailDescriptions,
          type: ticket.Type,
          price: ticket.Price,
          quantity: ticketQuantities[ticket.TicketPackageId] || 0,
          eventName: ticket.EventName,
        }))
        .filter((ticket) => ticket.quantity > 0);

      localStorage.setItem("ticketDetails", JSON.stringify(ticketDetails));
      router.push("/events/ticket");
    }
  };

  const sortedTickets = useMemo(() => {
    // copy to avoid mutating props/state
    const copy = [...tickets];

    // 1) Available first, then sold out
    // 2) (optional) Within each group, sort by price ascending (or name)
    copy.sort((a, b) => {
      const aAvail = a.OriginalQuantity > 0 ? 1 : 0;
      const bAvail = b.OriginalQuantity > 0 ? 1 : 0;

      // Put available first
      if (aAvail !== bAvail) return bAvail - aAvail;

      // Secondary sort (optional): lower price first
      // return a.Price - b.Price;

      // Or by name:
      // return a.Name.localeCompare(b.Name);

      return 0;
    });

    return copy;
  }, [tickets]);

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "linear-gradient(to right, #6a1b9a, #880e4f)",
          p: 3,
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" color="white">
            🎟️ Tickets
          </Typography>
          <Typography variant="body1" color="grey.300" sx={{ mt: 0.5 }}>
            Select your tickets — <strong>Total:</strong> ${totalPrice}
          </Typography>
        </Box>
        <IconButton
          onClick={toggleBox}
          sx={{
            color: "white",
            bgcolor: "#560027",
            transition: "transform 0.2s ease",
            "&:hover": {
              transform: "scale(1.15)",
              bgcolor: "#3c001f",
            },
            border: "2px solid white",
          }}
        >
          {isOpen ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
      </Box>

      {/* Ticket List */}
      <Collapse in={isOpen}>
        <Box
          sx={{
            mt: 3,
            maxHeight: 420,
            overflowY: "auto",
            pr: 1,
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#880E4F",
              borderRadius: 3,
            },
          }}
        >
          {sortedTickets.map((ticket, index) => (
            <Fade
              key={ticket.TicketPackageId}
              in={true}
              timeout={500}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "linear-gradient(145deg, #2e2e2e, #3c3c3c)",
                  mb: 2,
                  transition: "0.3s",
                  "&:hover": {
                    transform: "scale(1.01)",
                    boxShadow: "0 4px 20px rgba(136, 14, 79, 0.4)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Chip
                    label={ticket.Type.toUpperCase()}
                    sx={{ bgcolor: "#420b8f", color: "white" }}
                  />
                  <Box
                    sx={{
                      display: "inline-block",
                      px: 2,
                      py: 0.5,
                      bgcolor: "#ffebee",
                      color: "#c62828",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      borderRadius: "999px",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                      minWidth: "60px",
                      textAlign: "center",
                    }}
                  >
                    ${ticket.Price}
                  </Box>
                </Box>

                <TextField
                  size="small"
                  placeholder="Enter quantity"
                  type="number"
                  value={ticketQuantities[ticket.TicketPackageId] || ""}
                  onChange={(e) =>
                    handleQuantityChange(
                      ticket.TicketPackageId,
                      e.target.value,
                      ticket
                    )
                  }
                  disabled={ticket.OriginalQuantity <= 0}
                  sx={{
                    mt: 2,
                    input: {
                      textAlign: "center",
                      bgcolor: "white",
                      borderRadius: 1,
                    },
                  }}
                />

                <Box sx={{ textAlign: "center", mt: 1 }}>
                  <Typography variant="subtitle1" color="white">
                    {ticket.Name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        ticket.OriginalQuantity > 0 ? "#4caf50" : "#f44336",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {ticket.OriginalQuantity > 0
                      ? `${ticket.OriginalQuantity} Available`
                      : "Sold Out"}
                  </Typography>

                  {ticketQuantities[ticket.TicketPackageId] > 0 && (
                    <Typography color="primary" mt={1}>
                      Subtotal: $
                      {ticket.Price * ticketQuantities[ticket.TicketPackageId]}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Fade>
          ))}
        </Box>

        {totalQuantity > 0 && (
          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: "12px",
              bgcolor: "rgba(136, 14, 79, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Typography variant="h6" color="white" mb={2}>
              🎫 Selected Tickets
            </Typography>
            {tickets.map((ticket) => {
              const quantity = ticketQuantities[ticket.TicketPackageId] || 0;
              if (quantity > 0) {
                return (
                  <Box
                    key={ticket.TicketPackageId}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography color="white">
                        {ticket.Name} ({ticket.Type})
                      </Typography>
                      <Typography color="grey.400" variant="body2">
                        ${ticket.Price} × {quantity}
                      </Typography>
                    </Box>
                    <Typography color="white" alignSelf="center">
                      ${ticket.Price * quantity}
                    </Typography>
                  </Box>
                );
              }
              return null;
            })}

            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />

            <Box textAlign="center">
              <Typography color="white">
                Total Tickets: {totalQuantity}
              </Typography>
              <Typography color="white">Total Price: ${totalPrice}</Typography>
              <Button
                variant="contained"
                onClick={handleTicketCheckout}
                sx={{
                  mt: 3,
                  bgcolor: "#880E4F",
                  px: 5,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: "bold",
                  transition: "0.3s",
                  "&:hover": {
                    bgcolor: "#560027",
                    boxShadow: "0 4px 20px rgba(136, 14, 79, 0.4)",
                  },
                }}
              >
                🚀 Proceed to Checkout
              </Button>
            </Box>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default TicketList;
