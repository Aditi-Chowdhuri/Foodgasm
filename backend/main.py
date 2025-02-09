from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel

import json

from PIL import Image 
from io import BytesIO
import base64
import requests 
from transformers import AutoModelForCausalLM 
from transformers import AutoProcessor 

model_id = "microsoft/Phi-3.5-vision-instruct" 

# # Note: set _attn_implementation='eager' if you don't have flash_attn installed
# model = AutoModelForCausalLM.from_pretrained(
#   model_id, 
#   device_map="cuda", 
#   trust_remote_code=True, 
#   torch_dtype="auto", 
#   _attn_implementation='eager'    
# )

# # for best performance, use num_crops=4 for multi-frame, num_crops=16 for single-frame.
# processor = AutoProcessor.from_pretrained(model_id, 
#   trust_remote_code=True, 
#   num_crops=4
# ) 

# Load the model and processor during startup once per worker
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic here
    app.state.model = AutoModelForCausalLM.from_pretrained(
        model_id, 
        device_map="cuda", 
        trust_remote_code=True, 
        torch_dtype="auto", 
        _attn_implementation='eager'
    )
    app.state.processor = AutoProcessor.from_pretrained(
        model_id, 
        trust_remote_code=True, 
        num_crops=4
    )
    yield
    # Shutdown logic here
    print("Cleaning up resources...")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImagePayload(BaseModel):
    images: str  # base64 encoded image string

class IngredientPayload(BaseModel):
    data: str

@app.post("/errordetection")
def process_images(payload: ImagePayload):
    images = json.loads(payload.images)

    placeholder = ""

    images_pil = []
    for i, image in enumerate(images):
        images_pil.append(Image.open(BytesIO(base64.b64decode(image))))

        placeholder += f"<|image_{i + 1}|>\n"

    errorMsgSystem = '''
    You are an AI assistant that helps users find if there is edible food in an image. It can be in form of fruits or vegetables outside or inside a fridge.
    Always return correct and valid JSON output. The JSON should have a key "status" which is a boolean and a key "message" which is a string.

    Return a JSON as output such that the only valid ouputs are: 
    1. { "status": false, "message": "NO_FOOD" }
    2. { "status": true, "message": "OK" }

    Remember that status can be "true" only when message is "OK". The JSON should be plain string not styled for markdown for API call purposes.
    '''
    # 2. { "status": false, "message": "CLOSED_FRIDGE" }
    # 3. { "status": false, "message": "EMPTY_FRIDGE" }
    # 4. { "status": false, "message": "INVALID_IMAGE" }

    messages = [
        {"role": "user", "content": placeholder+errorMsgSystem},
    ]

    prompt = app.state.processor.tokenizer.apply_chat_template(
        messages, 
        tokenize=False, 
        add_generation_prompt=True
    )

    inputs = app.state.processor(prompt, images_pil, return_tensors="pt").to("cuda:0") 

    generation_args = { 
        "max_new_tokens": 1000, 
        "temperature": 0.0, 
        "do_sample": False, 
    } 

    generate_ids = app.state.model.generate(**inputs, 
        eos_token_id=app.state.processor.tokenizer.eos_token_id, 
        **generation_args
    )

    # remove input tokens 
    generate_ids = generate_ids[:, inputs['input_ids'].shape[1]:]
    response = app.state.processor.batch_decode(generate_ids, 
    skip_special_tokens=True, 
    clean_up_tokenization_spaces=False)[0] 

    if response.startswith("```json"):
        response = response[7:]
    if response.endswith("```"):
        response = response[:-3]

    return json.loads(response)

