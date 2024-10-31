// call back from initial sync now I have to store the data some how

import { Account } from "@/lib/account";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { accountId, userId } = await req.json();
  if (!accountId || !userId) {
    return NextResponse.json({
      message: "Missing accountId or userId",
      status: 400,
    });
  }

  const dbAccount = await db.account.findUnique({
    where: {
      id: accountId,
      userId,
    },
  });
  if (!dbAccount)
    return NextResponse.json({ message: "No Account found", status: 404 });

  const account = new Account(dbAccount.accessToken);
  //   const emails = await performInitialSync();
  //   await syncEmailsToDatabase(emails);
};
