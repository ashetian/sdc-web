# Environment Configuration for KTÜ SDC Application

## MongoDB Connection

### For Local Development:
```bash
MONGODB_URI=mongodb://localhost:27017/sdc-web
```

### For Vercel Deployment (MongoDB Atlas):
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/sdc-web?retryWrites=true&w=majority
```

## Setup Instructions

### Local Development:
1. Create a `.env.local` file in the project root
2. Add the MongoDB URI (see examples above)
3. Make sure MongoDB is running locally OR use a MongoDB Atlas connection string

### Vercel Deployment:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add `MONGODB_URI` with your MongoDB Atlas connection string
4. Redeploy your application

## Getting MongoDB Atlas (Free Tier):
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for all IPs)
5. Get your connection string from "Connect" > "Connect your application"
6. Replace `<password>` with your database user password
