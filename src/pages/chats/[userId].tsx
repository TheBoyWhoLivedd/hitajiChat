import axios from 'axios'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router';
import React from 'react'

const Chats = () => {
  const router = useRouter();
  
  const handleNewChat = async () => {
    const { userId } = router.query;
    console.log("🚀 ~ file: chats.tsx:9 ~ Chats ~ userId:", userId)
    try {
      const response = await axios.post(`/api/chats/${userId}`, {
        // data to be sent in the request body, if any
      },
      );
      console.log(response.data); // logs the response data
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <div>
        chats <br />
        <button onClick={handleNewChat}>new chat</button><br />
        <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}

export default Chats