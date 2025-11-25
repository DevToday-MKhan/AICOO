/**
 * DHL Carrier API Integration
 * Official API Documentation: https://developer.dhl.com/api-reference/dhl-express-mydhl-api
 * 
 * Uses DHL Express MyDHL API (Basic Auth + API Key)
 * Supports: Rate Shopping, Label Creation, Tracking, Address Validation
 */

import dotenv from "dotenv";
dotenv.config();

const DHL_BASE_URL = "https://express.api.dhl.com"; // Production
const DHL_TEST_URL = "https://express.api.dhl.com/mydhlapi/test"; // Sandbox

// Get environment variables
const config = {
  apiKey: process.env.DHL_API_KEY || "TODO_ADD_DHL_API_KEY",
  apiSecret: process.env.DHL_API_SECRET || "TODO_ADD_DHL_API_SECRET",
  accountNumber: process.env.DHL_ACCOUNT_NUMBER || "TODO_ADD_ACCOUNT_NUMBER",
  useSandbox: process.env.DHL_USE_SANDBOX !== "false" // Default to sandbox
};

const BASE_URL = config.useSandbox ? DHL_TEST_URL : DHL_BASE_URL;

/**
 * Get Basic Auth header
 * @returns {string} Basic auth header value
 */
function getAuthHeader() {
  if (config.apiKey.startsWith("TODO_")) {
    return "MOCK_DHL_AUTH";
  }
  const credentials = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64");
  return `Basic ${credentials}`;
}

/**
 * Get shipping rates from DHL
 * @param {string} fromZip - Origin ZIP code
 * @param {string} toZip - Destination ZIP code
 * @param {number} weight - Package weight in pounds
 * @param {object} options - Additional options
 * @returns {Promise<object>} Rate quotes
 */
