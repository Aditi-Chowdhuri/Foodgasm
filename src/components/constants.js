export const errorMsgSystem = `
    Return a JSON as output such that the only valid ouputs are: 
    1. { "status": false, "message": "NO_FOOD" }
    2. { "status": false, "message": "CLOSED_FRIDGE" }
    3. { "status": false, "message": "EMPTY_FRIDGE" }
    4. { "status": false, "message": "INVALID_IMAGE" }
    5. { "status": true, "message": "OK" }

    Some examples of invalid outputs are:
    1. { "status": true, "message": "NO_FOOD" }
    2. { "status": false, "message": "OK" }
    3. The image does not contain any food
    4. The fridge is empty
`;

export const errorMsgUser = `
    Does the image contain food of any form?

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