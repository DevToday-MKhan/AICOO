/**
 * FedEx Carrier API Integration
 * Official API Documentation: https://developer.fedex.com/api/en-us/catalog/rate/v1/docs.html
 * 
 * Uses FedEx REST API v1 (OAuth 2.0)
 * Supports: Rate Shopping, Label Creation, Tracking, Address Validation
 */

import dotenv from "dotenv";
dotenv.config();

const FEDEX_BASE_URL = "https://apis.fedex.com"; // Production
const FEDEX_TEST_URL = "https://apis-sandbox.fedex.com"; // Sandbox

// Get environment variables
const config = {
  clientId: process.env.FEDEX_CLIENT_ID || "TODO_ADD_FEDEX_CLIENT_ID",
  clientSecret: process.env.FEDEX_CLIENT_SECRET || "TODO_ADD_FEDEX_CLIENT_SECRET",
  accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || "TODO_ADD_ACCOUNT_NUMBER",
  useSandbox: process.env.FEDEX_USE_SANDBOX !== "false" // Default to sandbox
};

const BASE_URL = config.useSandbox ? FEDEX_TEST_URL : FEDEX_BASE_URL;

// OAuth token cache
let accessToken = null;
let tokenExpiry = null;

/**
 * Authenticate with FedEx OAuth 2.0
 * @returns {Promise<string>} Access token
 */
