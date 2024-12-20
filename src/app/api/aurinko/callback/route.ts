import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import axios from "axios";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const status = params.get("status");

  if (status != "success")
    return NextResponse.json(
      { message: "Failed to link an Account" },
      { status: 400 },
    );

  const code = params.get("code");
  if (!code)
    return NextResponse.json({ message: "No Code found" }, { status: 401 });

  const token = await exchangeCodeForAccessToken(code);
  if (!token)
    return NextResponse.json(
      { message: "Failed to exchange code for access token" },
      { status: 401 },
    );

  const accountDetails = await getAccountDetails(token.accessToken);

  await db.account.upsert({
    where: { id: token.accountId.toString() },
    update: { accessToken: token.accessToken },
    create: {
      id: token.accountId.toString(),
      userId,
      emailAddress: accountDetails.email,
      name: accountDetails.name,
      accessToken: token.accessToken,
    },
  });

  // trigger the initial sync method
  waitUntil(
    axios
      .post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
        accoutnId: token.accountId.toString(),
        userId,
      })
      .then((response) => {
        console.log("Initial sync done : ", response.data);
      })
      .catch((error) => {
        console.log("something went wrong in initial sync", error);
      }),
  );

  return NextResponse.redirect(new URL("/mail", req.url));
};
