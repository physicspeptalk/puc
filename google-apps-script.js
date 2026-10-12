/**
 * Google Apps Script Web App for KCET Counselling Website
 * 
 * This script reads data from a Google Spreadsheet with two tabs:
 * 1. "Config" - Website configuration variables
 * 2. "Testimonials" - YouTube testimonial videos
 * 
 * Deploy as a Web App with "Execute as: Me" and "Who has access: Anyone"
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Spreadsheet
 * 2. Create two tabs: "Config" and "Testimonials"
 * 3. In Config tab, create columns: Variable | Value
 * 4. In Testimonials tab, create columns: youtube_url | title
 * 5. Replace SPREADSHEET_ID below with your actual spreadsheet ID
 * 6. Deploy this script as a Web App
 * 7. Update the GOOGLE_APPS_SCRIPT_URL in your React app
 */

// Replace this with your actual Google Spreadsheet ID
const SPREADSHEET_ID = '1EuSO73A5Y8SpEqnvCoMcGusNnV3y_3vEaaj8-j-geEM';

function doGet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Read Config tab
    const configData = readConfigTab(spreadsheet);
    
    // Read Testimonials tab
    const testimonialsData = readTestimonialsTab(spreadsheet);
    
    const response = {
      success: true,
      config: configData,
      testimonials: testimonialsData,
      timestamp: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    console.error('Error in doGet:', error);
    
    const errorResponse = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*'
      });
  }
}

function readConfigTab(spreadsheet) {
  try {
    const configSheet = spreadsheet.getSheetByName('Config');
    if (!configSheet) {
      throw new Error('Config sheet not found');
    }
    
    const data = configSheet.getDataRange().getValues();
    if (data.length < 2) {
      return {}; // No data rows
    }
    
    const config = {};
    
    // Skip header row, process data rows
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const variable = String(row[0]).trim();
      const value = String(row[1]).trim();
      
      if (variable && value) {
        config[variable] = value;
      }
    }
    
    return config;
    
  } catch (error) {
    console.error('Error reading Config tab:', error);
    return {};
  }
}

function readTestimonialsTab(spreadsheet) {
  try {
    const testimonialsSheet = spreadsheet.getSheetByName('Testimonials');
    if (!testimonialsSheet) {
      return []; // Sheet doesn't exist yet
    }
    
    const data = testimonialsSheet.getDataRange().getValues();
    if (data.length < 2) {
      return []; // No data rows
    }
    
    const testimonials = [];
    
    // Skip header row, process data rows
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const youtubeUrl = String(row[0]).trim();
      const title = String(row[1]).trim();
      
      if (youtubeUrl && isValidYouTubeUrl(youtubeUrl)) {
        testimonials.push({
          youtube_url: youtubeUrl,
          title: title || 'Testimonial',
          youtube_id: extractYouTubeId(youtubeUrl)
        });
      }
    }
    
    return testimonials;
    
  } catch (error) {
    console.error('Error reading Testimonials tab:', error);
    return [];
  }
}

function isValidYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
  ];
  
  return patterns.some(pattern => pattern.test(url));
}

function extractYouTubeId(url) {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Test function - you can run this in the Apps Script editor to test
function testFunction() {
  const result = doGet();
  console.log(result.getContent());
}