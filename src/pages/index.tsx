import React from "react";
import { Button, Container, Stack, Typography, useTheme } from "@mui/material";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Image from "next/image";
// import GoogleButton from "react-google-button";
// import GoogleButton2 from "@/app/components/googleButton/GoogleButton";
import useResponsive from "@/utils/hooks/useResponsive";

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
              onClick={() => signIn("google")}
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
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);

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
