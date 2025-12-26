# Database Seeding Guide

## Overview

This guide explains how to seed the production database with food and exercise data.

## Available Scripts

### Seed Everything (Recommended)
```bash
npm run seed:prod
```
Seeds both food and exercise data in one command.

### Seed Food Only
```bash
npm run seed:food
```
Seeds only food data from `src/data/food.ts`.

### Seed Exercises Only
```bash
npm run seed:exercises
```
Seeds only exercise data from `src/data/exercises.ts`.

## Production Seeding

### Prerequisites
1. Ensure you have access to the production database
2. Have the production `DATABASE_URL` environment variable

### Steps

1. **Backup the database** (IMPORTANT!)
   ```bash
   # Create a backup before seeding
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Set the DATABASE_URL**
   ```bash
   # Option 1: Use .env file
   DATABASE_URL="your-production-url" npm run seed:prod
   
   # Option 2: Export environment variable
   export DATABASE_URL="your-production-url"
   npm run seed:prod
   ```

3. **Run the seed script**
   ```bash
   npm run seed:prod
   ```

### Expected Output

```
🚀 Starting production database seeding...

📊 Database: postgresql://user@host...
📅 Date: 2025-12-26T15:58:59.000Z

✅ Database connection successful

🍎 Starting food data seeding...
  ✓ Created 10 food items...
  ✓ Created 20 food items...
  ...
✅ Food seeding complete: 1702 created, 0 skipped

💪 Starting exercise data seeding...
  ✓ Created 10 exercises...
  ✓ Created 20 exercises...
  ...
✅ Exercise seeding complete: 635 created, 0 skipped

==================================================
📊 SEEDING SUMMARY
==================================================
🍎 Food Items:     1702 created, 0 skipped
💪 Exercises:      635 created, 0 skipped
📈 Total Created:  2337
⏭️  Total Skipped:  0
==================================================

✅ Seeding completed successfully!
```

## Features

### Duplicate Detection
The scripts automatically detect and skip existing records based on name matching. This means you can safely run the scripts multiple times without creating duplicates.

### Progress Tracking
- Real-time progress indicators
- Batch progress updates every 10 items
- Final summary with statistics

### Error Handling
- Individual item errors don't stop the entire process
- Detailed error messages for debugging
- Exit codes for CI/CD integration

## Troubleshooting

### Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"
```

### Permission Issues
Ensure your database user has INSERT permissions:
```sql
GRANT INSERT ON TABLE "Food", "Exercise" TO your_user;
```

### Data Verification
After seeding, verify the data:
```sql
-- Check food count
SELECT COUNT(*) FROM "Food";

-- Check exercise count
SELECT COUNT(*) FROM "Exercise";

-- Sample food items
SELECT name, category, calories FROM "Food" LIMIT 10;

-- Sample exercises
SELECT name, "muscleGroup", equipment FROM "Exercise" LIMIT 10;
```

## Development Seeding

For local development, you can use the same scripts:

```bash
# Make sure your .env has DATABASE_URL pointing to local DB
npm run seed:prod
```

## Data Sources

- **Food Data**: `/src/data/food.ts` - Contains 1702 food items with nutritional information
- **Exercise Data**: `/src/data/exercises.ts` - Contains 635 exercises with muscle groups and equipment

## Notes

- The scripts use **upsert logic** to prevent duplicates
- Existing records are skipped, not updated
- All timestamps are automatically set to current time
- System-level exercises have `createdById` set to `null`
