# Supabase Email Authentication Setup

This guide will help you configure email verification and password reset functionality for your SaaS Vendor Management application.

## Required Supabase Configuration

### 1. Authentication Settings

In your Supabase Dashboard, navigate to **Authentication > Settings**:

#### Email Confirmation
1. **Enable email confirmations**: ✅ Checked
2. **Confirm email**: Set to "Required"
3. **Email templates**: Customize the email templates (optional)

#### URL Configuration
1. **Site URL**: Set to your production domain (e.g., `https://yourapp.com`)
2. **Redirect URLs**: Add these URLs:
   - `http://localhost:3000/auth/confirm` (development)
   - `https://yourapp.com/auth/confirm` (production)
   - `http://localhost:3000/auth/reset-password` (development)
   - `https://yourapp.com/auth/reset-password` (production)

### 2. Email Provider Configuration

#### Option A: Use Supabase Built-in SMTP (Development Only)
- Works out of the box for development
- Limited to 3 emails per hour per user
- Not recommended for production

#### Option B: Configure Custom SMTP Provider (Recommended for Production)

1. Go to **Authentication > Settings > SMTP Settings**
2. Enable **Enable custom SMTP**
3. Configure your SMTP provider (examples below):

**Gmail SMTP:**
- Sender email: `your-email@gmail.com`
- Sender name: `Your App Name`
- Host: `smtp.gmail.com`
- Port: `587`
- Username: `your-email@gmail.com`
- Password: Use App Password (not your regular Gmail password)

**SendGrid SMTP:**
- Sender email: `noreply@yourdomain.com`
- Sender name: `Your App Name`
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: Your SendGrid API Key

**AWS SES:**
- Sender email: `noreply@yourdomain.com`
- Sender name: `Your App Name`
- Host: `email-smtp.us-east-1.amazonaws.com` (adjust region)
- Port: `587`
- Username: Your SMTP username
- Password: Your SMTP password

### 3. Email Templates (Optional Customization)

Navigate to **Authentication > Templates** to customize:

#### Confirm Signup Template:
```html
<h1>Welcome to {{ .SiteName }}!</h1>
<p>Thank you for signing up. Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link expires in 24 hours.</p>
```

#### Reset Password Template:
```html
<h1>Reset your password</h1>
<p>You requested to reset your password for {{ .SiteName }}.</p>
<p><a href="{{ .ConfirmationURL }}">Reset your password</a></p>
<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link expires in 1 hour.</p>
<p>If you didn't request this, you can safely ignore this email.</p>
```

## Environment Variables

Make sure your `.env.local` file includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing Email Verification

### Development Testing:
1. Sign up with a real email address
2. Check your email for the confirmation link
3. Click the link to verify your account
4. Try signing in - should work without issues

### Production Testing:
1. Deploy your app to production
2. Update Supabase Site URL and Redirect URLs
3. Test the complete flow with real email addresses

## Features Implemented

### ✅ Email Verification on Signup
- Users receive a confirmation email after registration
- Users cannot sign in until email is confirmed
- Clear success message after signup

### ✅ Resend Confirmation Email
- Users who try to sign in with unconfirmed email see a resend option
- Helpful error messages guide users to confirm their email
- One-click resend functionality

### ✅ Password Reset
- "Forgot password" link in login form
- Users receive password reset email with secure link
- Password reset page with validation
- Automatic redirect to dashboard after successful reset

### ✅ User Experience Features
- Clear error messages and success notifications
- Loading states for all async operations
- Helpful instructions and support links
- Consistent styling across all auth pages

## Security Features

- **Email verification required**: Prevents fake accounts
- **Secure password reset**: Links expire after 1 hour
- **URL validation**: Only configured domains accepted
- **Rate limiting**: Built-in Supabase protection against spam
- **Strong password requirements**: Minimum 6 characters

## Troubleshooting

### Common Issues:

1. **Emails not being sent**
   - Check SMTP configuration in Supabase dashboard
   - Verify sender email is authorized (for AWS SES, Gmail)
   - Check spam folder

2. **Confirmation links not working**
   - Verify redirect URLs in Supabase settings
   - Check if URLs match exactly (including protocol)
   - Ensure Site URL is correctly set

3. **"Email not confirmed" error**
   - User needs to click confirmation link in email
   - Use resend confirmation feature if needed
   - Check if email was delivered

4. **Password reset not working**
   - Check if password reset redirect URL is configured
   - Verify SMTP settings are working
   - Ensure user exists in system

## Production Checklist

- [ ] Configure custom SMTP provider
- [ ] Set production Site URL in Supabase
- [ ] Add production redirect URLs
- [ ] Test email delivery with real email addresses
- [ ] Customize email templates with your branding
- [ ] Set up monitoring for email delivery
- [ ] Document support process for email issues

For more information, see the [Supabase Auth documentation](https://supabase.com/docs/guides/auth).