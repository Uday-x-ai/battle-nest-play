import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send OTP function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "send";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === "send") {
      const { email }: SendOTPRequest = await req.json();
      console.log("Sending OTP to:", email);

      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Generate OTP and expiry (10 minutes)
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Delete any existing OTPs for this email
      await supabase.from("email_otps").delete().eq("email", email);

      // Store OTP in database
      const { error: insertError } = await supabase.from("email_otps").insert({
        email,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

      if (insertError) {
        console.error("Error storing OTP:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to generate OTP" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Send email via SMTP
      const smtpHost = Deno.env.get("SMTP_HOST")!;
      const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
      const smtpUser = Deno.env.get("SMTP_USER")!;
      const smtpPass = Deno.env.get("SMTP_PASS")!;
      const fromEmail = Deno.env.get("SMTP_FROM_EMAIL")!;

      console.log("Connecting to SMTP server:", smtpHost, "port:", smtpPort);

      const client = new SMTPClient({
        connection: {
          hostname: smtpHost,
          port: smtpPort,
          tls: smtpPort === 465,
          auth: {
            username: smtpUser,
            password: smtpPass,
          },
        },
      });

      try {
        await client.send({
          from: fromEmail,
          to: email,
          subject: "Your FF Arena Verification Code",
          content: "auto",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 40px 20px; }
                .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid #ff6b35; }
                .logo { text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 30px; }
                .logo .ff { background: linear-gradient(135deg, #ff6b35, #f7931e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                .title { text-align: center; font-size: 24px; margin-bottom: 20px; color: #ffffff; }
                .otp-box { background: linear-gradient(135deg, #ff6b35, #f7931e); border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0; }
                .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ffffff; }
                .message { text-align: center; color: #a0a0a0; font-size: 14px; line-height: 1.6; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo"><span class="ff">FF</span>Arena</div>
                <div class="title">Email Verification</div>
                <p class="message">Use the following verification code to complete your registration:</p>
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                <p class="message">This code will expire in 10 minutes.<br>If you didn't request this code, please ignore this email.</p>
                <div class="footer">© 2024 FF Arena. All rights reserved.</div>
              </div>
            </body>
            </html>
          `,
        });

        await client.close();
        console.log("OTP email sent successfully to:", email);

        return new Response(
          JSON.stringify({ success: true, message: "OTP sent successfully" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        await client.close();
        return new Response(
          JSON.stringify({ error: "Failed to send OTP email" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else if (action === "verify") {
      const { email, otp }: VerifyOTPRequest = await req.json();
      console.log("Verifying OTP for:", email);

      if (!email || !otp) {
        return new Response(
          JSON.stringify({ error: "Email and OTP are required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Find the OTP record
      const { data: otpRecord, error: fetchError } = await supabase
        .from("email_otps")
        .select("*")
        .eq("email", email)
        .eq("otp_code", otp)
        .eq("verified", false)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching OTP:", fetchError);
        return new Response(
          JSON.stringify({ error: "Failed to verify OTP" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!otpRecord) {
        console.log("Invalid or expired OTP for:", email);
        return new Response(
          JSON.stringify({ error: "Invalid or expired OTP" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Mark OTP as verified
      await supabase
        .from("email_otps")
        .update({ verified: true })
        .eq("id", otpRecord.id);

      console.log("OTP verified successfully for:", email);

      return new Response(
        JSON.stringify({ success: true, message: "OTP verified successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);