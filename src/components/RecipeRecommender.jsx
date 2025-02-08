import React, { useState } from 'react';
import { Upload, Button, Card, Checkbox, Input, Select, InputNumber, Row, Col, Form } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const RecipeRecommender = () => {
  const [images, setImages] = useState([]);
  const [form] = Form.useForm();

  const handleImageUpload = ({ file, fileList }) => {
    if (fileList.length > 5) {
      return;
    }
    setImages(fileList);
  };

  const handleRemoveImage = (file) => {
    setImages((prev) => prev.filter((img) => img.uid !== file.uid));
  };

  const handleSubmit = (values) => {
    console.log('Form submitted:', { images, values });
  };

  return (
    <Row justify="center">
      <Col span={16}>
        <Card title="Smart Recipe Recommender">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Image Upload */}
            <Form.Item label="Upload Fridge Pictures (Max 5)">
              <Upload
                listType="picture-card"
                beforeUpload={() => false}
                onChange={handleImageUpload}
                onRemove={handleRemoveImage}
                multiple
                fileList={images}
              >
                {images.length < 5 && <UploadOutlined />}
              </Upload>
            </Form.Item>

            {/* Additional Ingredients */}
            <Form.Item label="Additional Ingredients" name="additionalIngredients">
              <TextArea rows={3} placeholder="Enter ingredients not visible in the photos..." />
            </Form.Item>

            {/* Dietary Restrictions */}
            <Form.Item label="Dietary Restrictions" name="dietaryRestrictions">
              <Checkbox.Group>
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal', 'Kosher', 'Low-Carb'].map(
                  (restriction) => (
                    <Checkbox key={restriction} value={restriction.toLowerCase()}>
                      {restriction}
                    </Checkbox>
                  )
                )}
              </Checkbox.Group>
            </Form.Item>

            {/* Calories, Meals, Servings */}
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

            {/* Dropdowns */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Preferred Cuisine" name="cuisine">
                  <Select placeholder="Select Cuisine">
                    {['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai', 'Mediterranean', 'American', 'French', 'Korean'].map(
                      (cuisine) => (
                        <Option key={cuisine} value={cuisine.toLowerCase()}>
                          {cuisine}
                        </Option>
                      )
                    )}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Meal Type" name="mealType">
                  <Select placeholder="Select Meal Type">
                    {['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snack', 'Dessert'].map((type) => (
                      <Option key={type} value={type.toLowerCase()}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Cooking Skill Level" name="cookingSkill" initialValue="intermediate">
                  <Select>
                    <Option value="beginner">Beginner</Option>
                    <Option value="intermediate">Intermediate</Option>
                    <Option value="advanced">Advanced</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Cooking Time */}
            <Form.Item label="Maximum Cooking Time" name="cookingTime">
              <Select>
                <Option value="">Any Duration</Option>
                <Option value="15">15 minutes or less</Option>
                <Option value="30">30 minutes or less</Option>
                <Option value="45">45 minutes or less</Option>
                <Option value="60">1 hour or less</Option>
                <Option value="90">1.5 hours or less</Option>
                <Option value="120">2 hours or less</Option>
              </Select>
            </Form.Item>

            {/* Submit Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Generate Recipe Recommendations
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default RecipeRecommender;