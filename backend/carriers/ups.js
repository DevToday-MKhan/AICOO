/**
 * UPS Carrier API Integration
 * Official API Documentation: https://developer.ups.com/api/reference
 * 
 * Uses UPS API (OAuth 2.0)
 * Supports: Rate Shopping, Label Creation, Tracking, Address Validation
 */

import dotenv from "dotenv";
dotenv.config();

const UPS_BASE_URL = "https://onlinetools.ups.com/api"; // Production
const UPS_TEST_URL = "https://wwwcie.ups.com/api"; // Test/Sandbox

// Get environment variables
const config = {
  clientId: process.env.UPS_CLIENT_ID || "TODO_ADD_UPS_CLIENT_ID",
  clientSecret: process.env.UPS_CLIENT_SECRET || "TODO_ADD_UPS_CLIENT_SECRET",
  accountNumber: process.env.UPS_ACCOUNT_NUMBER || "TODO_ADD_ACCOUNT_NUMBER",
  useSandbox: process.env.UPS_USE_SANDBOX !== "false" // Default to sandbox
};

const BASE_URL = config.useSandbox ? UPS_TEST_URL : UPS_BASE_URL;

// OAuth token cache
let accessToken = null;
let tokenExpiry = null;

/**
 * Authenticate with UPS OAuth 2.0
 * @returns {Promise<string>} Access token
 */
async function authenticate() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // TODO: Implement real OAuth flow when credentials are added
  if (config.clientId.startsWith("TODO_")) {
    console.warn("⚠️ UPS API credentials not configured. Using mock mode.");
    return "MOCK_UPS_TOKEN";
  }

  try {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
    
    const response = await fetch("https://onlinetools.ups.com/security/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: "client_credentials"
      })
    });

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return accessToken;
  } catch (error) {
    console.error("UPS authentication failed:", error);
    throw new Error("UPS authentication failed");
  }
}

/**
 * Get shipping rates from UPS
 * @param {string} fromZip - Origin ZIP code
 * @param {string} toZip - Destination ZIP code
 * @param {number} weight - Package weight in pounds
 * @param {object} options - Additional options
 * @returns {Promise<object>} Rate quotes
 */
export async function getRates(fromZip, toZip, weight, options = {}) {
  const token = await authenticate();

  // Mock response if credentials not configured
  if (token === "MOCK_UPS_TOKEN") {
    return generateMockRates(fromZip, toZip, weight);
  }

  // Real UPS API request structure
  const requestBody = {
    RateRequest: {
      Request: {
        TransactionReference: {
          CustomerContext: "AICOO Rate Request"
        }
      },
      Shipment: {
        Shipper: {
          Address: {
            PostalCode: fromZip,
            CountryCode: "US"
          }
        },
        ShipTo: {
          Address: {
            PostalCode: toZip,
            CountryCode: "US"
          }
        },
        Package: [
          {
            PackagingType: {
              Code: "02" // Customer supplied package
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS"
              },
              Weight: weight.toString()
            }
          }
        ]
      }
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/rating/v1/Rate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "transId": `AICOO-${Date.now()}`,
        "transactionSrc": "AICOO"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return parseUPSRates(data);
  } catch (error) {
    console.error("UPS getRates error:", error);
    throw error;
  }
}

/**
 * Create shipping label
 * @param {object} orderData - Order details
 * @returns {Promise<object>} Label data with tracking number
 */
