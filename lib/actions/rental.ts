const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getOwnerRentals = async (email: string) => {
  const response = await fetch(
    `${API}/owner/rentals?email=${encodeURIComponent(email)}`,
  
  );

  const data = await response.json();

  console.log("Owner Rentals:", data);

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch rentals");
  }

  return data;
};