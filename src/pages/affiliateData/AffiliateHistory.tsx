import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Divider,
  Stack,
  Button,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Download as DownloadIcon, Share2 as ShareIcon } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import * as htmlToImage from "html-to-image";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

type Referral = {
  id: string | number;
  name: string;
  genderAge: string;
  joined: string;
  status: string;
  acctType: string;
  totalPayments: string;
  avatar?: string;
  DateOfBirth?: string;
  PartnerDateOfBirth?: string;
  PartnerGender?: string;
  Gender?: string;
  AccountType?: string;
};

type ApiStats = {
  affiliate_code?: string | null;
  total_referrals?: number;
  mtd_referrals?: number;
  paid_subscribers?: number;
  free_subscribers?: number;
  total_earnings?: string | number;
  mtd_earnings?: string | number;
  mtd_percent?: string | number;
  total_percent?: string | number;
};

const formatEarningsFromApi = (val: string | number | undefined | null) => {
  if (val === undefined || val === null) return "$0.00";
  const s = typeof val === "string" ? val : String(val);
  const n = Number(s);
  if (isNaN(n)) return "$0.00";
  if (n > 1000) {
    return `$${(n / 100).toFixed(2)}`;
  } else {
    return `$${n.toFixed(2)}`;
  }
};

const AffiliateHistory: React.FC = () => {
  const qrRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [affiliateCode, setAffiliateCode] = useState<string>("");
  const [affiliateLink, setAffiliateLink] = useState<string>(
    `https://swingsocial.co?aff=${affiliateCode}`
  );
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("loginInfo");
      if (token) {
        const decodeToken = jwtDecode<any>(token);
        setProfileId(decodeToken?.profileId);
      } else {
        router.push("/login");
      }
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!profileId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const checkRes = await fetch("/api/user/affiliate-check-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId }),
        });

        if (!checkRes.ok) {
          const text = await checkRes.text();
          throw new Error(
            `affiliate-check-status failed: ${checkRes.status} ${text}`
          );
        }

        const checkData = await checkRes.json();
        if (!checkData?.success || !checkData?.referral) {
          throw new Error(checkData?.error || "No referral data returned");
        }

        if (!checkData.referral.has_referral) {
          setAffiliateCode(checkData?.referral?.affiliate_code || "");
          setStats(null);
          setReferrals([]);
          setAffiliateLink(
            `https://swingsocial.co?aff=${
              checkData?.referral?.affiliate_code || ""
            }`
          );
          setLoading(false);
          return;
        }

        const code = checkData.referral.affiliate_code;
        setAffiliateCode(code);
        setAffiliateLink(`https://swingsocial.co?aff=${code}`);

        const getRes = await fetch("/api/user/get-affiliate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ affiliateCode: code, limit: 300 }),
        });

        if (!getRes.ok) {
          const text = await getRes.text();
          throw new Error(`get-affiliate failed: ${getRes.status} ${text}`);
        }

        const getData = await getRes.json();
        if (!getData || !getData.success) {
          throw new Error(getData?.error || "Failed to fetch affiliate data");
        }

        const s: ApiStats = {
          affiliate_code: getData.stats?.affiliate_code ?? code,
          total_referrals: Number(getData.stats?.total_referrals ?? 0),
          mtd_referrals: Number(getData.stats?.mtd_referrals ?? 0),
          paid_subscribers: Number(getData.stats?.paid_subscribers ?? 0),
          free_subscribers: Number(getData.stats?.free_subscribers ?? 0),
          total_earnings: getData.stats?.total_earnings ?? 0,
          mtd_earnings: getData.stats?.mtd_earnings ?? 0,
          mtd_percent: getData.stats?.mtd_percent ?? 0,
          total_percent: getData.stats?.total_percent ?? 0,
        };
        setStats(s);

        if (
          Array.isArray(getData.stats?.recent_referrals) &&
          getData.stats.recent_referrals.length > 0
        ) {
          const mapped = getData.stats.recent_referrals.map(
            (r: any, idx: number) => ({
              id: r.referral_id ?? idx,
              name:
                r.referred_username ?? r.referred_email ?? `User ${idx + 1}`,
              genderAge: "",
              joined: r.created_at
                ? new Date(r.created_at).toLocaleString()
                : "",
              status: r.status ?? "",
              acctType: r.signup_fee
                ? Number(r.signup_fee) > 0
                  ? "PAID"
                  : "FREE"
                : "",
              totalPayments: r.total_commission_to_date
                ? formatEarningsFromApi(r.total_commission_to_date)
                : r.one_time_commission
                ? formatEarningsFromApi(r.one_time_commission)
                : "$0.00",
              avatar: r.avatar ?? "",
              DateOfBirth: r.DateOfBirth,
              PartnerDateOfBirth: r.PartnerDateOfBirth,
              PartnerGender: r.PartnerGender,
              Gender: r.Gender,
              AccountType: r.AccountType,
            })
          );
          setReferrals(mapped);
        } else {
          setReferrals([]);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Affiliate flow error:", err);
        toast.error(err?.message || "Failed to load affiliate data");
        setStats(null);
        setReferrals([]);
        setLoading(false);
      }
    };

    run();
  }, [profileId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const downloadQR = async () => {
    if (!qrRef.current) return;
    try {
      const dataUrl = await (htmlToImage as any).toPng(qrRef.current);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `affiliate-qr.png`;
      link.click();
      toast.success("QR downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };

  const totalReferrals = stats ? stats.total_referrals ?? 0 : 0;
  const mtdReferrals = stats ? stats.mtd_referrals ?? 0 : 0;
  const totalEarnings = stats
    ? formatEarningsFromApi(stats.total_earnings)
    : "$0.00";
  const mtdEarnings = stats
    ? formatEarningsFromApi(stats.mtd_earnings)
    : "$0.00";
  const paidCount = stats ? stats.paid_subscribers ?? 0 : 0;
  const freeCount = stats
    ? stats.free_subscribers ?? Math.max(0, totalReferrals - paidCount)
    : 0;

  return (
    <>
      <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="stretch">
        {/* Left: Snapshot cards */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: { xs: 1, sm: 2 },
              mb: { xs: 1, sm: 2 },
              bgcolor: "background.paper",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
            elevation={0}
          >
            <Typography
              variant="h6"
              sx={{ mb: 1, fontSize: { xs: "1rem", sm: "1.125rem" } }}
            >
              Snapshot!
            </Typography>

            <Grid container spacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12} sm={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    bgcolor: "transparent",
                    borderColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Stack spacing={1}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        Total referrals
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        {loading ? (
                          <CircularProgress size={16} />
                        ) : (
                          totalReferrals
                        )}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.04)" }} />
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        MTD referrals
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        {mtdReferrals}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.04)" }} />
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        Total earnings
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        {totalEarnings}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.04)" }} />
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        MTD earnings
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        {mtdEarnings}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    bgcolor: "transparent",
                    borderColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Stack spacing={1}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        Free
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        {freeCount}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.04)" }} />
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        Paid
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        {paidCount}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    bgcolor: "transparent",
                    borderColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: { xs: 12, sm: 13 } }}
                    >
                      Conversion
                    </Typography>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.04)" }} />
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        MTD
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        {stats ? `${stats.mtd_percent ?? 0}%` : "0.0%"}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.04)" }} />
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        Total
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: 12, sm: 13 } }}
                      >
                        {stats ? `${stats.total_percent ?? 0}%` : "0.0%"}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right: QR + actions */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: { xs: 1, sm: 2 },
              mb: { xs: 1, sm: 2 },
              display: "flex",
              flexDirection: "column",
              gap: 1,
              bgcolor: "background.paper",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
            elevation={0}
          >
            <Typography variant="body2" sx={{ mb: 0 }}>
              New members scan this QR Code to join with your referral code
            </Typography>

            <Box
              ref={qrRef}
              sx={{
                bgcolor: "background.default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: { xs: 1, sm: 2 },
                borderRadius: 1,
                my: 0,
              }}
            >
              <QRCode
                value={affiliateLink}
                size={
                  typeof window !== "undefined" && window.innerWidth < 480
                    ? 96
                    : 150
                }
              />
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1 }}
            >
              <Button
                variant="contained"
                startIcon={<DownloadIcon size={16} />}
                onClick={downloadQR}
                fullWidth
                sx={{ textTransform: "none" }}
                aria-label="Download QR"
              >
                Download
              </Button>

              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => copyToClipboard(affiliateLink)}
                fullWidth
                sx={{ textTransform: "none" }}
                aria-label="Copy Link"
              >
                Copy Link
              </Button>
            </Stack>

            <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.04)" }} />

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={() => copyToClipboard(affiliateLink)}
                startIcon={<ShareIcon size={14} />}
                sx={{ textTransform: "none" }}
                aria-label="Share link"
              >
                Share
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Referrals table wrapped in responsive container */}
      <TableContainer
        component={Paper}
        sx={{ mb: 8, mt: 2, p: { xs: 0, sm: 1 }, bgcolor: "background.paper" }}
      >
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                Member
              </TableCell>
              <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                Date Joined
              </TableCell>
              <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                Status
              </TableCell>
              <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                Acct Type
              </TableCell>
              <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                Total Payments
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {referrals.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ my: 2, fontSize: "20px" }}>No referrals found</Box>
                </TableCell>
              </TableRow>
            ) : (
              referrals.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 1, sm: 2 },
                      }}
                    >
                      <img
                        src={r.avatar || "/noavatar.png"}
                        alt={r.name || "User Avatar"}
                        width={60}
                        height={60}
                        style={{ borderRadius: "50%" }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/noavatar.png";
                        }}
                      />

                      <Box>
                        <Typography
                          fontWeight={700}
                          sx={{ fontSize: { xs: 13, sm: 15 } }}
                        >
                          {r.name}
                        </Typography>
                        {r?.AccountType && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: { xs: 11, sm: 12 },
                              color: "text.secondary",
                            }}
                          >
                            {r.AccountType}
                          </Typography>
                        )}{" "}
                        &nbsp;
                        <Typography
                          variant="caption"
                          sx={{ fontSize: { xs: 11, sm: 12 } }}
                        >
                          {r?.DateOfBirth
                            ? new Date().getFullYear() -
                              new Date(r.DateOfBirth).getFullYear()
                            : ""}
                          {r?.Gender === "Male"
                            ? "M"
                            : r?.Gender === "Female"
                            ? "F"
                            : ""}
                          {r?.PartnerDateOfBirth && r?.PartnerGender
                            ? ` | ${
                                new Date().getFullYear() -
                                new Date(r.PartnerDateOfBirth).getFullYear()
                              }${
                                r.PartnerGender === "Male"
                                  ? "M"
                                  : r.PartnerGender === "Female"
                                  ? "F"
                                  : ""
                              }`
                            : ""}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {r.joined}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    Completed
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {r.status === "paid" ? "PAID" : "FREE"}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: 12, sm: 13 } }}>
                    {r.totalPayments}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default AffiliateHistory;
