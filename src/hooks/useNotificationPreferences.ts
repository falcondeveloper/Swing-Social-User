"use client";

import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/notificationService';

export const useNotificationPreferences = () => {
    const [preferences, setPreferences] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPreferences = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const userId = localStorage.getItem('logged_in_profile') || '1';
            notificationService.setUserId(userId);

            await notificationService.loadPreferences();
            const prefs = notificationService.getPreferences();
            setPreferences(prefs);
        } catch (err) {
            console.error('Failed to load notification preferences:', err);
            setError('Failed to load notification preferences');
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePreferences = useCallback(async (newPreferences: any) => {
        try {
            const success = await notificationService.savePreferences(newPreferences);
            if (success) {
                setPreferences(newPreferences);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to update notification preferences:', err);
            return false;
        }
    }, []);

    const canSendNotification = useCallback((type: string): boolean => {
        if (!preferences) return false;
        return notificationService.isEnabled(type as any);
    }, [preferences]);

    useEffect(() => {
        loadPreferences();
    }, [loadPreferences]);

    return {
        preferences,
        loading,
        error,
        loadPreferences,
        updatePreferences,
        canSendNotification,
        isEnabled: notificationService.isEnabled,
        sendNotification: notificationService.sendNotification,
        showLocalNotification: notificationService.showLocalNotification,
    };
};