@app.post('/ingredients')
def process_ingredients(payload: ImagePayload):
    images = json.loads(payload.images)

    placeholder = ""

    images_pil = []
    for i, image in enumerate(images):
        images_pil.append(Image.open(BytesIO(base64.b64decode(image))))

        placeholder += f"<|image_{i + 1}|>\n"

    errorMsgSystem = '''
    You are an AI assistant that helps users find ingredients in an image. 
    Always return correct and valid JSON output. The JSON should have a key "ingredients" which is an array of strings.

    Return a JSON as output such that the only valid outputs are: 
    1. { "ingredients": ["apple", "banana", "carrot"] }
    2. { "ingredients": ["avocado"] }
    3. { "ingredients": [] }
    4. { "ingredients": ["egg", "milk", "apple", "tomato"] }

    Some examples of invalid outputs are:
    1. { "ingredients": ["apple", "apple"] } - DO NOT REPEAT INGREDIENTS. MAKE SURE TO ONLY PROVIDE UNIQUE INGREDIENTS.
    2. { "ingredients": ["apple", "banana", "carrot", "apple"] } - REPEATED
    3. The ingredients array should not have more than 15 ingredients. - HAVE A MAXIMUM OF 15 INGREDIENTS.

    DO NOT REPEAT INGREDIENTS. MAKE SURE TO ONLY PROVIDE UNIQUE INGREDIENTS. HAVE A MAXIMUM OF 15 INGREDIENTS. 
    '''
    # 2. { "status": false, "message": "CLOSED_FRIDGE" }
    # 3. { "status": false, "message": "EMPTY_FRIDGE" }
    # 4. { "status": false, "message": "INVALID_IMAGE" }

    messages = [
        {"role": "user", "content": placeholder+errorMsgSystem},
    ]

    prompt = app.state.processor.tokenizer.apply_chat_template(
        messages, 
        tokenize=False, 
        add_generation_prompt=True
    )

    inputs = app.state.processor(prompt, images_pil, return_tensors="pt").to("cuda:0") 

    generation_args = { 
        "max_new_tokens": 1000, 
        "temperature": 0.0, 
        "do_sample": False, 
    } 

    generate_ids = app.state.model.generate(**inputs, 
        eos_token_id=app.state.processor.tokenizer.eos_token_id, 
        **generation_args
    )

    # remove input tokens 
    generate_ids = generate_ids[:, inputs['input_ids'].shape[1]:]
    response = app.state.processor.batch_decode(generate_ids, 
    skip_special_tokens=True, 
    clean_up_tokenization_spaces=False)[0] 

    if response.startswith("```json"):
        response = response[7:]
    if response.endswith("```"):
        response = response[:-3]

    print(response)

    return json.loads(response)

@app.post('/recommend')
def recipe_recommendations(payload: IngredientPayload):
    data = json.loads(payload.data)

    ingredients = data["ingredients"]
    additional_ingredients = data["additional"]
    restrictions = data["restrictions"]
    calories = data["calories"]
    meals = data["meals"]
    servings = data["servings"]

    print(ingredients, additional_ingredients, restrictions, calories, meals, servings)

    recipieMsgSystem = '''
    You are an AI assistant that helps users find recipe names based on ingredients, dietary restrictions, calories per meal, number of meals and servings needed.
    Always return correct and valid JSON output. The JSON should have a key "recipes" which is an array of strings.

    The available ingredients are {} and the additional ingredients are {}. The dietary restrictions are {} and the calories per meal is {}. The number of meals is {} and the servings needed is {}.
    Can you please provide the recipe names based on the above information.

    Return a JSON as output like the:
    1. {{ "recipes": ["apple pie", "banana bread", "carrot cake"] }}
    2. {{ "recipes": ["avocado toast"] }}
    3. {{ "recipes": [] }}
    4. {{ "recipes": ["egg salad", "milkshake", "apple pie", "tomato soup"] }}

    The JSON should be plain string not styled for markdown for API call purposes.
    '''

    messages = [
        {"role": "user", "content": recipieMsgSystem.format(ingredients, additional_ingredients, restrictions, calories, meals, servings)},
    ]

    prompt = app.state.processor.tokenizer.apply_chat_template(
        messages, 
        tokenize=False, 
        add_generation_prompt=True
    )

    inputs = app.state.processor(prompt, return_tensors="pt").to("cuda:0")

    generation_args = {
        "max_new_tokens": 1000,
        "temperature": 0.0,
        "do_sample": False,
    }

    generate_ids = app.state.model.generate(**inputs,
        eos_token_id=app.state.processor.tokenizer.eos_token_id,
        **generation_args
    )

    # remove input tokens
    generate_ids = generate_ids[:, inputs['input_ids'].shape[1]:]
    response = app.state.processor.batch_decode(generate_ids,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=False)[0]
    
    if response.startswith("```json"):
        response = response[7:]
    if response.endswith("```"):
        response = response[:-3]

    return json.loads(response)

@app.get("/recipe")
def get_recipe(recipe: str):
    return 