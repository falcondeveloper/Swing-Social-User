"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { 
    Box, 
    Container, 
    TextField, 
    Button, 
    Typography, 
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { Password } from '@mui/icons-material';

interface ValidationState {
    error: boolean;
    message: string;
}

const ResetPasswordContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validation, setValidation] = useState<ValidationState>({
        error: false,
        message: ''
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const validatePassword = (password: string): ValidationState => {
        // if (password.length < 8) {
        //     return {
        //         error: true,
        //         message: 'Password must be at least 8 characters long'
        //     };
        // }
        // if (!/[A-Z]/.test(password)) {
        //     return {
        //         error: true,
        //         message: 'Password must contain at least one uppercase letter'
        //     };
        // }
        // if (!/[a-z]/.test(password)) {
        //     return {
        //         error: true,
        //         message: 'Password must contain at least one lowercase letter'
        //     };
        // }
        // if (!/[0-9]/.test(password)) {
        //     return {
        //         error: true,
        //         message: 'Password must contain at least one number'
        //     };
        // }
        return {
            error: false,
            message: ''
        };
    };

    const handleSubmit = async () => {
        // Validate passwords match
        if (password !== confirmPassword) {
            setValidation({
                error: true,
                message: 'Passwords do not match'
            });
            return;
        }

        // Validate password requirements
        const passwordValidation = validatePassword(password);
        if (passwordValidation.error) {
            setValidation(passwordValidation);
            return;
        }

        try {
            const response = await fetch('/api/user/resetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: email,
                    pwd: password
                })
            });

            const data = await response.json();
            
            setDialogMessage(data.message);
            setDialogOpen(true);

            if (response.ok) {
                // Redirect to login after dialog is closed
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (error) {
            setDialogMessage('An error occurred while resetting your password.');
            setDialogOpen(true);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        background: 'white',
                        borderRadius: 2
                    }}
                >
                    <Password sx={{ fontSize: 48, color: '#FF2D55', mb: 2 }} />
                    <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                        Reset Your Password
                    </Typography>
                    <TextField
                        fullWidth
                        label="Email"
                        value={email}
                        disabled
                        sx={{ 
                            mb: 2,
                            '& .MuiInputLabel-root': {
                                color: 'black !important',
                            },
                            '& .MuiOutlinedInput-root': {
                                color: 'black',
                            },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={validation.error}
                        helperText={validation.error ? validation.message : ''}
                        sx={{ 
                            mb: 2,
                            '& .MuiInputLabel-root': {
                                color: 'black !important',
                            },
                            '& .MuiOutlinedInput-root': {
                                color: 'black',
                            },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        sx={{ 
                            mb: 3,
                            '& .MuiInputLabel-root': {
                                color: 'black !important',
                            },
                            '& .MuiOutlinedInput-root': {
                                color: 'black',
                            },
                        }}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            background: 'linear-gradient(45deg, #FF2D55, #7000FF)',
                            py: 1.5,
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #FF2D55, #7000FF)',
                                opacity: 0.9
                            }
                        }}
                    >
                        Reset Password
                    </Button>
                </Paper>
            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Password Reset</DialogTitle>
                <DialogContent>
                    <Typography>{dialogMessage}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

const ResetPasswordPage = () => {
    return (
        <Suspense fallback={
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
};

export default ResetPasswordPage;



