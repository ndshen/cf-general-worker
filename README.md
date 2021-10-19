# cf-general-worker   

A simple api server that works with [cf-anguler-app](https://github.com/ndshen/cf-angular-app).   
The endpoint of this server is **https://general-worker.ping-yao-shen.workers.dev**
<br>
<br>
### Fetch all the posts: `GET /`
Example Response:
```
[
  {
    "title": "Title1",
    "author": "ndshen",
    "content": "Content for post1",
    "date": "10/19/2021, 8:20:28 PM"
  },
  {
    "title": "Title2",
    "author": "PingYao Shen",
    "content": "Content for post2",
    "date": "11/1/2021, 9:10:28 PM"
  },
]
```


### Add a single post: `POST /`
Example POST data:
```
{
  "title": "Title3",
  "author": "ndshen",
  "content": "Content for post3",
}
```
Please note that the date field is automatically generated by the server.   
Users do not have to specify the date field when adding the post.
