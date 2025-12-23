#!/usr/bin/env node

/**
 * Script to automatically create PayPal subscription plans and update .env files
 * Run with: node scripts/setup-paypal-plans.js
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENVIRONMENT = process.env.PAYPAL_ENVIRONMENT || "sandbox";

const PAYPAL_API_BASE =
  PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

console.log("\n🚀 PayPal Plan Setup Script");
console.log("============================\n");
console.log(`Environment: ${PAYPAL_ENVIRONMENT}`);
console.log(`API Base: ${PAYPAL_API_BASE}\n`);

// Get PayPal access token
async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
    ).toString("base64");

    const options = {
      hostname: PAYPAL_API_BASE.replace("https://", ""),
      path: "/v1/oauth2/token",
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data).access_token);
        } else {
          reject(new Error(`Failed to get access token: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write("grant_type=client_credentials");
    req.end();
  });
}

// Create a product (required before creating plans)
async function createProduct(accessToken) {
  return new Promise((resolve, reject) => {
    const productData = JSON.stringify({
      name: "GymRat Plus Subscription",
      description: "GymRat Plus subscription service",
      type: "SERVICE",
      category: "SOFTWARE",
    });

    const options = {
      hostname: PAYPAL_API_BASE.replace("https://", ""),
      path: "/v1/catalogs/products",
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to create product: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(productData);
    req.end();
  });
}

// Create a subscription plan
async function createPlan(accessToken, productId, planConfig) {
  return new Promise((resolve, reject) => {
    const planData = JSON.stringify({
      product_id: productId,
      name: planConfig.name,
      description: planConfig.description,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: planConfig.intervalUnit,
            interval_count: 1,
          },
          tenure_type: "TRIAL",
          sequence: 1,
          total_cycles: 1,
          pricing_scheme: {
            fixed_price: {
              value: "0",
              currency_code: "USD",
            },
          },
        },
        {
          frequency: {
            interval_unit: planConfig.intervalUnit,
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 2,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: planConfig.price,
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: "USD",
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    });

    const options = {
      hostname: PAYPAL_API_BASE.replace("https://", ""),
      path: "/v1/billing/plans",
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to create plan: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(planData);
    req.end();
  });
}

// Update .env files
function updateEnvFiles(proPlanId, instructorPlanId) {
  const envFiles = [".env", ".env.local", ".env.prod"];

  envFiles.forEach((file) => {
    const filePath = path.join(__dirname, "..", file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");

      // Update or add Plan IDs
      if (content.includes("PAYPAL_PLAN_ID_PRO=")) {
        content = content.replace(
          /PAYPAL_PLAN_ID_PRO=.*/g,
          `PAYPAL_PLAN_ID_PRO=${proPlanId}`,
        );
      } else {
        content += `\nPAYPAL_PLAN_ID_PRO=${proPlanId}`;
      }

      if (content.includes("PAYPAL_PLAN_ID_INSTRUCTOR=")) {
        content = content.replace(
          /PAYPAL_PLAN_ID_INSTRUCTOR=.*/g,
          `PAYPAL_PLAN_ID_INSTRUCTOR=${instructorPlanId}`,
        );
      } else {
        content += `\nPAYPAL_PLAN_ID_INSTRUCTOR=${instructorPlanId}`;
      }

      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${file}`);
    }
  });
}

// Main execution
async function main() {
  try {
    console.log("1️⃣  Getting PayPal access token...");
    const accessToken = await getAccessToken();
    console.log("✅ Access token obtained\n");

    console.log("2️⃣  Creating product...");
    const product = await createProduct(accessToken);
    console.log(`✅ Product created: ${product.id}\n`);

    console.log("3️⃣  Creating Pro Plan ($9.99/month)...");
    const proPlan = await createPlan(accessToken, product.id, {
      name: "GymRat Plus - Pro",
      description: "Plan Pro mensual con 14 días de prueba gratis",
      price: "9.99",
      intervalUnit: "MONTH",
    });
    console.log(`✅ Pro Plan created: ${proPlan.id}\n`);

    console.log("4️⃣  Creating Instructor Plan ($19.99/month)...");
    const instructorPlan = await createPlan(accessToken, product.id, {
      name: "GymRat Plus - Instructor",
      description: "Plan Instructor mensual con 14 días de prueba gratis",
      price: "19.99",
      intervalUnit: "MONTH",
    });
    console.log(`✅ Instructor Plan created: ${instructorPlan.id}\n`);

    console.log("5️⃣  Updating .env files...");
    updateEnvFiles(proPlan.id, instructorPlan.id);
    console.log("");

    console.log("🎉 Setup Complete!\n");
    console.log("Plan IDs:");
    console.log(`  Pro Plan: ${proPlan.id}`);
    console.log(`  Instructor Plan: ${instructorPlan.id}\n`);
    console.log("Next steps:");
    console.log("  1. Restart your development server");
    console.log("  2. Add these Plan IDs to Vercel environment variables");
    console.log("  3. Test the payment flow\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
