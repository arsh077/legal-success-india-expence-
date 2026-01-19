# Firebase Setup Guide for Legal Success India Expense Tracker

## Step 1: Get Your Firebase Configuration

1. Go to your Firebase Console: https://console.firebase.google.com
2. Select your "expense" project
3. Click the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. If you don't have a web app, click "Add app" and select the web icon (</>)
7. Register your app with name "Legal Success Expense Tracker"
8. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "expense-xxxxx.firebaseapp.com",
  projectId: "expense",
  storageBucket: "expense-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## Step 2: Update Firebase Configuration

Open `services/firebaseSync.ts` and replace the FIREBASE_CONFIG object with your actual configuration:

```typescript
const FIREBASE_CONFIG = {
  apiKey: "your-actual-api-key",
  authDomain: "expense-xxxxx.firebaseapp.com", // Replace xxxxx with your project ID
  projectId: "expense",
  storageBucket: "expense-xxxxx.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 3: Enable Authentication

1. In Firebase Console, find "Authentication" in the left sidebar
   - If you can't see it, click "Build" first, then look for "Authentication"
   - Or use the search function at the top
2. Click "Get started" if it's your first time
3. Go to "Sign-in method" tab
4. Click on "Email/Password"
5. Enable the first toggle (Email/Password)
6. Click "Save"

## Step 4: Create User Account

1. Go to "Authentication" > "Users" tab
2. Click "Add user"
3. Enter:
   - Email: `arshad@legalsuccessindia.com`
   - Password: `Khurshid@1997`
4. Click "Add user"

## Step 5: Test the Setup

1. Save all files and refresh your application
2. Try logging in with the credentials
3. Add an expense - it should sync to Firebase
4. Open the app on another device (mobile) and login
5. You should see the same data in real-time!

## Firestore Database Rules (Already Set)

Your Firestore is in test mode, which allows read/write access. For production, you might want to add security rules, but for now this works fine.

## Troubleshooting

### Can't Find Authentication
- Look under "Build" section in left sidebar
- Try refreshing the Firebase Console
- Use the search icon at the top of the console

### Login Fails
- Check browser console for errors
- Verify your Firebase config is correct
- Make sure Authentication is enabled
- Ensure the user account exists

### Data Not Syncing
- Check browser console for errors
- Verify Firestore Database is in test mode
- Make sure you're logged in successfully

## Current Status

✅ Firebase project created ("expense")
✅ Firestore Database created with test mode
✅ Sample data added to "expenses" collection
⏳ Authentication setup (you need to enable this)
⏳ Firebase config update (you need to add your actual config)

Once you complete steps 2-4, your real-time sync will work perfectly between mobile and laptop!