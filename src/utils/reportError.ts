
export async function sendErrorEmail({
    errorMessage,
    stack,
    routeName,
    userId,
}: {
    errorMessage: string;
    stack?: string;
    routeName?: string;
    userId?: string | number;
}) {
    try {
        await fetch("/api/user/report-error", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ errorMessage, stack, routeName, userId }),
        });
    } catch (err) {
        console.error("Failed to send error email:", err);
    }
}
