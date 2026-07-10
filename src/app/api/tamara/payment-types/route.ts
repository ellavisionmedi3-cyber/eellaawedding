import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { country, phone, currency, order_value } = body;

    const TAMARA_API_URL = process.env.TAMARA_API_URL || "https://api-sandbox.tamara.co";
    const TAMARA_API_TOKEN = process.env.TAMARA_API_TOKEN;

    if (!TAMARA_API_TOKEN) {
      console.warn("[TAMARA ELIGIBILITY] No TAMARA_API_TOKEN set. Mocking eligibility response.");
      return NextResponse.json({
        eligible: true,
        payment_types: [
          {
            name: "PAY_BY_INSTALMENTS",
            description: "Split in 3 interest-free payments",
            min_limit: { amount: 100, currency: "SAR" },
            max_limit: { amount: 5000, currency: "SAR" }
          }
        ]
      });
    }

    // Call Tamara Checkout Payment Types API
    // GET /checkout/payment-types
    const queryParams = new URLSearchParams({
      country: country || "SA",
      phone: phone || "",
      currency: currency || "SAR",
      order_value: order_value?.toString() || "0"
    });

    const response = await fetch(`${TAMARA_API_URL}/checkout/payment-types?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TAMARA_API_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[TAMARA ELIGIBILITY API ERROR]:", errorText);
      // Fallback: If sandbox API fails temporarily, let's assume they are eligible
      // to avoid blocking user checkout, or return ineligible. The user requested:
      // "إذا لم يكن العميل مؤهلًا، يجب تعطيل زر تمارا وإظهار رسالة مناسبة."
      // Since it's sandbox, if it returns 400 or other errors (e.g. invalid phone format),
      // we'll return ineligible so they see the error message.
      return NextResponse.json({ eligible: false, payment_types: [], error: errorText });
    }

    const paymentTypes = await response.json();
    
    // Tamara returns an array of payment types if eligible.
    // If the array is empty or null, the customer is not eligible.
    const isEligible = Array.isArray(paymentTypes) && paymentTypes.length > 0;

    return NextResponse.json({
      eligible: isEligible,
      payment_types: paymentTypes
    });

  } catch (error: any) {
    console.error("[TAMARA ELIGIBILITY EXCEPTION]:", error);
    return NextResponse.json({ eligible: false, payment_types: [], error: error.message }, { status: 500 });
  }
}
