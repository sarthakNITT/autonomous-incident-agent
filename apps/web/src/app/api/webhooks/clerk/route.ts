import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      await prisma.user.create({
        data: {
          id: id,
          email: email_addresses[0]?.email_address || "",
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
          lastSignInAt: new Date(),
        },
      });

      console.log(`✅ User created in database: ${id}`);
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error creating user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      await prisma.user.update({
        where: { id: id },
        data: {
          email: email_addresses[0]?.email_address || "",
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        },
      });

      console.log(`✅ User updated in database: ${id}`);
    } catch (error) {
      console.error("Error updating user:", error);
      try {
        await prisma.user.create({
          data: {
            id: id,
            email: email_addresses[0]?.email_address || "",
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
            lastSignInAt: new Date(),
          },
        });
        console.log(`✅ User created in database (from update): ${id}`);
      } catch (createError) {
        console.error("Error creating user from update:", createError);
        return new Response("Error syncing user", { status: 500 });
      }
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      await prisma.user.delete({
        where: { id: id as string },
      });

      console.log(`✅ User deleted from database: ${id}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      return new Response("Error deleting user", { status: 500 });
    }
  }

  if (eventType === "session.created") {
    const { user_id } = evt.data;

    try {
      await prisma.user.update({
        where: { id: user_id },
        data: {
          lastSignInAt: new Date(),
        },
      });

      console.log(`✅ User sign-in tracked: ${user_id}`);
    } catch (error) {
      console.error("Error tracking sign-in:", error);
    }
  }

  return new Response("", { status: 200 });
}
