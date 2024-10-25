"use server";

import { auth } from "@clerk/nextjs/server";
import axios, { isAxiosError } from "axios";

// GET the aurinko URL
export const getAuriknoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  const { userId }: { userId: string | null } = await auth();
  if (!userId) return null;

  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID as string,
    serviceType,
    scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
    responseType: "code",
    returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

// GET the access token in exchange of code
export const exchangeCodeForAccessToken = async (code: string) => {
  try {
    const url = `https://api.aurinko.io/v1/auth/token/${code}`;
    const response = await axios.post(
      url,
      {},
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID as string,
          password: process.env.AURINKO_CLIENT_SECRATE as string,
        },
      },
    );
    return response.data as {
      accountId: number;
      accessToken: "string";
      userId: "string";
      userSession: "string";
    };
  } catch (error) {
    console.error({ error });
    throw error;
  }
};

// GET account details
export const getAccountDetails = async (token: string) => {
  try {
    const url = `https://api.aurinko.io/v1/account`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data as { email: string; name: string };
  } catch (error) {
    console.error({ error });
    throw error;
  }
};