export async function getRates(fromZip, toZip, weight, options = {}) {
  const auth = getAuthHeader();

  // Mock response if credentials not configured
  if (auth === "MOCK_DHL_AUTH") {
    console.warn("⚠️ DHL API credentials not configured. Using mock mode.");
    return generateMockRates(fromZip, toZip, weight);
  }

  // Convert pounds to kilograms (DHL uses metric)
  const weightKg = (weight * 0.453592).toFixed(2);

  // Real DHL API request structure
  const requestBody = {
    customerDetails: {
      shipperDetails: {
        postalCode: fromZip,
        countryCode: "US"
      },
      receiverDetails: {
        postalCode: toZip,
        countryCode: "US"
      }
    },
    accounts: [
      {
        typeCode: "shipper",
        number: config.accountNumber
      }
    ],
    plannedShippingDateAndTime: new Date().toISOString(),
    unitOfMeasurement: "metric",
    isCustomsDeclarable: false,
    packages: [
      {
        weight: parseFloat(weightKg),
        dimensions: {
          length: 10,
          width: 10,
          height: 10
        }
      }
    ]
  };

  try {
    const response = await fetch(`${BASE_URL}/rates`, {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return parseDHLRates(data);
  } catch (error) {
    console.error("DHL getRates error:", error);
    throw error;
  }
}

/**
 * Create shipping label
 * @param {object} orderData - Order details
 * @returns {Promise<object>} Label data with tracking number
 */
export async function createLabel(orderData) {
  const auth = getAuthHeader();

  // Mock response if credentials not configured
  if (auth === "MOCK_DHL_AUTH") {
    return generateMockLabel(orderData);
  }

  // Convert pounds to kilograms
  const weightKg = ((orderData.weight || 5) * 0.453592).toFixed(2);

  // Real DHL label creation request
  const requestBody = {
    plannedShippingDateAndTime: new Date().toISOString(),
    pickup: {
      isRequested: false
    },
    productCode: orderData.productCode || "N", // DHL Express Domestic
    accounts: [
      {
        typeCode: "shipper",
        number: config.accountNumber
      }
    ],
    customerDetails: {
      shipperDetails: {
        postalAddress: {
          postalCode: orderData.fromZip,
          cityName: orderData.shipper?.city || "Newark",
          countryCode: "US",
          addressLine1: orderData.shipper?.address || "123 Farm Road"
        },
        contactInformation: {
          companyName: orderData.shipper?.name || "ChickenToday",
          fullName: orderData.shipper?.name || "ChickenToday",
          phone: orderData.shipper?.phone || "5551234567"
        }
      },
      receiverDetails: {
        postalAddress: {
          postalCode: orderData.toZip,
          cityName: orderData.customerCity || "New York",
          countryCode: "US",
          addressLine1: orderData.customerAddress || "456 Main St"
        },
        contactInformation: {
          fullName: orderData.customerName || "Customer",
          phone: orderData.customerPhone || "5559876543"
        }
      }
    },
    content: {
      packages: [
        {
          weight: parseFloat(weightKg),
          dimensions: {
            length: 10,
            width: 10,
            height: 10
          }
        }
      ],
      isCustomsDeclarable: false,
      description: orderData.description || "Fresh Chicken Products",
      incoterm: "DAP",
      unitOfMeasurement: "metric"
    },
    outputImageProperties: {
      imageOptions: [
        {
          typeCode: "label",
          templateName: "ECOM26_84_001"
        }
      ]
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/shipments`, {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return parseDHLLabel(data);
  } catch (error) {
    console.error("DHL createLabel error:", error);
    throw error;
  }
}

/**
 * Track shipment
 * @param {string} trackingNumber - DHL tracking number
 * @returns {Promise<object>} Tracking information
 */
export async function track(trackingNumber) {
  const auth = getAuthHeader();

  // Mock response if credentials not configured
  if (auth === "MOCK_DHL_AUTH") {
    return generateMockTracking(trackingNumber);
  }

  try {
    const response = await fetch(`${BASE_URL}/tracking?trackingNumber=${trackingNumber}`, {
      method: "GET",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    return parseDHLTracking(data);
  } catch (error) {
    console.error("DHL track error:", error);
    throw error;
  }
}

/**
 * Validate address
 * @param {object} address - Address to validate
 * @returns {Promise<object>} Validated address
 */
export async function validateAddress(address) {
  const auth = getAuthHeader();

  // Mock response if credentials not configured
  if (auth === "MOCK_DHL_AUTH") {
    return { valid: true, address: address, confidence: "high" };
  }

  const requestBody = {
    type: "delivery",
    strictValidation: false,
    validateAddress: {
      postalCode: address.zip,
      cityName: address.city,
      countryCode: "US",
      addressLine1: address.street
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/address-validate`, {
      method: "POST",
      headers: {
        "Authorization": auth,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return parseDHLValidation(data);
  } catch (error) {
    console.error("DHL validateAddress error:", error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

function generateMockRates(fromZip, toZip, weight) {
  const baseRate = 13 + (weight * 0.55);
  const distance = Math.abs(parseInt(fromZip) - parseInt(toZip)) / 1000;
  
  return {
    carrier: "DHL",
    services: [
      {
        service: "DHL_DOMESTIC",
        price: (baseRate + distance * 2.2).toFixed(2),
        deliveryDays: 3,
        currency: "USD"
      },
      {
        service: "DHL_EXPRESS",
        price: (baseRate * 2.0 + distance * 3.5).toFixed(2),
        deliveryDays: 2,
        currency: "USD"
      },
      {
        service: "DHL_EXPRESS_OVERNIGHT",
        price: (baseRate * 3.8 + distance * 5.5).toFixed(2),
        deliveryDays: 1,
        currency: "USD"
      }
    ],
    mock: true
  };
}

function generateMockLabel(orderData) {
  return {
    carrier: "DHL",
    trackingNumber: `DHL${Date.now().toString().slice(-12)}`,
    labelUrl: "https://example.com/label.pdf",
    cost: (16 + (orderData.weight || 5) * 0.55).toFixed(2),
    service: orderData.productCode || "DHL_DOMESTIC",
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    mock: true
  };
}

function generateMockTracking(trackingNumber) {
  return {
    carrier: "DHL",
    trackingNumber: trackingNumber,
    status: "TRANSIT",
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    events: [
      {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "PICKUP",
        location: "Newark, NJ, USA"
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: "TRANSIT",
        location: "Philadelphia, PA, USA"
      }
    ],
    mock: true
  };
}

function parseDHLRates(data) {
  // TODO: Parse actual DHL response when using real API
  return data;
}

function parseDHLLabel(data) {
  // TODO: Parse actual DHL label response
  return data;
}

function parseDHLTracking(data) {
  // TODO: Parse actual DHL tracking response
  return data;
}

function parseDHLValidation(data) {
  // TODO: Parse actual DHL validation response
  return data;
}

export default {
  getRates,
  createLabel,
  track,
  validateAddress
};
