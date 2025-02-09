import React, { useState } from 'react';
import { Upload, Button, Card, Checkbox, Input, InputNumber, Row, Col, Form, message, Modal, Radio } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from "axios";

const { TextArea } = Input;

const RecipeRecommender = () => {
  const [images, setImages] = useState([]);
  const [imagesBase64, setImagesBase64] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchedIngredients, setFetchedIngredients] = useState('');
  const [fetchingIngredients, setFetchingIngredients] = useState(false);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeDetails, setRecipeDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [memeUrl, setMemeUrl] = useState(null);
  const [showMemeModal, setShowMemeModal] = useState(false);
  const [form] = Form.useForm();

  // Meme generation function
  const generateMeme = async (text, templateUrl) => {
    const url = "https://api.memenome.ai/memes";
    const apiKey = "88ff86bc-a9fe-4c1f-9b5f-6ccbe6ea89e4";
    
    const payload = {
      message: {
        type: "text",
        text: text,
      },
      template: {
        url: templateUrl,
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      // I need to fetch image from response. It is not a json response.
      const data = await response.blob();
      // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onload = () => {
            const base64data = reader.result;
            console.log(base64data);
            setMemeUrl(base64data);
        }
        setShowMemeModal(true);
        
      return data;
    } catch (error) {
      console.error("Error generating meme:", error);
      return null;
    }
  };

  const handleFetchIngredients = async () => {
    if (imagesBase64.length === 0) {
      message.error('Please upload at least one image before fetching ingredients');
      return;
    }

    try {
      setFetchingIngredients(true);
      const l1_response = await axios.post(
        'http://localhost:8000/errordetection',
        {
          images: JSON.stringify(imagesBase64.map(e => e.split(',')[1])),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(l1_response.data);

      if (l1_response.data.status === false) {
        message.error('No food detected in the images');
        // Generate and show meme
        const memeResult = await generateMeme(
          "No food, sleep",
          "https://meme0-prod.sfo3.cdn.digitaloceanspaces.com/templates/7dfc01cb-2c49-41dc-82e9-fe590f45be3d.png"
        );
        // if (memeResult) {
        //   setMemeUrl(memeResult.image_url);
        //   setShowMemeModal(true);
        // }
        setFetchingIngredients(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:8000/ingredients',
        {
          images: JSON.stringify(imagesBase64.map(e => e.split(',')[1])),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      setFetchedIngredients(response.data.ingredients || JSON.stringify(response.data));
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch ingredients');
    } finally {
      setFetchingIngredients(false);
    }
  };

  const handleImageUpload = ({ file, fileList }) => {
    if (fileList.length > 5) {
      message.warning('Maximum 5 images allowed');
      return;
    }
    setImages(fileList);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64data = reader.result;
      setImagesBase64([...imagesBase64, base64data]);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    form.validateFields(['images']);
  };

  const handleRemoveImage = (file) => {
    const index = images.findIndex((img) => img.uid === file.uid);
    if (index > -1) {
      images.splice(index, 1);
      imagesBase64.splice(index, 1);
      setImages([...images]);
      setImagesBase64([...imagesBase64]);
    }
    form.validateFields(['images']);
  };

  const handleSubmit = async (values) => {
    if (images.length === 0) {
      message.error('Please upload at least one image');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`image${index}`, image.originFileObj);
      });
      Object.keys(values).forEach((key) => {
        if (Array.isArray(values[key])) {
          formData.append(key, values[key].join(','));
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      const dietaryRestrictions = formData.get('dietaryRestrictions') ? formData.get('dietaryRestrictions') : "None";
      const addIngredients = formData.get('additionalIngredients') ? formData.get('additionalIngredients') : "";

      const data = {
        calories: formData.get('caloriesPerMeal')?.toString() || "",
        servings: formData.get('servings')?.toString() || "2",
        meals: formData.get('numberOfMeals')?.toString() || "1",
        additional: addIngredients,
        restrictions: dietaryRestrictions,
        ingredients: fetchedIngredients
      }

      const response = await axios.post(
        'http://localhost:8000/recommend',
        {
          data: JSON.stringify(data),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const recipes = response.data.recipes || [];
      setRecommendedRecipes(recipes);
      message.success('Recipes fetched successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Failed to fetch recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSelection = async (recipeName) => {
    setSelectedRecipe(recipeName);
    try {
      setLoadingDetails(true);
      setIsModalVisible(true);
      
      const response = await axios.post(
        'http://localhost:8000/recipe-details',
        {
          recipe: recipeName,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setRecipeDetails(response.data);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      message.error('Failed to fetch recipe details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setRecipeDetails(null);
    setSelectedRecipe(null);
  };

  return (
    <Row justify="center">
      <Col span={16}>
        <Card title="Smart Recipe Recommender">
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleSubmit}
            initialValues={{
              servings: 2,
              numberOfMeals: 1,
              cookingSkill: 'intermediate'
            }}
          >
            <Form.Item 
              label={
                <span>
                Please Upload Available Ingredients Pictures <span style={{ color: 'red' }}>*</span> (Max 5)
              </span>
              } 
              name="images"
              rules={[
                {
                  required: true,
                  validator: async () => {
                    if (images.length === 0) {
                      throw new Error('Please upload at least one image');
                    }
                  },
                },
              ]}
            >
              <Upload
                listType="picture-card"
                beforeUpload={() => false}
                onChange={handleImageUpload}
                onRemove={handleRemoveImage}
                multiple
                fileList={images}
              >
                {images.length < 5 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload (Required)</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                onClick={handleFetchIngredients} 
                loading={fetchingIngredients}
              >
                {fetchingIngredients ? 'Fetching Ingredients...' : 'Fetch Ingredients'}
              </Button>
            </Form.Item>

            <Form.Item label="Fetched Ingredients">
              <TextArea rows={3} value={fetchedIngredients} readOnly />
            </Form.Item>

            <Form.Item label="Additional Ingredients" name="additionalIngredients">
              <TextArea rows={3} placeholder="Enter ingredients not visible in the photos..." />
            </Form.Item>

            <Form.Item label="Dietary Restrictions" name="dietaryRestrictions">
              <Checkbox.Group>
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal', 'Kosher', 'Low-Carb'].map((restriction) => (
                  <Checkbox key={restriction} value={restriction.toLowerCase()}>
                    {restriction}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Calories per Meal" name="caloriesPerMeal">
                  <InputNumber min={500} max={5000} placeholder="e.g., 500" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Number of Meals" name="numberOfMeals" initialValue={1}>
                  <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Servings" name="servings" initialValue={2}>
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                {loading ? 'Fetching Recommendations...' : 'Generate Recipe Recommendations'}
              </Button>
            </Form.Item>
          </Form>

          {recommendedRecipes.length > 0 && (
            <Card title="Recommended Recipes" style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 16 }}>
                Found {recommendedRecipes.length} recommendations
              </div>
              <Radio.Group 
                onChange={(e) => handleRecipeSelection(e.target.value)}
                value={selectedRecipe}
              >
                <Row gutter={[0, 16]}>
                  {recommendedRecipes.map((recipe, index) => (
                    <Col span={24} key={index}>
                      <Radio value={recipe} style={{ width: '100%', padding: '8px' }}>
                        {recipe}
                      </Radio>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>
            </Card>
          )}

          {/* Recipe Details Modal */}
          <Modal
            title={selectedRecipe}
            open={isModalVisible}
            onCancel={handleModalClose}
            footer={[
              <Button key="close" onClick={handleModalClose}>
                Close
              </Button>
            ]}
            width={800}
          >
            {loadingDetails ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Loading recipe details...
              </div>
            ) : recipeDetails ? (
              <div>
                <h3>Ingredients</h3>
                <ul>
                  {recipeDetails.ingredients?.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
                
                <h3>Instructions</h3>
                <ol>
                  {recipeDetails.instructions?.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>

                {recipeDetails.nutritionalInfo && (
                  <>
                    <h3>Nutritional Information</h3>
                    <ul>
                      {Object.entries(recipeDetails.nutritionalInfo).map(([key, value]) => (
                        <li key={key}>{`${key}: ${value}`}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ) : (
              <div>No recipe details available</div>
            )}
          </Modal>

          {/* Meme Modal */}
          <Modal
            title="No Food Detected"
            open={showMemeModal}
            onCancel={() => setShowMemeModal(false)}
            footer={[
                <Button key="close" onClick={() => setShowMemeModal(false)}>
                Close
                </Button>
            ]}
            >
            {memeUrl && (
                <div style={{ textAlign: 'center' }}>
                <img 
                    src={`${memeUrl}`} // Ensure correct base64 format
                    alt="No food meme" 
                    style={{ maxWidth: '100%', height: 'auto' }} 
                />
                </div>
            )}
          </Modal>

        </Card>
      </Col>
    </Row>
  );
};

export default RecipeRecommender;