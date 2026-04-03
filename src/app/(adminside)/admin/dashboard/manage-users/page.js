import axios from "axios";
import ManageUsers from "./manageUsers";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const fetchAllUsers = async () => {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}users`,
      {
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
        validateStatus: () => true,
      },
    );

    if (response.status !== 200) {
      return [];
    }
    return response.data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export default async function ManageUsersPage() {
  const users = await fetchAllUsers();
  
  return <ManageUsers users={users} />;
}

