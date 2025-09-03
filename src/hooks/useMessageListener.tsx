import { useEffect } from "react";

const useMessageListener = () => {
  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.origin !== "http://localhost:3000/") {
        return;
      }

      const { token } = event.data;
      console.log(token);

      if (token) {
        localStorage.setItem("loginInfo", token);
      }
    });
  }, []);
};

export default useMessageListener;
