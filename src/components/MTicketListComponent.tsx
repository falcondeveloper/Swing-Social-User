import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Collapse,
  Fade,
  Divider,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";

type Ticket = {
  TicketPackageId: string;
  Name: string;
  Description: string;
  Type: string;
  Price: number;
  Quantity: number;
  EventId: string;
};

type TicketListProps = {
  tickets: Ticket[];
  onTicketsChange: (
    quantity: number,
    price: number,
    name?: string,
    type?: string
  ) => void;
  summary: any;
};

interface TicketQuantities {
  [key: string]: number;
}

const TicketListComponent: React.FC<TicketListProps> = ({
  tickets,
  onTicketsChange,
  summary,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [ticketQuantities, setTicketQuantities] = useState<TicketQuantities>(
    {}
  );
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [selectedTicketName, setSelectedTicketName] = useState<string>("");
	const [selectedTicketEventDescription, setSelectedTicketEventDescription] = useState<string>("");
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");

  const toggleBox = () => {
    setIsOpen(!isOpen);
  };

  const handleQuantityChange = (
    ticketId: string,
    value: string,
    ticket: Ticket
  ): void => {
    const quantity = parseInt(value) || 0;
    if (quantity < 0 || quantity > ticket.Quantity) return;

    setTicketQuantities((prev) => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

	console.log("Ticket event description", selectedTicketEventDescription);
  useEffect(() => {
    const calculateTotals = () => {
      let price = 0;
      let quantity = 0;
      let ticketName = "";
      let ticketType = "";
			let ticketDescription = "";

      Object.entries(ticketQuantities).forEach(([ticketId, ticketQuantity]) => {
        const ticket = tickets.find((t) => t.TicketPackageId === ticketId);
        if (ticket && ticketQuantity > 0) {
          price += ticket.Price * ticketQuantity;
					ticketDescription = ticket.Description;
          quantity += ticketQuantity;
          if (!ticketName) {
            ticketName = ticket.Name;
            ticketType = ticket.Type;
          }
        }
      });

      setTotalPrice(price);
      setTotalQuantity(quantity);
      setSelectedTicketName(ticketName);
			setSelectedTicketEventDescription(ticketDescription)
      setSelectedTicketType(ticketType);

      onTicketsChange(quantity, price, ticketName, ticketType);
    };

    calculateTotals();
  }, [ticketQuantities, tickets, onTicketsChange]);

  const handleTicketCheckout = (): void => {
    if (totalQuantity > 0) {
      localStorage.setItem("ticketPrice", totalPrice.toString());
      localStorage.setItem("ticketQuantity", totalQuantity.toString());
      localStorage.setItem("eventId", tickets[0]?.TicketPackageId || "");
      localStorage.setItem("ticketName", selectedTicketName || "");
      localStorage.setItem("ticketEventDescription", selectedTicketEventDescription || "");
      localStorage.setItem("ticketType", selectedTicketType || "");

      const ticketDetails = tickets
        .map((ticket) => ({
          id: ticket.TicketPackageId,
          name: ticket.Name,
					description: ticket.Description,
          type: ticket.Type,
          price: ticket.Price,
          quantity: ticketQuantities[ticket.TicketPackageId] || 0,
        }))
        .filter((ticket) => ticket.quantity > 0);

      localStorage.setItem("ticketDetails", JSON.stringify(ticketDetails));
      window.location.href = "/events/ticket";
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "rgba(136, 14, 79, 0.1)",
          p: 2,
          borderRadius: "10px",
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "rgba(136, 14, 79, 0.2)",
          },
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" color="white">
            Tickets 
          </Typography>
          <Typography variant="body2" color="grey.400" sx={{ mt: 0.5 }}>
            Select your tickets - Total: ${totalPrice}
          </Typography>
        </Box>
        <IconButton
          onClick={toggleBox}
          sx={{
            color: "white",
            bgcolor: "#880E4F",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "#560027",
              transform: "scale(1.1)",
            },
          }}
        >
          {isOpen ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
      </Box>

      <Collapse in={isOpen}>
        <Box
          sx={{
            maxHeight: "400px",
            overflowY: "auto",
            mt: 2,
            pr: 1,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#880E4F",
              borderRadius: "4px",
            },
          }}
        >
          {tickets.map((ticket, index) => (
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
                  border: "0.0625rem solid rgb(55, 58, 64)",
                  p: 3,
                  bgcolor: "rgba(0, 0, 0, 0.3)",
                  mb: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    border: "0.0625rem solid rgb(55, 58, 64)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(136, 14, 79, 0.2)",
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
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#420b8f",
                      "&:hover": { bgcolor: "#35077a" },
                    }}
                  >
                    {ticket.Type.toUpperCase()}
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: "#880E4F",
                      "&:hover": { bgcolor: "#560027" },
                    }}
                  >
                    ${ticket.Price}
                  </Button>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    my: 2,
                  }}
                >
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
                    sx={{
                      width: { xs: "150px" },
                      "& .MuiInputBase-input": {
                        color: "#000",
                        textAlign: "center",
                        bgcolor: "white",
                        borderRadius: 1,
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#880E4F",
                        },
                        "&:hover fieldset": {
                          borderColor: "#560027",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#880E4F",
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                    {ticket.Name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: ticket.Quantity > 0 ? "#4caf50" : "#f44336",
                      fontWeight: "bold",
                    }}
                  >
                    {ticket.Quantity > 0
                      ? `${ticket.Quantity} Available`
                      : "Sold Out"}
                  </Typography>
                  {ticketQuantities[ticket.TicketPackageId] > 0 && (
                    <Typography color="primary" sx={{ mt: 1 }}>
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
              mt: 2,
              p: 3,
              borderRadius: "10px",
              bgcolor: "rgba(136, 14, 79, 0.1)",
              border: "1px solid rgba(136, 14, 79, 0.3)",
            }}
          >
            <Typography variant="h6" color="white" sx={{ mb: 2 }}>
              Selected Tickets
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
                      p: 1,
                      borderRadius: "4px",
                      bgcolor: "rgba(255, 255, 255, 0.05)",
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
                    <Typography color="white" sx={{ alignSelf: "center" }}>
                      ${ticket.Price * quantity}
                    </Typography>
                  </Box>
                );
              }
              return null;
            })}

            <Divider sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.1)" }} />

            <Box
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Box>
                <Typography color="white" sx={{ mb: 3 }}>
                  Total Summary
                </Typography>
                <Typography color="grey.300">
                  Total Tickets: {totalQuantity}
                </Typography>
                <Typography color="grey.300">
                  Total Price: ${totalPrice}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={handleTicketCheckout}
                sx={{
                  bgcolor: "#880E4F",
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: "0.8rem",
                  "&:hover": {
                    bgcolor: "#560027",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(136, 14, 79, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default TicketListComponent;
