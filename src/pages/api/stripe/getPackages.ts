import { NextApiRequest, NextApiResponse } from "next";
import { CreditPackage } from "@/app/models/creditPackage";
import { getServerSession } from "next-auth/next";
import authOptions from "../auth/[...nextauth]";
import { mongooseConnect } from "@/utils/mongooseConnect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // const session = await getServerSession(req, res, authOptions);
  // console.log(session);
  // if (session) {
    if (req.method !== "GET") {
      return res.status(405).json({ msg: "Method not allowed" });
    }

    try {
      await mongooseConnect();
      const packages = await CreditPackage.find({});
      return res.status(200).json(packages);
    } catch (error: any) {
      console.error("An error occurred:", error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  // }
}
