[![forthebadge made-with-python](http://ForTheBadge.com/images/badges/made-with-python.svg)](https://www.python.org/)
<a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React%20JS-v17.0.2-blue?style=for-the-badge&logo=react" /></a>
<a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-v0.70-blue?style=for-the-badge&logo=fastapi" /></a>

**FoodGasm: AI-Powered Recipe Suggestions from Fridge Images** is an innovative solution designed to help users make the most out of their available ingredients. Leveraging cutting-edge computer vision and natural language processing, FoodGasm detects ingredients from fridge images and generates personalized recipe recommendations—all while considering dietary restrictions and calorie goals.

---

✅ **Groq LLM-Powered Recipe Generation** – Faster and more accurate than conventional LLMs.  
✅ **Memenome.ai for Fun Error Handling** – Turning failures into an engaging experience.  


## **Problem Statement**  
Many people struggle with deciding what to cook based on the ingredients they have. Food waste is a major issue, and manually searching for recipes that match available ingredients can be time-consuming. Additionally, people with specific dietary restrictions or calorie goals often find it difficult to filter recipes that align with their needs.

## **How is it Useful?**  
- **Reduces Food Waste**: Helps users utilize available ingredients efficiently, minimizing waste.  
- **Saves Time**: Eliminates the need for manual recipe searches by providing instant, AI-driven suggestions.  
- **Personalized Meal Planning**: Adapts to user preferences, including dietary restrictions (e.g., vegetarian, keto, gluten-free) and calorie goals.  
- **Enhances Creativity**: Suggests diverse meal ideas and even generates new recipes based on ingredient combinations.  
- **Health-Conscious Recommendations**: Ensures meals align with calorie limits and nutritional needs.

## **Business Logic**  
1. **Image Recognition**:  
   - The app processes an image of the fridge using AI to detect and classify visible ingredients.

2. **Ingredient Processing with LLM**:  
   - The identified ingredients are fed into a Large Language Model (LLM), which suggests relevant recipes based on available items.  
   - The LLM takes into account:  
     - **User Dietary Restrictions** (e.g., vegan, low-carb, nut-free).  
     - **Calorie Requirements**, filtering or adjusting recipes accordingly.  
     - **Cuisine Preferences** (e.g., Italian, Asian, Mediterranean).  
     - **Cooking Constraints** (e.g., quick meals, one-pot dishes).

3. **Smart Recipe Generation & Enhancement**:  
   - If no exact match is found, the LLM can generate entirely new recipes based on ingredient combinations and culinary expertise.  
   - The model also suggests substitutions for missing ingredients or healthier alternatives.

4. **Nutritional Breakdown**:  
   - The app calculates approximate calorie counts for each suggested recipe.  
   - Users can modify portions or ingredients to better meet their dietary goals.

## **Tech Stack**  
- **Frontend**:  
  - **React JS** for building a responsive and dynamic web application.
  
- **Backend**:  
  - **FastAPI** for creating a high-performance, Python-based API service.
  
- **AI & Image Processing**:  
  - **Computer Vision**: Microsoft Phi 3.5 Vision Instruct for ingredient recognition.  
  - **Recipe Suggestion**: Large Language Model (LLM) such as OpenAI's GPT, Llama, or a fine-tuned transformer model.  
  - **Calorie & Nutrition Analysis**: LLM-based estimation.

---

*By integrating advanced AI, dietary filters, and nutritional tracking, FoodGasm offers a personalized, health-conscious, and intelligent recipe recommendation system—helping users cook smarter, waste less, and eat healthier.*