async function authenticate() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  // TODO: Implement real OAuth flow when credentials are added
  if (config.clientId.startsWith("TODO_")) {
    console.warn("⚠️ FedEx API credentials not configured. Using mock mode.");
    return "MOCK_FEDEX_TOKEN";
  }

  try {
    const response = await fetch(`${BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: config.clientId,
        client_secret: config.clientSecret
      })
    });

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return accessToken;
  } catch (error) {
    console.error("FedEx authentication failed:", error);
    throw new Error("FedEx authentication failed");
  }
}

/**
 * Get shipping rates from FedEx
 * @param {string} fromZip - Origin ZIP code
 * @param {string} toZip - Destination ZIP code
 * @param {number} weight - Package weight in pounds
 * @param {object} options - Additional options
 * @returns {Promise<object>} Rate quotes
 */
export async function getRates(fromZip, toZip, weight, options = {}) {
  const token = await authenticate();

  // Mock response if credentials not configured
  if (token === "MOCK_FEDEX_TOKEN") {
    return generateMockRates(fromZip, toZip, weight);
  }

  // Real FedEx API request structure
  const requestBody = {
    accountNumber: {
      value: config.accountNumber
    },
    requestedShipment: {
      shipper: {
        address: {
          postalCode: fromZip,
          countryCode: "US"
        }
      },
      recipient: {
        address: {
          postalCode: toZip,
          countryCode: "US"
        }
      },
      pickupType: "DROPOFF_AT_FEDEX_LOCATION",
      rateRequestType: ["ACCOUNT", "LIST"],
      requestedPackageLineItems: [
        {
          weight: {
            units: "LB",
            value: weight
          }
        }
      ]
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/rate/v1/rates/quotes`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-locale": "en_US"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    // Parse FedEx response
    return parseFedExRates(data);
  } catch (error) {
    console.error("FedEx getRates error:", error);
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
  if (token === "MOCK_FEDEX_TOKEN") {
    return generateMockLabel(orderData);
  }

  // Real FedEx label creation request
  const requestBody = {
    accountNumber: {
      value: config.accountNumber
    },
    requestedShipment: {
      shipper: {
        contact: {
          personName: orderData.shipper?.name || "ChickenToday",
          phoneNumber: orderData.shipper?.phone || "5551234567"
        },
        address: {
          streetLines: [orderData.shipper?.address || "123 Farm Road"],
          city: orderData.shipper?.city || "Newark",
          stateOrProvinceCode: orderData.shipper?.state || "NJ",
          postalCode: orderData.fromZip,
          countryCode: "US"
        }
      },
      recipient: {
        contact: {
          personName: orderData.customerName || "Customer",
          phoneNumber: orderData.customerPhone || "5559876543"
        },
        address: {
          streetLines: [orderData.customerAddress || "456 Main St"],
          city: orderData.customerCity || "New York",
          stateOrProvinceCode: orderData.customerState || "NY",
          postalCode: orderData.toZip,
          countryCode: "US"
        }
      },
      serviceType: orderData.serviceType || "FEDEX_GROUND",
      packagingType: "YOUR_PACKAGING",
      pickupType: "DROPOFF_AT_FEDEX_LOCATION",
      labelSpecification: {
        labelFormatType: "COMMON2D",
        imageType: "PDF",
        labelStockType: "PAPER_4X6"
      },
      requestedPackageLineItems: [
        {
          weight: {
            units: "LB",
            value: orderData.weight || 5
          }
        }
      ],
      shippingChargesPayment: {
        paymentType: "SENDER"
      }
    },
    labelResponseOptions: "URL_ONLY"
  };

  try {
    const response = await fetch(`${BASE_URL}/ship/v1/shipments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-locale": "en_US"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return parseFedExLabel(data);
  } catch (error) {
    console.error("FedEx createLabel error:", error);
    throw error;
  }
}

/**
 * Track shipment
 * @param {string} trackingNumber - FedEx tracking number
 * @returns {Promise<object>} Tracking information
 */
export async function track(trackingNumber) {
  const token = await authenticate();

  // Mock response if credentials not configured
  if (token === "MOCK_FEDEX_TOKEN") {
    return generateMockTracking(trackingNumber);
  }

  const requestBody = {
    includeDetailedScans: true,
    trackingInfo: [
      {
        trackingNumberInfo: {
          trackingNumber: trackingNumber
        }
      }
    ]
  };

  try {
    const response = await fetch(`${BASE_URL}/track/v1/trackingnumbers`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-locale": "en_US"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return parseFedExTracking(data);
  } catch (error) {
    console.error("FedEx track error:", error);
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
  if (token === "MOCK_FEDEX_TOKEN") {
    return { valid: true, address: address, confidence: "high" };
  }

  const requestBody = {
    addressesToValidate: [
      {
        address: {
          streetLines: [address.street],
          city: address.city,
          stateOrProvinceCode: address.state,
          postalCode: address.zip,
          countryCode: "US"
        }
      }
    ]
  };

  try {
    const response = await fetch(`${BASE_URL}/address/v1/addresses/resolve`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-locale": "en_US"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return parseFedExValidation(data);
  } catch (error) {
    console.error("FedEx validateAddress error:", error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

function generateMockRates(fromZip, toZip, weight) {
  const baseRate = 12 + (weight * 0.5);
  const distance = Math.abs(parseInt(fromZip) - parseInt(toZip)) / 1000;
  
  return {
    carrier: "FedEx",
    services: [
      {
        service: "FEDEX_GROUND",
        price: (baseRate + distance * 2).toFixed(2),
        deliveryDays: 3,
        currency: "USD"
      },
      {
        service: "FEDEX_2_DAY",
        price: (baseRate * 1.8 + distance * 3).toFixed(2),
        deliveryDays: 2,
        currency: "USD"
      },
      {
        service: "FEDEX_OVERNIGHT",
        price: (baseRate * 3.5 + distance * 5).toFixed(2),
        deliveryDays: 1,
        currency: "USD"
      }
    ],
    mock: true
  };
}

function generateMockLabel(orderData) {
  return {
    carrier: "FedEx",
    trackingNumber: `FX${Date.now().toString().slice(-10)}`,
    labelUrl: "https://example.com/label.pdf",
    cost: (15 + (orderData.weight || 5) * 0.5).toFixed(2),
    service: orderData.serviceType || "FEDEX_GROUND",
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    mock: true
  };
}

function generateMockTracking(trackingNumber) {
  return {
    carrier: "FedEx",
    trackingNumber: trackingNumber,
    status: "IN_TRANSIT",
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    events: [
      {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "PICKED_UP",
        location: "Newark, NJ"
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: "IN_TRANSIT",
        location: "Philadelphia, PA"
      }
    ],
    mock: true
  };
}

function parseFedExRates(data) {
  // TODO: Parse actual FedEx response when using real API
  return data;
}

function parseFedExLabel(data) {
  // TODO: Parse actual FedEx label response
  return data;
}

function parseFedExTracking(data) {
  // TODO: Parse actual FedEx tracking response
  return data;
}

function parseFedExValidation(data) {
  // TODO: Parse actual FedEx validation response
  return data;
}

export default {
  getRates,
  createLabel,
  track,
  validateAddress
};
