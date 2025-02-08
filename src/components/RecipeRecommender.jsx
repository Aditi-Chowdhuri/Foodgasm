import React, { useState } from 'react';
import { Upload, Button, Card, Checkbox, Input, Select, InputNumber, Row, Col, Form, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const RecipeRecommender = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleImageUpload = ({ file, fileList }) => {
    if (fileList.length > 5) {
      message.warning('Maximum 5 images allowed');
      return;
    }
    setImages(fileList);
    form.validateFields(['images']);
  };

  const handleRemoveImage = (file) => {
    const newFileList = images.filter((img) => img.uid !== file.uid);
    setImages(newFileList);
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
      Object.keys(values).forEach(key => {
        if (Array.isArray(values[key])) {
          formData.append(key, values[key].join(','));
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      message.success('Form submitted successfully! Check console for details.');
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
              label={<span>Upload Fridge Pictures <span style={{ color: 'red' }}>*</span> (Max 5)</span>} 
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
                {loading ? 'Submitting...' : 'Generate Recipe Recommendations'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default RecipeRecommender;
