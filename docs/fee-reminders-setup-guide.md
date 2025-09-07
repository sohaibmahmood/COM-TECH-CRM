# Fee Reminders Setup Guide

## Quick Setup Instructions

The fee reminder system is now ready to use, but requires database setup to function properly.

### Step 1: Database Migration

Run these SQL scripts in your Supabase SQL Editor:

#### 1. Create Fee Reminders Schema
```sql
-- Copy and paste the content from: scripts/003_fee_reminders_schema.sql
-- This creates the fee_reminders table and all necessary functions
```

#### 2. Fix 30-Day Logic
```sql
-- Copy and paste the content from: scripts/004_fix_reminder_logic.sql
-- This ensures reminders trigger after 30 days from payment_date
```

### Step 2: Verify Setup

1. Navigate to `/fee-reminders` page
2. If setup is successful, you'll see:
   - Statistics cards with actual data
   - List of students with overdue payments (if any)
   - No "Setup Required" messages

3. If setup is incomplete, you'll see:
   - Yellow warning cards saying "Setup Required"
   - Instructions to run migration scripts
   - "No reminder data available" message

### Step 3: Test the System

1. **Check for Overdue Students**: The system will automatically detect students whose fees are 30+ days overdue
2. **Send Test Reminder**: Click "Send" on any overdue student to test WhatsApp integration
3. **Verify Tracking**: Check that reminders are logged in the system

## How the 30-Day Logic Works

### Before (Old Logic):
- Payment Date: January 1st
- Due Date: February 1st (payment_date + 1 month)
- Reminder Trigger: March 2nd (due_date + 30 days)
- **Total Wait: 60 days**

### After (New Logic):
- Payment Date: January 1st
- Reminder Trigger: January 31st (payment_date + 30 days)
- **Total Wait: 30 days**

## Features Available

### ✅ Automatic Detection
- Finds students with `remaining_due > 0`
- Calculates days overdue from payment_date + 30 days
- Categorizes urgency levels

### ✅ Manual WhatsApp Sending
- One-click WhatsApp integration
- Personalized message templates
- Pakistani phone number formatting
- Reminder tracking and history

### ✅ Smart Fallbacks
- Works even without database functions
- Graceful error handling
- Clear setup instructions when needed

### ✅ 6-Day Reminder Schedule
- Automatic follow-up scheduling
- Prevents duplicate reminders
- Escalating urgency levels

## Troubleshooting

### "Failed to fetch data" Error
**Cause**: Database functions not created yet
**Solution**: Run the migration scripts (Step 1 above)

### "No reminder data available"
**Cause**: Either no overdue students OR database not set up
**Solution**: 
1. First run migration scripts
2. If still empty, check if any students have overdue fees
3. Verify fee_receipts table has data with remaining_due > 0

### WhatsApp Not Opening
**Cause**: Invalid phone number format
**Solution**: Ensure parent_phone field contains valid Pakistani numbers

### Reminders Not Tracking
**Cause**: fee_reminders table not created
**Solution**: Run migration scripts to create the table

## Database Tables Used

### Primary Tables:
- `students` - Student information and contact details
- `fee_receipts` - Payment records and remaining balances
- `fee_reminders` - Reminder history and tracking

### Key Fields:
- `fee_receipts.remaining_due` - Amount still owed
- `fee_receipts.payment_date` - When payment was made
- `students.parent_phone` - WhatsApp contact number
- `fee_reminders.status` - Tracking reminder status

## Success Indicators

✅ **Setup Complete When**:
- Fee Reminders page loads without errors
- Statistics show actual numbers (not "Setup Required")
- Overdue students list displays (if any exist)
- WhatsApp integration works
- Reminder history is tracked

✅ **System Working When**:
- Students appear 30 days after payment_date
- Messages generate correctly
- WhatsApp opens with pre-filled message
- Reminders are logged in database
- 6-day follow-up scheduling works

The system is now robust and will work even during the setup process, providing clear guidance on what needs to be done!
