# Ask Mian Telegram Bot v2.0

Complete Telegram bot for Ask Mian Visa & PRO Services with multi-language support, document upload, and payment integration.

## Features

- **4 Languages**: English, Amharic, Tigrinya, Oromo
- **Complete Application Flow**: Apply → Upload Documents → Pay → Submit
- **Document Upload**: Passport copy, passport photo, 6-month bank statement
- **Payment Methods**: Card (Stripe), Bank Transfer, Cash, WhatsApp
- **Admin Notifications**: Real-time alerts for new leads, documents, and payments
- **Lead & Application Storage**: JSON-based local storage
- **Smart Menu Navigation**: Persistent keyboard in user's language
- **Mini App Integration**: Opens website inside Telegram

## Setup

### 1. Get Bot Token

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow instructions
3. Copy the bot token

### 2. Get Admin Chat ID

1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. Copy your numeric Chat ID

### 3. (Optional) Stripe Payment Token

1. Go to [@BotFather](https://t.me/BotFather) → `/mybots` → Select your bot → `Payments`
2. Select Stripe and connect your account
3. Copy the Provider Token
4. If not set, card payments will be hidden (other methods still work)

### 4. Deploy on Render

1. Go to [render.com](https://render.com) and create an account
2. Click **New** → **Web Service**
3. Connect your GitHub repo or upload files directly
4. Set the following:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   - `BOT_TOKEN`: Your bot token
   - `ADMIN_CHAT_ID`: Your Telegram chat ID
   - `STRIPE_TOKEN`: (Optional) Stripe provider token
6. Click **Create Web Service**

### 5. Environment Variables

Create a `.env` file (or set in Render dashboard):

```
BOT_TOKEN=YOUR_BOT_TOKEN_HERE
ADMIN_CHAT_ID=YOUR_CHAT_ID_HERE
STRIPE_TOKEN=YOUR_STRIPE_PROVIDER_TOKEN  # Optional
```

## Application Flow

```
/start → Language Selection → Welcome Menu
  → Apply Now → Select Service → Form (6 steps)
    → Upload Passport → Upload Photo → Upload Bank Statement
      → Select Payment Method
        → Card: Pay via Stripe inline
        → Bank Transfer: Upload receipt photo
        → Cash: Visit office instructions
        → WhatsApp: Redirect to WhatsApp payment
      → Application Submitted → Admin Notification
```

## Admin Commands

| Command | Description |
|---------|-------------|
| `/start` | Start the bot |
| `/services` | View visa services |
| `/apply` | Start application |
| `/price` | View pricing |
| `/contact` | Contact information |
| `/faq` | FAQ section |
| `/how` | How it works |
| `/testimonials` | Client testimonials |
| `/language` | Change language |
| `/app` | Open website mini app |
| `/cancel` | Cancel current application |
| `/leads` | (Admin) View recent leads |
| `/apps` | (Admin) View applications |

## File Structure

```
bot/
├── bot.js              # Main bot file
├── package.json        # Dependencies
├── .env.example        # Environment template
├── .env                # Your environment variables
├── README.md           # This file
├── uploads/            # Uploaded documents (auto-created)
├── leads.json          # Saved leads (auto-created)
└── applications.json   # Saved applications (auto-created)
```

## Language Support

All bot messages are translated into 4 languages:
- **English** - Default
- **Amharic** (አማርኛ) - Ethiopian national language
- **Tigrinya** (ትግርኛ) - Eritrean & Northern Ethiopian language
- **Oromo** (Oromiffa) - Ethiopian regional language

Users can switch language anytime via the menu or `/language` command.

## Notes

- Uploaded documents are stored in `./uploads/<chat_id>/`
- All data is stored in JSON files (no database required)
- The bot uses long polling (works on free Render tier)
- Free Render tier sleeps after 15 minutes of inactivity
