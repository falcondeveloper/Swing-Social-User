export const sendNotification = async (notificationData: {
    userId: string;
    title: string;
    body: string;
    type: string;
    url?: string;
}) => {
    try {
        const response = await fetch("/api/user/notification/requestfriend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...notificationData,
                icon: "/logo.svg", // Ensure icon is included
            }),
        });

        return await response.json();
    } catch (error) {
        console.error("Error sending notification:", error);
        return { success: false, error };
    }
};
