# Social Feed API Documentation

The Social Feed API provides endpoints for managing posts, comments, and likes in the social network aspect of the application.

## Posts Endpoints

### Create a New Post

```
POST /posts
```

#### Request Body

```json
{
  "content": "Hello world, this is my first post!",
  "userId": "0x1234...",
  "mediaUrls": ["https://example.com/image.jpg"],
  "coinId": "0xabcd..."
}
```

#### Request Fields

| Field     | Type             | Required | Description                                   |
| --------- | ---------------- | -------- | --------------------------------------------- |
| content   | string           | Yes      | The text content of the post                  |
| userId    | string           | Yes      | The SUI address of the user creating the post |
| mediaUrls | array of strings | No       | URLs of media attached to the post            |
| coinId    | string           | No       | ID of the coin being referenced in the post   |

#### Success Response

The API returns a 201 Created status code with the created post:

```json
{
  "id": "1",
  "content": "Hello world, this is my first post!",
  "userId": "0x1234...",
  "mediaUrls": ["https://example.com/image.jpg"],
  "coinId": "0xabcd...",
  "createdAt": "2025-05-01T12:34:56.789Z"
}
```

#### Error Responses

```json
{
  "error": {
    "formErrors": [],
    "fieldErrors": {
      "content": ["String must contain at least 1 character(s)"]
    }
  }
}
```

Or:

```json
{
  "message": "Internal server error"
}
```

### Get Posts (with Pagination)

Retrieves a list of posts with information about the author, likes, and comments.

```
GET /posts
```

#### Query Parameters

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| page      | integer | No       | Page number (default: 1)               |
| limit     | integer | No       | Number of items per page (default: 10) |
| coinId    | string  | No       | Filter posts by coin ID                |

#### Success Response

```json
{
  "data": [
    {
      "id": "1",
      "user": {
        "id": "0x1234...",
        "name": "John Doe",
        "handle": "johndoe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "token": {
        "id": "0xabcd...",
        "name": "My Coin",
        "symbol": "MC",
        "logo": "https://example.com/coin-logo.png"
      },
      "content": "Hello world, this is my first post!",
      "image": "https://example.com/image.jpg",
      "timestamp": "2025-05-01T12:34:56.789Z",
      "likes": 5,
      "comments": 2,
      "boosts": 0,
      "signalScore": 0,
      "isLiked": false,
      "isBoosted": false,
      "views": 0
    }
    // Additional posts...
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### Error Response

```json
{
  "message": "Internal server error"
}
```

### Check if Post is Liked by User

```
GET /posts/isLiked
```

#### Query Parameters

| Parameter | Type   | Required | Description                 |
| --------- | ------ | -------- | --------------------------- |
| postId    | string | Yes      | The ID of the post          |
| userId    | string | Yes      | The SUI address of the user |

#### Success Response

```json
{
  "isLiked": true
}
```

#### Error Responses

```json
{
  "message": "postId and userId are required"
}
```

Or:

```json
{
  "message": "Internal server error"
}
```

## Comments Endpoints

### Create a Comment

```
POST /comments
```

#### Request Body

```json
{
  "content": "Great post!",
  "postId": "1",
  "userId": "0x1234..."
}
```

#### Request Fields

| Field   | Type   | Required | Description                                      |
| ------- | ------ | -------- | ------------------------------------------------ |
| content | string | Yes      | The text content of the comment                  |
| postId  | string | Yes      | The ID of the post being commented on            |
| userId  | string | Yes      | The SUI address of the user creating the comment |

#### Success Response

```json
{
  "id": "1",
  "postId": "1",
  "userId": "0x1234...",
  "content": "Great post!",
  "createdAt": "2025-05-01T12:34:56.789Z"
}
```

### Get Comments for a Post

```
GET /comments
```

#### Query Parameters

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| postId    | string  | Yes      | The ID of the post to get comments for |
| page      | integer | No       | Page number (default: 1)               |
| limit     | integer | No       | Number of items per page (default: 10) |

#### Success Response

```json
{
  "data": [
    {
      "id": "1",
      "user": {
        "id": "0x1234...",
        "name": "John Doe",
        "handle": "johndoe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "content": "Great post!",
      "timestamp": "2025-05-01T12:34:56.789Z"
    }
    // Additional comments...
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

## Likes Endpoints

### Like a Post

```
POST /likes
```

#### Request Body

```json
{
  "postId": "1",
  "userId": "0x1234..."
}
```

#### Request Fields

| Field  | Type   | Required | Description                                 |
| ------ | ------ | -------- | ------------------------------------------- |
| postId | string | Yes      | The ID of the post to like                  |
| userId | string | Yes      | The SUI address of the user liking the post |

#### Success Response

```json
{
  "id": "1",
  "postId": "1",
  "userId": "0x1234...",
  "createdAt": "2025-05-01T12:34:56.789Z"
}
```

### Unlike a Post

```
DELETE /likes
```

#### Query Parameters

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| postId    | string | Yes      | The ID of the post to unlike |
| userId    | string | Yes      | The SUI address of the user  |

#### Success Response

```json
{
  "message": "Like removed successfully"
}
```

## Image Endpoints

### Upload an Image

```
POST /images
```

#### Request Body

This endpoint accepts multipart/form-data with the following fields:

| Field  | Type   | Required | Description                                                          |
| ------ | ------ | -------- | -------------------------------------------------------------------- |
| file   | File   | Yes      | The image file to upload (JPG, JPEG, PNG)                            |
| type   | string | No       | Type of the image ('post', 'profile', or 'coin', defaults to 'post') |
| userId | string | No       | The SUI address of the user uploading the image                      |

#### Success Response

```json
{
  "message": "Image uploaded successfully",
  "image": {
    "imageName": "filename.jpg",
    "imagePath": "https://gateway.pinata.cloud/ipfs/QmHash...",
    "cid": "QmHash...",
    "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmHash..."
  }
}
```

### Get Image

```
GET /images/:imageName
```

This endpoint redirects to the image URL.

### Get Image Info

```
GET /images/info/:imageName
```

#### Success Response

```json
{
  "image": {
    "imageName": "filename.jpg",
    "imagePath": "https://gateway.pinata.cloud/ipfs/QmHash..."
  }
}
```
