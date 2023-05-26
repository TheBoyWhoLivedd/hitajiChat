import { getServerSession } from "next-auth/next"
import authOptions from "./auth/[...nextauth]"
import { NextApiResponse } from "next"
import { NextApiRequest } from "next/types"


export default async function handler (
    req: NextApiRequest,
  res: NextApiResponse
){
  const session = await getServerSession(req, res, authOptions)
  if (session) {
    // Signed in
    console.log("Session", JSON.stringify(session, null, 2))
    res.status(200).json({message:'success',session})
  } else {
    // Not Signed in
    res.status(401)
  }
  res.end()
}