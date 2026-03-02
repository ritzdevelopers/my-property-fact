// Utility function to set user data in cookies for testing
import Cookies from 'js-cookie';

export const setDemoUserData = () => {
  const demoUserData = {
    fullName: "John Agent",
    email: "john.agent@example.com",
    phone: "+91 98765 43210",
    role: "Real Estate Agent",
    experience: "5 years",
    location: "Gurgaon, Haryana",
    bio: "Experienced real estate agent specializing in residential properties in Gurgaon. Committed to helping clients find their dream homes.",
    avatar: "/logo.webp",
    verified: true,
    rating: 4.8,
    totalDeals: 127,
    joinDate: "2019-03-15"
  };

  try {
    Cookies.set("userData", JSON.stringify(demoUserData), { expires: 7 });
    return true;
  } catch (error) {
    console.error("Error setting demo user data:", error);
    return false;
  }
};

export const clearUserData = () => {
  try {
    Cookies.remove("userData");
    return true;
  } catch (error) {
    console.error("Error clearing user data:", error);
    return false;
  }
};


