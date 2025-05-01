# Social Feed API Documentation

This document describes the Social Feed APIs for the Feed Backend service. These APIs enable social media functionality including user management, posts, comments, likes, and image uploads.

## User API

### Create User

```
POST /users
```

#### Request Body

The request body should be a JSON object with the following properties:

```json
{
  "username": "johndoe",
  "sui_address": "0x1234...",
  "profile_picture_url": "https://example.com/profile.jpg"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | The username of the user |
| sui_address | string | Yes | The Sui blockchain address of the user |
| profile_picture_url | string | Yes | URL to the user's profile picture |

#### Response

##### Success Response (201 Created)

```json
{
  "id": 1,
  "username": "johndoe",
  "sui_address": "0x1234...",
  "profile_picture_url": "https://example.com/profile.jpg"
}
```

##### Error Responses

###### 400 Bad Request

```json
{
  "message": "Missing required fields. Username, sui_address, and profile_picture_url are required."
}
```

###### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

## Posts API

### Create Post

```
POST /posts
```

#### Request Body

The request body should be a JSON object with the following properties:

```json
{
  "content": "This is my first post!",
  "user_id": 1,
  "media_urls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "coin_id": "0x1234..."
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | The content of the post |
| user_id | number | Yes | The ID of the user creating the post |
| media_urls | array | No | Array of URLs to media associated with the post |
| coin_id | string | No | The ID of the coin to attach to the post |

#### Response

##### Success Response (201 Created)

```json
{
  "id": 1,
  "content": "This is my first post!",
  "user_id": 1,
  "media_urls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "coin_id": "0x1234...",
  "created_at": "2023-06-01T12:00:00.000Z"
}
```

##### Error Responses

###### 400 Bad Request

```json
{
  "message": "Missing required fields"
}
```

###### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

### List Posts

```
GET /posts
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number for pagination (default: 1) |
| limit | number | No | Number of posts per page (default: 10) |

#### Response

##### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": 1,
      "content": "This is my first post!",
      "media_urls": ["https://example.com/image1.jpg"],
      "created_at": "2023-06-01T12:00:00.000Z",
      "coin_id": "0x1234...",
      "user_id": 1,
      "username": "johndoe",
      "profile_picture_url": "https://example.com/profile.jpg",
      "coin_name": "Example Coin",
      "coin_symbol": "EXC",
      "coin_image_url": "https://example.com/coin.jpg",
      "likes_count": "5",
      "comments_count": "3"
    },
    {
      "id": 2,
      "content": "Another post",
      "media_urls": null,
      "created_at": "2023-06-02T12:00:00.000Z",
      "coin_id": null,
      "user_id": 2,
      "username": "janedoe",
      "profile_picture_url": "https://example.com/profile2.jpg",
      "coin_name": null,
      "coin_symbol": null,
      "coin_image_url": null,
      "likes_count": "0",
      "comments_count": "0"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

##### Error Responses

###### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

## Comments API

### Create Comment

```
POST /comments
```

#### Request Body

The request body should be a JSON object with the following properties:

```json
{
  "content": "Great post!",
  "post_id": 1,
  "user_id": 2
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | The content of the comment |
| post_id | number | Yes | The ID of the post being commented on |
| user_id | number | Yes | The ID of the user creating the comment |

#### Response

##### Success Response (201 Created)

```json
{
  "comment": {
    "id": 1,
    "content": "Great post!",
    "post_id": 1,
    "user_id": 2,
    "created_at": "2023-06-01T12:30:00.000Z"
  },
  "total_comments": 1
}
```

##### Error Responses

###### 400 Bad Request

```json
{
  "error": {
    "fieldErrors": {
      "content": ["String must contain at least 1 character(s)"],
      "post_id": ["Required"],
      "user_id": ["Required"]
    }
  }
}
```

###### 500 Internal Server Error

```json
{
  "error": "Internal Server Error"
}
```

### Get Comments for a Post

```
GET /comments/post/:postId
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postId | string | Yes | The ID of the post to get comments for |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number for pagination (default: 1) |
| limit | number | No | Number of comments per page (default: 10) |

#### Response

##### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": 1,
      "content": "Great post!",
      "created_at": "2023-06-01T12:30:00.000Z",
      "post_id": 1,
      "user_id": 2,
      "username": "janedoe",
      "profile_picture_url": "https://example.com/profile2.jpg"
    },
    {
      "id": 2,
      "content": "I agree!",
      "created_at": "2023-06-01T12:45:00.000Z",
      "post_id": 1,
      "user_id": 3,
      "username": "bobsmith",
      "profile_picture_url": "https://example.com/profile3.jpg"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

##### Error Responses

###### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

### Get Comment Count for a Post

```
GET /comments/count/:postId
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postId | string | Yes | The ID of the post to get comment count for |

#### Response

##### Success Response (200 OK)

```json
{
  "post_id": "1",
  "total_comments": 5
}
```

##### Error Responses

###### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

## Likes API

### Like/Unlike Post

```
POST /likes
```

#### Request Body

The request body should be a JSON object with the following properties:

```json
{
  "post_id": 1,
  "user_id": 2,
  "is_like": true
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| post_id | number | Yes | The ID of the post being liked/unliked |
| user_id | number | Yes | The ID of the user liking/unliking the post |
| is_like | boolean | Yes | `true` to like, `false` to unlike |

#### Response

##### Success Response for Like (201 Created)

```json
{
  "like": {
    "id": 1,
    "post_id": 1,
    "user_id": 2,
    "created_at": "2023-06-01T12:45:00.000Z"
  },
  "total_likes": 1
}
```

##### Success Response for Unlike (200 OK)

```json
{
  "message": "Like removed",
  "total_likes": 0
}
```

##### Error Responses

###### 400 Bad Request

```json
{
  "error": {
    "fieldErrors": {
      "post_id": ["Required"],
      "user_id": ["Required"],
      "is_like": ["Required"]
    }
  }
}
```

###### 404 Not Found (when trying to unlike a non-existent like)

```json
{
  "error": "Like not found"
}
```

###### 409 Conflict (when trying to like a post already liked)

```json
{
  "error": "Already liked"
}
```

###### 500 Internal Server Error

```json
{
  "error": "Internal Server Error"
}
```

### Get Likes for a Post

```
GET /likes/post/:postId
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postId | string | Yes | The ID of the post to get likes for |

#### Response

##### Success Response (200 OK)

```json
{
  "post_id": "1",
  "total_likes": 5
}
```

##### Error Responses

###### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

## Image API

### Upload Image

```
POST /images
```

#### Request Body

The request should be a multipart/form-data with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | The image file to upload (JPG, JPEG, or PNG, max 5MB) |
| postId | string | Yes | The ID of the post to associate the image with |

#### Response

##### Success Response (201 Created)

```json
{
  "message": "Image uploaded successfully",
  "image": {
    "imageName": "1-example.jpg",
    "postId": "1",
    "imagePath": "/path/to/uploads/1-example.jpg"
  }
}
```

##### Error Responses

###### 400 Bad Request

```json
{
  "error": "No file uploaded or file type not supported"
}
```

or

```json
{
  "error": "Missing required parameter: postId"
}
```

###### 500 Internal Server Error

```json
{
  "error": "Failed to upload image",
  "details": "Error message details"
}
```

### Get Image

```
GET /images/:imageName
```

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| imageName | string | Yes | The name of the image to retrieve |

#### Response

##### Success Response (200 OK)

The image file with the appropriate content type.

##### Error Responses

###### 404 Not Found

```json
{
  "error": "Image not found"
}
```

or

```json
{
  "error": "Image file not found on server"
}
```

###### 500 Internal Server Error

```json
{
  "error": "Failed to retrieve image",
  "details": "Error message details"
}
```

## Example Requests

### Create User

```bash
curl -X POST "http://localhost:3000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "sui_address": "0x1234...",
    "profile_picture_url": "https://example.com/profile.jpg"
  }'
```

### Create Post

```bash
curl -X POST "http://localhost:3000/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is my first post!",
    "user_id": 1,
    "media_urls": ["https://example.com/image1.jpg"],
    "coin_id": "0x1234..."
  }'
```

### List Posts

```bash
curl -X GET "http://localhost:3000/posts?page=1&limit=10"
```

### Create Comment

```bash
curl -X POST "http://localhost:3000/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great post!",
    "post_id": 1,
    "user_id": 2
  }'
```

### Get Comments for a Post

```bash
curl -X GET "http://localhost:3000/comments/post/1?page=1&limit=10"
```

### Get Comment Count for a Post

```bash
curl -X GET "http://localhost:3000/comments/count/1"
```

### Like Post

```bash
curl -X POST "http://localhost:3000/likes" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 1,
    "user_id": 2,
    "is_like": true
  }'
```

### Get Likes for a Post

```bash
curl -X GET "http://localhost:3000/likes/post/1"
```

### Upload Image

```bash
curl -X POST "http://localhost:3000/images" \
  -F "file=@/path/to/local/image.jpg" \
  -F "postId=1"
```

### Get Image

```bash
curl -X GET "http://localhost:3000/images/1-example.jpg" -o downloaded_image.jpg
```
