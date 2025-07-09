import { User } from "@/models";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Type for  clerk webhook event
interface ClerkEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    username?: string;
    image_url?: string;
  };
}

// Type for svix headers
interface SvixHeaders {
  "svix-id": string;
  "svix-timestamp": string;
  "svix-signature": string;
}

export async function POST(request: Request) {
  try {
    //STEP-1 ENVIRONMENT CHECK
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      throw new Error(
        "CLERK_WEBHOOK_SECRET doesn't exist in the env file please check"
      );
    }

    // STEP-2 Get and validate headers
    const headersList = await headers();

    const svixId = headersList.get("svix-id");
    const svixTimestamp = headersList.get("svix-timestamp");
    const svixSignature = headersList.get("svix-signature");

    // - check if the required headers exist or not
    if (!svixId || !svixSignature || !svixTimestamp) {
      return NextResponse.json(
        {
          error: "Missing Svix Auth headers ",
        },
        {
          status: 400,
        }
      );
    }

    // Create properly typed headers object
    const svixHeaders: SvixHeaders = {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp || "",
      "svix-signature": svixSignature,
    };

    //STEP-3 Verify webhook signature
    const payload = await request.json();
    const wh = new Webhook(WEBHOOK_SECRET);
    let event: ClerkEvent;

    try {
      event = wh.verify(JSON.stringify(payload), svixHeaders) as ClerkEvent;
    } catch (err) {
      console.error("Error while validating Webhook Signature", err);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    //Step-4 Handle the event
    const { id, email_addresses, username, image_url } = event.data;
    switch (event.type) {
      case "user.created":
      case "user.updated":
        await User.findOneAndUpdate(
          { clerkId: id },
          {
            clerkId: id,
            email: email_addresses[0]?.email_address,
            username:username,
            profileImage: image_url,
          },
          {
            //if doesnt exist then create
            upsert: true,
            new: true,
          }
        );
        break;

      case "user.deleted":
        await User.deleteOne({ clerkId: id });
        break;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Webhook Processed",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook Processing Error", error);
    return NextResponse.json(
      {
        error: "Internal Processing Error",
        details: error instanceof Error ? error.message : "Unknown Error",
      },
      { status: 500 }
    );
  }
}

