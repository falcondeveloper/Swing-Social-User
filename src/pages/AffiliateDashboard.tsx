"use client";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  TableContainer,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GroupsIcon from "@mui/icons-material/Groups";
import RepeatIcon from "@mui/icons-material/Repeat";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

// Mini Stat Card
const StatCard = ({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color?: string;
}) => (
  <Card
    sx={{
      bgcolor: "rgba(255,255,255,0.07)",
      borderRadius: "20px",
      p: 2,
      textAlign: "center",
      color: "white",
      transition: "0.3s",
      boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
      "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
      },
    }}
  >
    <CardContent>
      <Box mb={1} fontSize={36}>
        {icon}
      </Box>
      <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
        {title}
      </Typography>
      <Typography
        variant="h6"
        fontWeight="bold"
        color={color || "primary.main"}
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const AffiliateDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tokenDevice = localStorage.getItem("loginInfo");
      if (tokenDevice) {
        const decodeToken = jwtDecode<any>(tokenDevice);
        const fetchAffiliateCode = async () => {
          try {
            const res = await fetch("/api/user/get-affiliate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ affiliateId: decodeToken?.profileId }),
            });

            const data = await res.json();
            if (data.success) {
              setStats(data.stats);
              setLoading(false);
            }
          } catch (err) {
            console.error("Error fetching affiliate code:", err);
          }
        };

        fetchAffiliateCode();
      }
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: "white",
        overflow: "hidden",
      }}
    >
      <Box textAlign="center" mb={5}>
        <Typography variant="subtitle1" sx={{ color: "gray", mt: 1 }}>
          Track your referrals, commissions, and earnings in real-time
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress color="primary" />
        </Box>
      ) : stats ? (
        <>
          {/* Stats Overview */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 3,
              mx: "auto",
              mb: 6,
            }}
          >
            <StatCard
              icon={<GroupsIcon fontSize="large" />}
              title="Total Referrals"
              value={stats.total_referrals}
              color="primary.main"
            />
            <StatCard
              icon={<RepeatIcon fontSize="large" />}
              title="Monthly Recurring"
              value={`$${parseFloat(stats.monthly_recurring).toFixed(2)}`}
              color="secondary.main"
            />
            <StatCard
              icon={<MonetizationOnIcon fontSize="large" />}
              title="Lifetime Earnings"
              value={`$${stats.total_commissions}`}
              color="success.main"
            />
          </Box>

          {/* Divider */}
          <Divider
            sx={{
              borderColor: "rgba(255,255,255,0.1)",
              mb: 4,
              mx: "auto",
            }}
          />

          {/* Referral History */}
          <Typography
            variant="h5"
            fontWeight="bold"
            mb={2}
            textAlign="center"
            color="white"
          >
            Referral History
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "16px",
              maxWidth: "1000px",
              mx: "auto",
              overflow: "auto",
            }}
          >
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow
                  sx={{
                    background: "linear-gradient(90deg,#FF2D55,#7000FF)",
                  }}
                >
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    #
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Commission
                  </TableCell>
                </TableRow>
              </TableHead>

              {/* Table Body */}
              <TableBody>
                {stats?.referral_details?.map((ref: any, index: number) => (
                  <TableRow
                    key={ref.id}
                    sx={{
                      "&:nth-of-type(odd)": {
                        bgcolor: "rgba(255,255,255,0.03)",
                      },
                      "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
                    }}
                  >
                    <TableCell sx={{ color: "white" }}>{index + 1}</TableCell>
                    <TableCell
                      sx={{ color: "white", textTransform: "capitalize" }}
                    >
                      {ref.referred_firstname || "N/A"}{" "}
                      {ref.referred_lastname || ""}
                    </TableCell>

                    <TableCell sx={{ color: "white" }}>
                      {new Date(ref.createdat).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>

                    {/* Status with badge */}
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          bgcolor:
                            ref.status.toLowerCase() === "active"
                              ? "rgba(0, 209, 121, 0.15)"
                              : "rgba(255, 76, 76, 0.15)",
                          color:
                            ref.status.toLowerCase() === "active"
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {ref.status}
                      </Box>
                    </TableCell>

                    {/* Commission */}
                    <TableCell
                      sx={{ color: "secondary.light", fontWeight: "bold" }}
                    >
                      ${ref.totalcommission}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography textAlign="center" mt={5} color="gray">
          No referral data found.
        </Typography>
      )}
    </Box>
  );
};

export default AffiliateDashboard;
