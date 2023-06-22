import clientPromise from "@/utils/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/app/models/user";
// import AppleProvider from 'next-auth/providers/apple'
// import FacebookProvider from 'next-auth/providers/facebook'
// import EmailProvider from 'next-auth/providers/email'

export default NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    // OAuth authentication providers...
    // AppleProvider({
    //   clientId: process.env.APPLE_ID as string,
    //   clientSecret: process.env.APPLE_SECRET as string
    // }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_ID as string,
    //   clientSecret: process.env.FACEBOOK_SECRET as string
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    // Passwordless / email sign in
    // EmailProvider({
    //   server: process.env.MAIL_SERVER as string,
    //   from: 'NextAuth.js <no-reply@example.com>'
    // }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ token, session }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          name: token.name,
          email: token.email,
          image: token.picture,
        },
      };
    },

    async jwt({ token, user }) {
      // Run only for new users, when user and account objects are available
      if (user) {
        const userFromDb = await User.findOne({ email: user.email });
        console.log(userFromDb);
        if (userFromDb) {
          token.id = userFromDb._id.toString(); // convert ObjectId to string
          return {
            id: userFromDb._id.toString(),
            name: userFromDb.name,
            email: userFromDb.email,
            picture: userFromDb.image,
          };
        }
      }

      // If user is not defined, just pass on the token
      return token;
    },
  },
});
