import React from "react";
import { Button, Container, Stack, Typography, useTheme } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Image from "next/image";
// import GoogleButton from "react-google-button";
// import GoogleButton2 from "@/app/components/googleButton/GoogleButton";
import useResponsive from "@/utils/hooks/useResponsive";
import axios from "axios";
import { start } from "repl";

export default function Component() {
  const theme = useTheme();
  const isMobile = useResponsive("down", "sm");

  return (
    <>
      <Container sx={{ mt: 5 }} maxWidth="sm">
        <Stack spacing={2}>
          <Stack alignItems={"center"} mb={5}>
            <Image
              src="/hitajiLogo.svg"
              alt="hitaji logo"
              width={120}
              height={120}
            />
          </Stack>
          <Stack
            sx={{ width: "100%" }}
            direction="column"
            alignItems={"center"}
            justifyContent={"center"}
            // height={"90vh"}
            spacing={2}
          >
            <Typography variant="h4">
              Welcome to Hitaji Ai Assistant{" "}
            </Typography>
            <Button
              variant="outlined"
              sx={{ p: 2, width: isMobile ? "100%" : "60%" }}
              onClick={(e) => {
                e.preventDefault();
                signIn("google", { callbackUrl: "/dashboard" });
              }}
            >
              <Image
                src="/google.svg"
                alt="hitaji logo"
                width={20}
                height={20}
                style={{ marginRight: "1rem" }}
              />
              <Typography
                variant="h6"
                color={theme.palette.grey[700]}
                sx={{ fontWeight: "500" }}
              >
                Continue with Google
              </Typography>
            </Button>
            {/* <Button
              variant="outlined"
              sx={{ p: 2, width: isMobile ? "100%" : "60%" }}
              onClick={(e) => {
                e.preventDefault();
                signIn("apple", { callbackUrl: "/dashboard" });
              }}
            >
              <Image
                src="/apple.svg"
                alt="apple logo"
                width={20}
                height={20}
                style={{ marginRight: "1rem" }}
              />
              <Typography
                variant="h6"
                color={theme.palette.grey[700]}
                sx={{ fontWeight: "500" }}
              >
                Continue with Apple ID
              </Typography>
            </Button> */}
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

//kickstarting server hosted on shared hosting so uploading a document doesnt take time
async function startServer() {
  let response = await axios.get(`https://www.upload.hitajitech.site`);
  // console.log(response);
}
startServer();

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

  // console.log("session", session);

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
