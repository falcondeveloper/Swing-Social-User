import { useEffect } from "react";

const useMessageListener = () => {
  useEffect(() => {
    window.addEventListener("message", (event) => {
        if (event.origin !== "http://localhost:3000/") {
            // Ignore messages from unknown origins
            return;
        }
    
        const { token } = event.data;
        console.log(token);
    
        if (token) {
            // Store the token in localStorage or use it for authentication
            localStorage.setItem("loginInfo", token);
    
            // Optionally, authenticate the user
            // authenticateUser(token);
        }
    });
  }, []);
};

export default useMessageListener;