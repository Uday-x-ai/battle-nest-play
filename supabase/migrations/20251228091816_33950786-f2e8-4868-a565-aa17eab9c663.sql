-- Create email_otps table for storing verification codes
CREATE TABLE public.email_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_email_otps_email ON public.email_otps(email);
CREATE INDEX idx_email_otps_expires_at ON public.email_otps(expires_at);

-- Enable RLS
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for unauthenticated users during signup)
CREATE POLICY "Anyone can create OTP records" 
ON public.email_otps 
FOR INSERT 
WITH CHECK (true);

-- Allow public select for verification
CREATE POLICY "Anyone can verify OTP records" 
ON public.email_otps 
FOR SELECT 
USING (true);

-- Allow public update for marking as verified
CREATE POLICY "Anyone can update OTP records" 
ON public.email_otps 
FOR UPDATE 
USING (true);

-- Allow cleanup of expired OTPs
CREATE POLICY "Anyone can delete expired OTPs" 
ON public.email_otps 
FOR DELETE 
USING (expires_at < now());