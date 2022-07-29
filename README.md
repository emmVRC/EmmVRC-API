# EmmVRC API

# DOC

## Unprotected

## api/authentication/login
``` 
POST application/JSON

{
	"name": "Zail",
	"username": "usr_45s5e0gc-fdf6-4b63-a2b1-6419a634f240",
	"password":	"558699" # NOT
}
```

#### response

``` 
Status: 200 OK
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNyXzQ1czVlMGdjLWZkZjYtNGI2My1hMmIxLTY0MTlhNjM0ZjI0MCIsImlhdCI6MTU4ODkyMDQ1NSwiZXhwIjoxNTg5MTc5NjU1fQ.j4FvlijQorJVX-y0LTB4YAaFRBQY13ST0-0cDHNE-Mw"
}
```

### api/donor

``` GET ```

#### response
``` 
GET
[
    {
        "donor_tooltip": "\"Hello~ you are all the BIG CUTIE\"",
        "donor_status": 1,
        "donor_user_id": "usr_45s5e0gc-fdf6-4b63-a2b1-6419a634f240",
        "user_name": "Zail"
    },
    {
        "donor_tooltip": "OMG THE BIGGEST OF CUTIE!",
        "donor_status": 1,
        "donor_user_id": "usr_45s5e0gc-fdf6-4b63-a2b1-6419a634f240",
        "user_name": "Zail"
    }
]
```

### Protected

``` AUTH 
TYPE Bearer Token

Token: JWT RESPONSE
```

### api/avatar

``` 
POST application/JSON

{
	"avatar_id": "avt_36b4f9fd-fdfaa6-4bwqeq63-a2b1-6419aaa634f240",
	"avatar_asset_url":  "http://someurl.com",
	"avatar_thumbnail_image_url": "http://someurl.com",
	"avatar_author_name": "#ކJGo9CN4e榌",
	"avatar_author_id": "12345",
	"avatar_supported_platforms": 3
}
```

#### response 
``` 
Status: 200 OK
{
    "message": "exists"
}

OR

{
    "status": "OK"
}

```

``` GET ```

#### response

```
[
    {
        "avatar_id": "avt_36b4f9fd-fdfaa6-4bwqeq63-a2b1-6419aaa634f240",
        "avatar_name": "",
        "avatar_asset_url": "http://someurl.com",
        "avatar_thumbnail_image_url": "http://someurl.com",
        "avatar_author_name": "#?JGo9CN4e?",
        "avatar_author_id": "12345",
        "avatar_supported_platforms": 3
    },
    {
        "avatar_id": "avt_36b4f9fd-waaw-4bwqeq63-a2b1-6419aaa634f240",
        "avatar_name": "",
        "avatar_asset_url": "http://someurl.com",
        "avatar_thumbnail_image_url": "http://someurl.com",
        "avatar_author_name": "#?JGo9CN4e?",
        "avatar_author_id": "12345",
        "avatar_supported_platforms": 3
    }
]
```

## api/blocked

``` GET ```

``` 
POST application/JSON

URL /$USERID
api/blocked/usr_36b4f9fd-fdf6-4b63-a2b1-6419a634f240
OR 

{
    "target_user_id": "usr_36b4f9fd-fdf6-4b63-a2b1-6419a634f240"
}
```

``` 
DELETE application/JSON

URL /$USERID
api/blocked/usr_36b4f9fd-fdf6-4b63-a2b1-6419a634f240
{ 
    "target_user_id": "usr_36b4f9fd-fdf6-4b63-a2b1-6419a634f240"
}
```


``` GET ```

### response

``` 
POST
{
    "status": "OK"
}
```

``` 
DELETE
{
    "status": "OK"
}
```

``` 
GET
[
    {
        "blocked_target_user_id": "usr_45s5e0gc-fdf6-4b63-a2b1-6419a634f240",
        "blocked_expire_date": null,
        "blocked_created_date": "2020-05-14T20:01:50.000Z"
    }
]
```

## api/message

``` 
POST application/JSON
{
	"recipient": "global", OR "usr_45s5e0gc-fdf6-4b63-a2b1-6419a634f240"
	"body": "Hey! you are all big cuties",
	"icon": "something?"
}
```

``` GET ```

### response
``` 
POST
{
    "status": "OK"
}
```


``` 
GET
[
    {
        "rest_message_id": "08bd49c9-53ed-4382-a658-27ea173d1816",
        "rest_message_sender_name": "zailori",
        "rest_message_sender_id": "usr_36b4f9fd-fdf6-4b63-a2b1-6419a634f240",
        "rest_message_body": "NEW MESSAGE!",
        "rest_message_icon": "something?",
        "rest_message_created": 1588373843
    },
    {
        "rest_message_id": "2cf8735b-205b-494c-95e6-07e67e4ffc8a",
        "rest_message_sender_name": null,
        "rest_message_sender_id": "usr_45s5e0gc-fdf6-4b63-a2b1-6419a634f240",
        "rest_message_body": "Hey! you are all big cuties",
        "rest_message_icon": "something?",
        "rest_message_created": 1588374041
    },
    {
        "rest_message_id": "fb2586f9-3017-4ad0-ae53-e98cd2de891d",
        "rest_message_sender_name": "zailori",
        "rest_message_sender_id": "usr_36b4f9fd-fdf6-4b63-a2b1-6419a634f240",
        "rest_message_body": "Hey! you are all big cuties",
        "rest_message_icon": "something?",
        "rest_message_created": 1588497542
    },
    {
        "rest_message_id": "9d7f0ede-2d24-46de-abba-cf9aae6d832b",
        "rest_message_sender_name": "Zail",
        "rest_message_sender_id": "qweqeqeqeq-fdf6-ewr4b63-a2b1-64awdaw19aweqqweqwee634f240",
        "rest_message_body": "Hey! you are all big cuties",
        "rest_message_icon": "something?",
        "rest_message_created": 1589400008
    }
]
```

## api/user

``` GET ```

### response

``` 
GET
{
    "user_id": "qweqeqeqeq-fdf6-ewr4b63-a2b1-64awdaw19aweqqweqwee634f240",
    "user_status": 1
}
```