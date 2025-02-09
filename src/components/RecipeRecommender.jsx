import React, { useState, useCallback } from 'react';
import { Upload, Button, Card, Checkbox, Input, Select, InputNumber, Row, Col, Form, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from "axios";

const { TextArea } = Input;
const { Option } = Select;

const RecipeRecommender = () => {
  const [images, setImages] = useState([]);
  const [imagesBase64, setImagesBase64] = useState([]);
  const [loading, setLoading] = useState(false);
  // State to store ingredients fetched from the backend
  const [fetchedIngredients, setFetchedIngredients] = useState('');
  const [fetchingIngredients, setFetchingIngredients] = useState(false);
  const [form] = Form.useForm();

  // Existing function (used on form submission) remains unchanged
  const findErrors = useCallback(() => {
    console.log(imagesBase64);
    async function run() {
      axios
        .post(
          'http://localhost:8000/errordetection',
          {
            images: JSON.stringify(imagesBase64.map(e => e.split(',')[1])),
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    run();
  }, [images, imagesBase64]);

  // New function to fetch ingredients and update the state to display them
  const handleFetchIngredients = async () => {
    if (imagesBase64.length === 0) {
      message.error('Please upload at least one image before fetching ingredients');
      return;
    }
    try {
      setFetchingIngredients(true);
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
      console.log(response.data);
      // Assuming the API returns an object with an "ingredients" field.
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
      // Append the new base64 string to the existing array.
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
      console.log('Form Values:', values);
      console.log('Images:', images);

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

      console.log(formData.get('caloriesPerMeal'));
      console.log(formData.get('servings'));
      console.log(formData.get('numberOfMeals'));

      const dietaryRestrictions = formData.get('dietaryRestrictions') ? formData.get('dietaryRestrictions') : "None";
      const addIngredients = formData.get('additionalIngredients') ? formData.get('additionalIngredients') : "";

      console.log('Dietary Restrictions:', dietaryRestrictions);
      console.log('Additional Ingredients:', addIngredients);

      const data = {
        calories: formData.get('caloriesPerMeal').toString(),
        servings: formData.get('servings').toString(),
        meals: formData.get('numberOfMeals').toString(),
        additional: addIngredients,
        restrictions: dietaryRestrictions,
        ingredients: fetchedIngredients
      }

      console.log('Data:', data);

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
      ).then((response) => {
        console.log(response.data);
      }).then((error) => {
        console.error(error);
      });

      message.success('Form submitted successfully! Check console for details.');

      // Optionally, call the function that processes images on form submission.
      findErrors();
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
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
                  Upload Fridge Pictures <span style={{ color: 'red' }}>*</span> (Max 5)
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

            {/* Updated button with type="primary" to make it blue */}
            <Form.Item>
              <Button 
                type="primary" 
                onClick={handleFetchIngredients} 
                loading={fetchingIngredients}
              >
                {fetchingIngredients ? 'Fetching Ingredients...' : 'Fetch Ingredients'}
              </Button>
            </Form.Item>

            {/* Text area to display the fetched ingredients */}
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
                  <InputNumber min={0} placeholder="e.g., 500" style={{ width: '100%' }} />
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
        </Card>
      </Col>
    </Row>
  );
};

export default RecipeRecommender;
