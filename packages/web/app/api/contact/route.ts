import { NextRequest, NextResponse } from "next/server";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  website?: string; // honeypot
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    const { name, email, message, website } = body;

    // Check honeypot field - if filled, it's likely a bot
    if (website) {
      // Silently accept but don't process (to not alert bots)
      return NextResponse.json({ success: true });
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

    // In production, send email via Resend
    // For now, log the message (would be replaced with actual email sending)
    console.log("Contact form submission:", {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
    });

    // If RESEND_API_KEY is set, send email
    if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "Time Tracker <onboarding@resend.dev>",
          to: process.env.CONTACT_EMAIL,
          subject: `Contact Form: ${name.trim()}`,
          text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`,
          replyTo: email.trim(),
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't fail the request if email fails - we logged it
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    );
  }
}
