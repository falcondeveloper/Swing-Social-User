import { useEffect } from "react";

export const useGeolocationWithAPI = (profileId?: string) => {
  useEffect(() => {
    if (!profileId) return;

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            const locationName = await getLocationName(latitude, longitude);
            await sendLocationToAPI(locationName, latitude, longitude);
          },
          (error) => {
            console.error("Geolocation error:", error);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    const getLocationName = async (latitude: number, longitude: number) => {
      const apiKey = "AIzaSyBEr0k_aQ_Sns6YbIQ4UBxCUTdPV9AhdF0";

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
        );

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const data = await response.json();
        if (data.status === "OK" && data.results.length > 0) {
          return data.results[0].formatted_address;
        }
        return "Unknown Location";
      } catch (error) {
        console.error("Error fetching location name:", error);
        return "Unknown Location";
      }
    };

    const sendLocationToAPI = async (
      locationName: string,
      latitude: number,
      longitude: number
    ) => {
      try {
        const response = await fetch("/api/user/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId,
            locationName,
            latitude,
            longitude,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("Error sending location:", data.message);
        }
      } catch (error) {
        console.error("Error sending location to API:", error);
      }
    };

    getCurrentLocation();
  }, [profileId]);
};
