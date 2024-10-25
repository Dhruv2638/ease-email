// I have to get the request and craete the user in our database

import { db } from "@/server/db";

export const POST = async (req: Request) => {
  const { data } = await req.json();

  console.log("clerk webhook received", data);
  const emailAddress = data.email_addresses[0].email_address;
  const firstName = data.first_name;
  const lastName = data.last_name;
  const imageUrl = data.image_url;
  const id = data.id;

  await db.user.create({
    data: {
      emailAddress,
      firstName,
      lastName,
      imageUrl,
      id,
    },
  });

  return new Response("Webhook received", { status: 200 });
};
