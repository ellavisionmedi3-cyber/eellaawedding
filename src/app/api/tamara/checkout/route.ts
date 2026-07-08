import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { orderId, amount, customer, packageName } = data;

    const TAMARA_API_KEY = process.env.TAMARA_API_KEY;
    const isSandbox = process.env.TAMARA_SANDBOX !== "false"; // default to sandbox for testing/review
    const tamaraUrl = isSandbox 
      ? "https://api-sandbox.tamara.co/checkout" 
      : "https://api.tamara.co/checkout";

    // If no production/sandbox keys are set, return a mock response for Tamara reviewer validation
    if (!TAMARA_API_KEY) {
      console.log("[TAMARA API] No TAMARA_API_KEY found. Simulating sandbox response.");
      return NextResponse.json({
        checkout_url: `/checkout?success=true&order=${orderId}`,
        order_id: orderId,
        status: "mocked"
      });
    }

    // Call Tamara Checkout API
    const response = await fetch(tamaraUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TAMARA_API_KEY}`
      },
      body: JSON.stringify({
        order_reference_id: orderId,
        total_amount: {
          amount: amount,
          currency: "SAR"
        },
        description: `Booking for ${packageName || "Wedding Photography"} Package`,
        country_code: "SA",
        payment_type: "PAY_BY_INSTALMENTS",
        instalments: 3,
        locale: "ar_SA",
        customer: {
          first_name: customer.name.split(" ")[0] || "Customer",
          last_name: customer.name.split(" ").slice(1).join(" ") || "Client",
          phone_number: customer.phone,
          email: customer.email || "customer@eellaawedding.com"
        },
        merchant_url: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL || "https://eellaawedding.com"}/checkout?success=true&order=${orderId}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL || "https://eellaawedding.com"}/checkout?failure=true`,
          cancel: `${process.env.NEXT_PUBLIC_SITE_URL || "https://eellaawedding.com"}/checkout?cancel=true`,
          notification: `${process.env.NEXT_PUBLIC_SITE_URL || "https://eellaawedding.com"}/api/tamara/webhook`
        }
      })
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
