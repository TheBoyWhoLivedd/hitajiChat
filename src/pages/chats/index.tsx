import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { UserObject } from "../../../types";
import Image from "next/image";

const Chats = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserObject | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.post("/api/user", {
          email: session?.user?.email,
        });
        console.log(
          "🚀 ~ file: index.tsx:17 ~ fetchUser ~ response:",
          response.data
        );

        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else if (session) {
      fetchUser();
    }
  }, [session]);

  return (
    <div>
      Chats of {user ? user.name : null} <br />
      {user && (
        <Image src={user.image} alt={user.name} width={100} height={100} />
      )}
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
};

export default Chats;
