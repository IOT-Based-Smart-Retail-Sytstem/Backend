import { GoogleGenerativeAI } from '@google/generative-ai';
import { getProductById, getAllProducts } from './product.service';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getProductRecommendations(currentProductId: string) {
  const currentProduct = await getProductById(currentProductId);
  const allProducts = await getAllProducts({});

  // Remove the current product from the list
  const otherProducts = allProducts.products.filter(p => p._id.toString() !== currentProductId);

  // Build a prompt
  const prompt = `
You are a helpful product recommendation engine.
Given the following product:
${JSON.stringify(currentProduct, null, 2)}

And this list of other products:
${JSON.stringify(otherProducts, null, 2)}

Recommend 3 products from the list that are most relevant or complementary to the current product. Return only their IDs in a JSON array.
`;

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  // Parse the response (should be a JSON array of IDs)
  let recommendedIds: string[] = [];
  try {
    recommendedIds = JSON.parse(response);
  } catch {
    // fallback: try to extract IDs from text
    recommendedIds = response.match(/"([a-f0-9]{24})"/g)?.map(id => id.replace(/"/g, '')) || [];
  }

  // Return the recommended product objects
  return otherProducts.filter(p => recommendedIds.includes(p._id.toString()));
}