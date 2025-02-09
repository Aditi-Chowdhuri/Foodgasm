export const errorMsgSystem = `
    You are an AI assistant that helps users find if there is food in an image. It can be in form of fruits of vegetables outside or inside a fridge.
    Always return correct and valid JSON output. The JSON should have a key "status" which is a boolean and a key "message" which is a string.

    Return a JSON as output such that the only valid ouputs are: 
    1. { "status": false, "message": "NO_FOOD" }
    5. { "status": true, "message": "OK" }

    Remember that status can be "true" only when message is "OK".
`;

export const errorMsgUser = `
    Does the image contain food?

    ${errorMsgSystem}

    DO NOT WRITE ANYTHING ELSE. Be very sure.
`;

export const ingredientsMsgSystem = `
    Return a JSON as output such that { "ingredients": string[] }
    The ingredients should be a list of strings.

    Some examples of valid outputs are:
    1. { "ingredients": ["apple", "banana", "carrot"] }
    2. { "ingredients": ["apple"] }
    3. { "ingredients": [] }
    4. { "ingredients": ["egg", "milk", "apple", "tomato"] }

    Some examples of invalid outputs are:
    1. { "ingredients": ["apple", "banana", "carrot", "apple", "banana", "carrot"] }
    2. "ingredients": ["apple", "banana", "carrot", "apple", "banana"]
    3. { "ingredients": "apple" }
    4. { "ingredients": "" }
    5. The ingredients are: apple, banana, carrot
`;

export const ingredientsMsgUser = `
    List the ingredients in the fridge. 

    ${ingredientsMsgSystem}

    DO NOT WRITE ANYTHING ELSE. Be very sure.
`;