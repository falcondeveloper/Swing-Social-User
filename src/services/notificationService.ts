import { notify } from '@/lib/notifications';

type NotificationType = 'new_match' | 'message' | 'like' | 'request' | 'friend_request' | 'general';

export interface NotificationSettings {
    pushNotifications: boolean;
    newMatches: boolean;
    messages: boolean;
    likes: boolean;
    requests: boolean;
    friendRequests: boolean;
}

interface NotificationData {
    url?: string;
    [key: string]: any;
}

class NotificationService {
    private static instance: NotificationService;
    private preferences: NotificationSettings = this.getDefaultPreferences();
    private userId: string | null = null;

    private constructor() { }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    setUserId(userId: string): void {
        this.userId = userId;
    }

    async loadPreferences(): Promise<void> {
        if (!this.userId) {
            console.warn('User ID not set, cannot load preferences');
            return;
        }

        try {
            const response = await fetch(`/api/user/notification/preferences?userId=${this.userId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.error) {
                    console.warn('Error loading preferences:', data.error);
                    this.preferences = this.getDefaultPreferences();
                } else {
                    this.preferences = {
                        pushNotifications: data.pushNotifications !== false,
                        newMatches: data.newMatches !== false,
                        messages: data.messages !== false,
                        likes: data.likes !== false,
                        requests: data.requests || false,
                        friendRequests: data.friendRequests !== false,
                    };
                }
            } else {
                this.preferences = this.getDefaultPreferences();
            }
        } catch (error) {
            console.error('Failed to load notification preferences:', error);
            this.preferences = this.getDefaultPreferences();
        }
    }

    async savePreferences(preferences: NotificationSettings): Promise<boolean> {
        if (!this.userId) {
            console.warn('User ID not set, cannot save preferences');
            return false;
        }

        try {
            const response = await fetch('/api/user/notification/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId,
                    ...preferences
                }),
            });

            const result = await response.json();
            if (result.success) {
                this.preferences = preferences;
                // this.showLocalNotification('Success', 'Notification preferences saved', 'success');
                return true;
            } else {
                this.showLocalNotification('Error', result.error || 'Failed to save preferences', 'error');
                return false;
            }
        } catch (error) {
            console.error('Failed to save notification preferences:', error);
            this.showLocalNotification('Error', 'Failed to save preferences', 'error');
            return false;
        }
    }


    getPreferences(): NotificationSettings {
        return { ...this.preferences };
    }

    getDefaultPreferences(): NotificationSettings {
        return {
            pushNotifications: true,
            newMatches: true,
            messages: true,
            likes: true,
            requests: false,
            friendRequests: true,
        };
    }

    isEnabled(type: NotificationType): boolean {
        // Always allow general notifications
        if (type === 'general') return true;

        // Check if push notifications are enabled globally
        if (!this.preferences.pushNotifications) return false;

        // Check specific notification type
        switch (type) {
            case 'new_match':
                return this.preferences.newMatches !== false;
            case 'message':
                return this.preferences.messages !== false;
            case 'like':
                return this.preferences.likes !== false;
            case 'request':
                return this.preferences.requests || false;
            case 'friend_request':
                return this.preferences.friendRequests !== false;
            default:
                return true;
        }
    }

    async sendNotification(
        title: string,
        body: string,
        type: NotificationType = 'general',
        data: NotificationData = {}
    ): Promise<boolean> {
        if (!this.userId) {
            console.warn('Cannot send notification: User ID not set');
            return false;
        }

        try {
            const response = await fetch('/api/user/notification/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userId,
                    title,
                    body,
                    type,
                    data
                }),
            });

            const result = await response.json();

            if (result.success) {
                console.log(`Notification sent successfully: ${title}`);
                return true;
            } else {
                console.log(`Notification not sent: ${result.message}`);
                return false;
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
            return false;
        }
    }

    // Convenience methods for specific notification types
    async sendNewMatch(matchName: string, matchId: string): Promise<boolean> {
        return this.sendNotification(
            'New Match! 🎉',
            `You matched with ${matchName}`,
            'new_match',
            {
                url: `/matches/${matchId}`,
                matchId,
                matchName,
                click_action: 'OPEN_MATCHES'
            }
        );
    }

    async sendNewMessage(senderName: string, preview: string, messageId: string): Promise<boolean> {
        return this.sendNotification(
            `New message from ${senderName}`,
            preview,
            'message',
            {
                url: `/messages/${messageId}`,
                messageId,
                senderName,
                click_action: 'OPEN_MESSAGES'
            }
        );
    }

    async sendLike(likerName: string, profileId: string): Promise<boolean> {
        return this.sendNotification(
            'New Like ❤️',
            `${likerName} liked your profile`,
            'like',
            {
                url: `/profile/${profileId}`,
                profileId,
                likerName,
                click_action: 'OPEN_PROFILE'
            }
        );
    }

    async sendFriendRequest(requesterName: string, requestId: string): Promise<boolean> {
        return this.sendNotification(
            'Friend Request 👥',
            `${requesterName} sent you a friend request`,
            'friend_request',
            {
                url: `/friends/requests/${requestId}`,
                requestId,
                requesterName,
                click_action: 'OPEN_FRIEND_REQUESTS'
            }
        );
    }

    async sendRequest(requestType: string, requesterName: string, requestId: string): Promise<boolean> {
        return this.sendNotification(
            `New ${requestType} Request`,
            `${requesterName} sent you a ${requestType} request`,
            'request',
            {
                url: `/requests/${requestId}`,
                requestId,
                requesterName,
                requestType,
                click_action: 'OPEN_REQUESTS'
            }
        );
    }

    // Show local notification (in-app toast)
    showLocalNotification(
        title: string,
        message: string,
        type: 'success' | 'error' | 'warning' | 'info' = 'info'
    ): void {
        switch (type) {
            case 'success':
                notify.success(message);
                break;
            case 'error':
                notify.error(message);
                break;
            case 'warning':
                notify.warning(message);
                break;
            case 'info':
                notify.info(message);
                break;
        }
    }

    // Test notification
    async sendTestNotification(): Promise<boolean> {
        return this.sendNotification(
            'Test Notification ✅',
            'Your notification preferences are working correctly!',
            'general',
            {
                url: '/notifications',
                isTest: true,
                click_action: 'OPEN_NOTIFICATIONS'
            }
        );
    }
}

export const notificationService = NotificationService.getInstance();