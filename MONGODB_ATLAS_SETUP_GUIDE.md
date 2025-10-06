# 🗄️ MongoDB Atlas Cloud Database Setup Guide

## ✅ Step 1: Create MongoDB Atlas Account

1. **Visit**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** with your email or Google account
3. **Choose**: Free M0 tier (512 MB storage, perfect for development)
4. **Select**: Cloud provider (AWS, Google Cloud, or Azure)
5. **Choose**: Region closest to your deployment (e.g., us-central1 for Google Cloud)

---

## 🔧 Step 2: Create Your Cluster

1. After signing in, click **"Build a Database"**
2. Choose **"M0 Free"** shared cluster
3. **Provider**: Select **Google Cloud** (matches your project)
4. **Region**: Select **Iowa (us-central1)** 
5. **Cluster Name**: `podcast-cluster` or keep default
6. Click **"Create"** and wait 3-5 minutes

---

## 👤 Step 3: Create Database User

1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `podcastadmin`
5. **Password**: Generate secure password or create your own
   - **SAVE THIS PASSWORD!** You'll need it for connection string
6. **Database User Privileges**: Choose **"Read and write to any database"**
7. Click **"Add User"**

---

## 🌐 Step 4: Configure Network Access

1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. **For Development**: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This adds `0.0.0.0/0` which allows connections from any IP
4. **For Production**: Add specific IP addresses or use VPC peering
5. Click **"Confirm"**

⚠️ **Security Note**: For production, restrict to specific IPs or use Google Cloud VPC

---

## 🔗 Step 5: Get Connection String

1. Go back to **"Database"** (Deployments)
2. Click **"Connect"** on your cluster
3. Choose **"Drivers"**
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. **Copy the connection string**:

```
mongodb+srv://podcastadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. **Replace** `<password>` with your actual database user password
8. **Add database name**: Change `/?retryWrites` to `/podcast-generator?retryWrites`

**Final format**:
```
mongodb+srv://podcastadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/podcast-generator?retryWrites=true&w=majority
```

---

## 📝 Step 6: Update Your .env File

Replace the local MongoDB URI with your Atlas connection string.

**Your connection string will look like**:
```
mongodb+srv://podcastadmin:YOUR_ACTUAL_PASSWORD@cluster0.abcde.gcp.mongodb.net/podcast-generator?retryWrites=true&w=majority
```

---

## 🔄 Step 7: Run Migration Script

After updating `.env`, run the migration script to copy your local data to Atlas:

```powershell
node migrate-to-atlas.js
```

This will:
- ✅ Connect to both local and cloud databases
- ✅ Export all users, documents, summaries, and podcasts
- ✅ Import them to MongoDB Atlas
- ✅ Verify data integrity
- ✅ Show migration summary

---

## ✅ Step 8: Test Connection

```powershell
node test-atlas-connection.js
```

This will verify:
- ✅ Connection to MongoDB Atlas
- ✅ Database access permissions
- ✅ Data can be read and written
- ✅ All collections are accessible

---

## 🎯 Benefits of MongoDB Atlas

✅ **Always Online**: 99.995% uptime SLA
✅ **Automatic Backups**: Daily snapshots with point-in-time recovery
✅ **Scalable**: Upgrade to paid tiers when needed
✅ **Secure**: Encrypted at rest and in transit
✅ **Global**: Deploy to multiple regions
✅ **Monitoring**: Built-in performance metrics
✅ **Cloud Integration**: Works seamlessly with Google Cloud

---

## 📊 Free Tier Limits (M0)

- **Storage**: 512 MB
- **RAM**: Shared
- **Backups**: Not included (manual exports only)
- **Connections**: 500 concurrent
- **Perfect for**: Development, testing, small projects

---

## 💰 When to Upgrade

Upgrade to **M10** ($0.08/hour) or higher when you need:
- More than 512 MB storage
- Automatic backups
- Better performance
- More concurrent connections
- Production workloads

---

## 🔒 Security Best Practices

1. ✅ Use strong passwords (20+ characters)
2. ✅ Enable 2FA on your Atlas account
3. ✅ Restrict IP addresses in production
4. ✅ Use environment variables for connection strings
5. ✅ Never commit credentials to Git
6. ✅ Rotate passwords regularly
7. ✅ Use read-only users for analytics
8. ✅ Enable audit logs (paid tiers)

---

## 🆘 Troubleshooting

### Connection Timeout
- ✅ Check network access whitelist
- ✅ Verify firewall isn't blocking port 27017
- ✅ Confirm correct connection string

### Authentication Failed
- ✅ Check username and password
- ✅ Verify user has correct permissions
- ✅ Ensure password is URL-encoded if it contains special characters

### Database Not Found
- ✅ Connection string should include `/podcast-generator`
- ✅ Database is created automatically on first write

---

## 📚 Next Steps

After MongoDB Atlas is configured:
1. ✅ Set up Google Cloud Storage for files
2. ✅ Deploy to Google Cloud Platform
3. ✅ Configure custom domain
4. ✅ Set up monitoring and alerts

---

## 🔗 Useful Links

- **Atlas Dashboard**: https://cloud.mongodb.com
- **Documentation**: https://docs.atlas.mongodb.com
- **Node.js Driver**: https://docs.mongodb.com/drivers/node
- **Support**: https://www.mongodb.com/support

---

**🎉 Once complete, your database will be accessible from anywhere in the world!**
