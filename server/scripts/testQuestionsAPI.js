/**
 * This script tests the questions API directly
 * Run this from the server directory to check if the API is working
 */
const fetch = require('node-fetch');

async function testQuestionsAPI() {
  try {
    console.log('Testing questions API...');
    
    // Test data
    const testData = {
      testType: 'quiz',
      topics: ['Algebra', 'Advanced Math'],
      count: 5
    };
    
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    // Make the API call
    const response = await fetch('http://localhost:3001/api/questions/fetch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add a dummy token for testing
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(testData)
    });
    
    // Get the response data
    const responseStatus = response.status;
    let responseData;
    
    try {
      responseData = await response.json();
    } catch (err) {
      responseData = { error: 'Failed to parse response as JSON' };
    }
    
    // Log the results
    console.log('Response status:', responseStatus);
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('API test successful!');
    } else {
      console.log('API test failed.');
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the test
testQuestionsAPI();
