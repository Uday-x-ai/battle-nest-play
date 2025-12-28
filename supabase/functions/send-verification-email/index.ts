import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendVerificationRequest {
  email: string;
  redirectTo?: string;
}

// Generate a secure token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send verification email function called");

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
      const { email, redirectTo }: SendVerificationRequest = await req.json();
      console.log("Sending verification email to:", email);

      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Generate token and expiry (24 hours)
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Delete any existing verification tokens for this email
      await supabase.from("email_verifications").delete().eq("email", email);

      // Store verification token in database
      const { error: insertError } = await supabase.from("email_verifications").insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

      if (insertError) {
        console.error("Error storing verification token:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to generate verification link" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Build verification URL
      const baseUrl = redirectTo || "https://htxuhscatooeuebkiisb.lovableproject.com";
      const verificationUrl = `${baseUrl}/auth?action=verify&token=${token}&email=${encodeURIComponent(email)}`;

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
          subject: "Verify Your FF Arena Account",
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
                .logo .arena { color: #ffffff; }
                .title { text-align: center; font-size: 24px; margin-bottom: 20px; color: #ffffff; }
                .button-container { text-align: center; margin: 30px 0; }
                .verify-button { display: inline-block; background: linear-gradient(135deg, #ff6b35, #f7931e); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold; }
                .message { text-align: center; color: #a0a0a0; font-size: 14px; line-height: 1.6; }
                .link-text { word-break: break-all; color: #ff6b35; font-size: 12px; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo"><span class="ff">FF</span><span class="arena">Arena</span></div>
                <div class="title">Verify Your Email</div>
                <p class="message">Welcome to FF Arena! Click the button below to verify your email address and activate your account:</p>
                <div class="button-container">
                  <a href="${verificationUrl}" class="verify-button">Verify Email</a>
                </div>
                <p class="message">Or copy and paste this link in your browser:</p>
                <p class="link-text">${verificationUrl}</p>
                <p class="message">This link will expire in 24 hours.<br>If you didn't create an account, please ignore this email.</p>
                <div class="footer">© 2024 FF Arena. All rights reserved.</div>
              </div>
            </body>
            </html>
          `,
        });

        await client.close();
        console.log("Verification email sent successfully to:", email);

        return new Response(
          JSON.stringify({ success: true, message: "Verification email sent" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        await client.close();
        return new Response(
          JSON.stringify({ error: "Failed to send verification email" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else if (action === "verify") {
      const { token, email } = await req.json();
      console.log("Verifying token for:", email);

      if (!token || !email) {
        return new Response(
          JSON.stringify({ error: "Token and email are required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Find the verification record
      const { data: verificationRecord, error: fetchError } = await supabase
        .from("email_verifications")
        .select("*")
        .eq("email", email)
        .eq("token", token)
        .eq("verified", false)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching verification:", fetchError);
        return new Response(
          JSON.stringify({ error: "Failed to verify email" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!verificationRecord) {
        console.log("Invalid or expired token for:", email);
        return new Response(
          JSON.stringify({ error: "Invalid or expired verification link" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Mark as verified
      await supabase
        .from("email_verifications")
        .update({ verified: true })
        .eq("id", verificationRecord.id);

      // Update user's email_confirmed_at in auth.users using admin API
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (!userError && userData) {
        const user = userData.users.find(u => u.email === email);
        if (user) {
          await supabase.auth.admin.updateUserById(user.id, {
            email_confirm: true
          });
          console.log("User email confirmed in auth.users:", email);
        }
      }

      console.log("Email verified successfully for:", email);

      return new Response(
        JSON.stringify({ success: true, message: "Email verified successfully" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
