# Supabase Connection Guide for Fee Reminders

## Complete Setup Instructions

Your CRM system is already connected to Supabase! Now you just need to set up the fee reminders database functionality.

### Step 1: Access Your Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (the one connected to this CRM)

### Step 2: Run the Database Setup

#### Option A: Use the Built-in Helper (Recommended)
1. Navigate to `/fee-reminders` page in your CRM
2. You'll see a "Database Setup Helper" card at the top
3. Click "Check Database Status" to see what's missing
4. Click "Copy Setup Script" to copy the SQL script
5. Click "Open Supabase" to open your dashboard
6. Go to SQL Editor in Supabase
7. Paste the script and click "Run"
8. Return to CRM and click "Check Database Status" again

#### Option B: Manual Setup
1. Copy the content from `scripts/setup-fee-reminders-complete.sql`
2. Go to your Supabase dashboard → SQL Editor
3. Paste the entire script
4. Click "Run" to execute

### Step 3: Verify Setup

After running the script, you should see:
- ✅ Tables: fee_reminders table created
- ✅ Functions: Database functions available
- ✅ Data: Existing fee data detected
- 🎉 System Ready message

### Step 4: Test the System

1. **Check Overdue Students**: Navigate to Fee Reminders page
2. **View Statistics**: See counts of overdue payments
3. **Send Test Reminder**: Try sending a WhatsApp reminder
4. **Verify Tracking**: Check that reminders are logged

## What Gets Created

### Database Tables
- `fee_reminders` - Tracks all reminder history and status

### Database Functions
- `get_overdue_payments(grace_period_days)` - Finds students with overdue fees
- `generate_reminder_message(...)` - Creates personalized reminder messages
- `schedule_next_reminder(...)` - Handles 6-day reminder scheduling

### Indexes & Security
- Performance indexes on key fields
- Row Level Security (RLS) policies
- Automatic timestamp updates

## How the 30-Day Logic Works

The system now correctly identifies overdue payments:

```sql
-- Student pays fee on: 2024-01-01
-- Fee becomes overdue on: 2024-01-31 (payment_date + 30 days)
-- System detects overdue and allows reminders
```

### Urgency Levels
- **1-7 days overdue**: Gentle reminder
- **8-30 days overdue**: Moderate urgency
- **30+ days overdue**: Urgent notice

## Features Now Available

### ✅ Automatic Detection
- Scans fee_receipts for remaining_due > 0
- Calculates days overdue from payment_date + 30 days
- Categorizes by urgency level

### ✅ WhatsApp Integration
- One-click WhatsApp message sending
- Pakistani phone number formatting
- Pre-filled personalized messages

### ✅ Reminder Tracking
- Complete history of all reminders sent
- Status tracking (pending, sent, failed)
- 6-day automatic follow-up scheduling

### ✅ Smart Fallbacks
- Works even if database functions fail
- Graceful error handling
- Clear setup guidance

## Troubleshooting

### "Failed to fetch data" Error
**Solution**: Run the database setup script

### "Setup Required" Messages
**Solution**: Use the Database Setup Helper on the Fee Reminders page

### No Overdue Students Showing
**Possible Causes**:
1. No students have overdue fees (good!)
2. Database functions not set up yet
3. All fees are within 30-day grace period

**Check**: Look at fee_receipts table for remaining_due > 0

### WhatsApp Not Opening
**Cause**: Invalid phone number in parent_phone field
**Solution**: Ensure phone numbers are in valid format (e.g., +923001234567)

## Database Connection Details

Your CRM uses these Supabase configurations:
- **Client**: `lib/supabase/client.ts` - For browser-side operations
- **Server**: `lib/supabase/server.ts` - For server-side operations
- **Middleware**: `lib/supabase/middleware.ts` - For session management

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Success Indicators

✅ **Setup Complete When**:
- Database Setup Helper shows all green checkmarks
- Fee Reminders page loads without errors
- Statistics show actual numbers
- Overdue students list displays (if any exist)

✅ **System Working When**:
- Students appear 30 days after payment_date
- WhatsApp integration opens correctly
- Reminders are tracked in database
- Follow-up scheduling works

## Next Steps

1. **Run the setup script** using the Database Setup Helper
2. **Test with real data** by checking for overdue students
3. **Send test reminders** to verify WhatsApp integration
4. **Monitor daily** for new overdue payments
5. **Use 6-day follow-ups** for non-responsive students

The fee reminders system is now fully integrated with your Supabase database and ready for production use! 🎉