export async function createLabel(orderData) {
  const token = await authenticate();

  // Mock response if credentials not configured
  if (token === "MOCK_UPS_TOKEN") {
    return generateMockLabel(orderData);
  }

  // Real UPS label creation request
  const requestBody = {
    ShipmentRequest: {
      Shipment: {
        Shipper: {
          Name: orderData.shipper?.name || "ChickenToday",
          ShipperNumber: config.accountNumber,
          Address: {
            AddressLine: [orderData.shipper?.address || "123 Farm Road"],
            City: orderData.shipper?.city || "Newark",
            StateProvinceCode: orderData.shipper?.state || "NJ",
            PostalCode: orderData.fromZip,
            CountryCode: "US"
          },
          Phone: {
            Number: orderData.shipper?.phone || "5551234567"
          }
        },
        ShipTo: {
          Name: orderData.customerName || "Customer",
          Address: {
            AddressLine: [orderData.customerAddress || "456 Main St"],
            City: orderData.customerCity || "New York",
            StateProvinceCode: orderData.customerState || "NY",
            PostalCode: orderData.toZip,
            CountryCode: "US"
          },
          Phone: {
            Number: orderData.customerPhone || "5559876543"
          }
        },
        Service: {
          Code: orderData.serviceCode || "03" // Ground
        },
        Package: [
          {
            Packaging: {
              Code: "02"
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS"
              },
              Weight: (orderData.weight || 5).toString()
            }
          }
        ],
        PaymentInformation: {
          ShipmentCharge: {
            Type: "01", // Transportation
            BillShipper: {
              AccountNumber: config.accountNumber
            }
          }
        }
      },
      LabelSpecification: {
        LabelImageFormat: {
          Code: "PDF"
        },
        LabelStockSize: {
          Height: "4",
          Width: "6"
        }
      }
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/shipments/v1/ship`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "transId": `AICOO-${Date.now()}`,
        "transactionSrc": "AICOO"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return parseUPSLabel(data);
  } catch (error) {
    console.error("UPS createLabel error:", error);
    throw error;
  }
}

/**
 * Track shipment
 * @param {string} trackingNumber - UPS tracking number
 * @returns {Promise<object>} Tracking information
 */
export async function track(trackingNumber) {
  const token = await authenticate();

  // Mock response if credentials not configured
  if (token === "MOCK_UPS_TOKEN") {
    return generateMockTracking(trackingNumber);
  }

  try {
    const response = await fetch(`${BASE_URL}/track/v1/details/${trackingNumber}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "transId": `AICOO-${Date.now()}`,
        "transactionSrc": "AICOO"
      }
    });

    const data = await response.json();
    return parseUPSTracking(data);
  } catch (error) {
    console.error("UPS track error:", error);
    throw error;
  }
}

/**
 * Validate address
 * @param {object} address - Address to validate
 * @returns {Promise<object>} Validated address
 */
export async function validateAddress(address) {
  const token = await authenticate();

  // Mock response if credentials not configured
  if (token === "MOCK_UPS_TOKEN") {
    return { valid: true, address: address, confidence: "high" };
  }

  const requestBody = {
    XAVRequest: {
      AddressKeyFormat: {
        AddressLine: [address.street],
        PoliticalDivision2: address.city,
        PoliticalDivision1: address.state,
        PostcodePrimaryLow: address.zip,
        CountryCode: "US"
      }
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/addressvalidation/v1/1`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "transId": `AICOO-${Date.now()}`,
        "transactionSrc": "AICOO"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return parseUPSValidation(data);
  } catch (error) {
    console.error("UPS validateAddress error:", error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

function generateMockRates(fromZip, toZip, weight) {
  const baseRate = 11 + (weight * 0.45);
  const distance = Math.abs(parseInt(fromZip) - parseInt(toZip)) / 1000;
  
  return {
    carrier: "UPS",
    services: [
      {
        service: "UPS_GROUND",
        price: (baseRate + distance * 1.8).toFixed(2),
        deliveryDays: 3,
        currency: "USD"
      },
      {
        service: "UPS_2ND_DAY_AIR",
        price: (baseRate * 1.9 + distance * 2.8).toFixed(2),
        deliveryDays: 2,
        currency: "USD"
      },
      {
        service: "UPS_NEXT_DAY_AIR",
        price: (baseRate * 3.2 + distance * 4.5).toFixed(2),
        deliveryDays: 1,
        currency: "USD"
      }
    ],
    mock: true
  };
}

function generateMockLabel(orderData) {
  return {
    carrier: "UPS",
    trackingNumber: `1Z${Date.now().toString().slice(-16)}`,
    labelUrl: "https://example.com/label.pdf",
    cost: (14 + (orderData.weight || 5) * 0.45).toFixed(2),
    service: orderData.serviceCode || "UPS_GROUND",
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    mock: true
  };
}

function generateMockTracking(trackingNumber) {
  return {
    carrier: "UPS",
    trackingNumber: trackingNumber,
    status: "IN_TRANSIT",
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    events: [
      {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "ORIGIN_SCAN",
        location: "Newark, NJ, US"
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: "ARRIVAL_SCAN",
        location: "Philadelphia, PA, US"
      }
    ],
    mock: true
  };
}

function parseUPSRates(data) {
  // TODO: Parse actual UPS response when using real API
  return data;
}

function parseUPSLabel(data) {
  // TODO: Parse actual UPS label response
  return data;
}

function parseUPSTracking(data) {
  // TODO: Parse actual UPS tracking response
  return data;
}

function parseUPSValidation(data) {
  // TODO: Parse actual UPS validation response
  return data;
}

export default {
  getRates,
  createLabel,
  track,
  validateAddress
};
