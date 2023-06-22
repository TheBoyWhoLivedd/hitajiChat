import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";

interface Option {
  type: string;
  cost: number;
}

const data: Option[] = [
  { type: "Silver", cost: 10 },
  { type: "Gold", cost: 50 },
  { type: "Platinum", cost: 100 },
];

const CheckoutButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

interface BillingCardProps {
  type: string;
  cost: number;
}

const BillingCard: React.FC<BillingCardProps> = ({ type, cost }) => {
  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/stripe/purchasePackage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageName: type }),
      });
      if (!response.ok) {
        throw new Error("Checkout failed");
      }
      const session = await response.json()
      if (session) {
        window.location.href = session.url
      }
      // Here you might want to do something with the response
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="div">
            {type}
          </Typography>
          <Typography variant="body2">${cost}</Typography>
          <CheckoutButton
            variant="contained"
            color="primary"
            onClick={handleCheckout}
          >
            Checkout
          </CheckoutButton>
        </CardContent>
      </Card>
    </Grid>
  );
};

const BillingOptions: React.FC = () => (
  <Box p={2}>
    <Grid container spacing={2}>
      {data.map((option) => (
        <BillingCard key={option.type} {...option} />
      ))}
    </Grid>
  </Box>
);

export default BillingOptions;
