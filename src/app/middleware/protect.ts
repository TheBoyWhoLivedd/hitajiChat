//@ts-nocheck
import { NextApiRequest, NextApiResponse } from "next";
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../api/models/user";
import { IUser } from "../../../types";

interface DecodedToken {
  userId: string;
  iat: number;
}

declare module "next" {
  interface NextApiRequest {
    user?: IUser;
  }
}

export const protect = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    // 1) Getting token and check if it's there
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return res.status(401).json({
        message: "You are not logged in! Please log in to get access.",
      });
    }
    // 2) Verification of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const this_user = await User.findById(decoded.userId);
    if (!this_user) {
      return res.status(401).json({
        message: "The user belonging to this token no longer exists.",
      });
    }
    // 4) Check if user changed password after the token was issued
    if (this_user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        message: "User recently changed password! Please log in again.",
      });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = this_user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};
