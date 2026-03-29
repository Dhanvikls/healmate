import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getDb, writeDb, Patient } from "../../../lib/db";
import os from "os";

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

export async function POST(req: NextRequest) {
  try {
    const { patientId, patientName, condition, dischargeDate } = await req.json();

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required." }, { status: 400 });
    }

    const hostHeader = req.headers.get("host") || "localhost:3000";
    // Prioritize production URL from env, fallback to dynamic host
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || (hostHeader.includes("localhost") 
      ? `http://${getLocalIpAddress()}:${hostHeader.split(":")[1] || "3000"}`
      : `https://${hostHeader}`);

    // QR data that will be encoded
    const url = `${baseUrl}/patient/${patientId}`;

    // Generate base64 QR code image
    const qrDataUrl = await QRCode.toDataURL(url, {
      margin: 2,
      width: 300,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    });

    return NextResponse.json({
      patientId,
      url,
      qrDataUrl,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("QR API error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR data." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("id");

  if (!patientId) {
    return NextResponse.json({ error: "Patient ID required" }, { status: 400 });
  }

  const db = getDb();
  const patient = db.patients.find(p => p.id === patientId);

  if (!patient) {
     return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json({
    patient,
    message: "Patient data retrieved successfully",
  });
}