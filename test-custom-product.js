const axios = require('axios');

async function testCustomProduct() {
  try {
    console.log('Testing custom product creation...');
    
    const testProduct = {
      name: "Thú nhồi bông tùy chỉnh",
      description: "Thú nhồi bông tùy chỉnh với medium kích thước",
      price: 299000,
      type: "custom",
      rating: 0,
      reviews: 0,
      sold: 0,
      stock: 1,
      featured: false,
      specifications: {
        body: "Thân thường",
        ears: "Tai thường",
        eyes: "Mắt thường",
        nose: "",
        mouth: "",
        furColor: "",
        clothing: null,
        accessories: [],
        size: "medium"
      },
      isCustom: true,
      customData: {
        parts: {
          body: "test-body-id",
          ears: "test-ears-id",
          eyes: "test-eyes-id",
          nose: "",
          mouth: "",
          furColor: "",
          clothing: "",
          accessories: [],
          name: "",
          size: "medium"
        },
        canvasJSON: {}
      }
    };
    
    console.log('Sending test product:', JSON.stringify(testProduct, null, 2));
    
    const response = await axios.post('http://localhost:5000/api/products/custom', testProduct, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Success! Product created:', response.data);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCustomProduct(); 