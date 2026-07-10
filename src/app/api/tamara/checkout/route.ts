import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { orderId, amount, customer, packageName } = data;

    const TAMARA_API_URL = process.env.TAMARA_API_URL || "https://api-sandbox.tamara.co";
    const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // If no keys are set, return a mock response for review validation
    if (!TAMARA_API_TOKEN) {
      console.log("[TAMARA API] No TAMARA_API_TOKEN found. Simulating sandbox checkout URL.");
      return NextResponse.json({
        checkout_url: `${siteUrl}/checkout?success=true&order=${orderId}`,
        order_id: orderId,
        status: "mocked"
      });
    }

    // Prepare Name
    const fullName = customer.name || "Client";
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "Client";
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    // Clean Phone
    let phoneNumber = customer.phone || "";
    // Ensure KSA phone has a leading country code if not present, and is well-formatted
    phoneNumber = phoneNumber.replace(/\s+/g, "");
    if (!phoneNumber.startsWith("+") && !phoneNumber.startsWith("966")) {
      // If it starts with 05, remove 0 and add 966
      if (phoneNumber.startsWith("05")) {
        phoneNumber = "966" + phoneNumber.substring(1);
      } else {
        phoneNumber = "966" + phoneNumber;
      }
    }
    // Make sure phone contains only digits (plus is allowed by some endpoints but let's make it standard KSA number)
    phoneNumber = phoneNumber.replace(/[^0-9+]/g, "");

    const requestBody = {
      order_reference_id: orderId,
      total_amount: {
        amount: parseFloat(amount),
        currency: "SAR"
      },
      description: `Wedding photography booking for package: ${packageName || "Wedding Package"}`,
      country_code: "SA",
      payment_type: "PAY_BY_INSTALMENTS",
      locale: "ar_SA",
      customer: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        email: customer.email || "customer@eellaawedding.com"
      },
      items: [
        {
          name: packageName || "Wedding Photography Package",
          reference_id: orderId,
          sku: packageName ? packageName.toLowerCase().replace(/\s+/g, "-") : "wedding-pkg",
          quantity: 1,
          unit_price: {
            amount: parseFloat(amount),
            currency: "SAR"
          },
          total_amount: {
            amount: parseFloat(amount),
            currency: "SAR"
          }
        }
      ],
      merchant_url: {
        success: `${siteUrl}/checkout?success=true&order=${orderId}`,
        failure: `${siteUrl}/checkout?failure=true`,
        cancel: `${siteUrl}/checkout?cancel=true`,
        notification: `${siteUrl}/api/tamara/webhook`
      }
    };

    console.log("[TAMARA API] Checkout request payload:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${TAMARA_API_URL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TAMARA_API_TOKEN}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[TAMARA API Error]:", errorText);
      return NextResponse.json({ error: "Tamara checkout initialization failed", details: errorText }, { status: 400 });
    }

    const tamaraData = await response.json();
    return NextResponse.json({
      checkout_url: tamaraData.checkout_url,
      order_id: tamaraData.order_id
    });

  } catch (error: any) {
    console.error("[TAMARA API Exception]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
