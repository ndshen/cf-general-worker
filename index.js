addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Routes the request to different action.
 * @param {Request} request
 */
async function handleRequest(request) {
  if (request.method === "GET") {
    const posts = await retrieveAllPosts();
    if (posts == null) {
      return new Response("No posts yet.", {status: 404});
    }

    return new Response(posts);
  }
  
  else if (request.method === "POST") {
    const reqBody = await readRequestBody(request);
    console.log(reqBody);
    const dataObj = JSON.parse(reqBody);
    await addPost(dataObj);
    return new Response("Success.");
  }

  return new Response(`${request.method} not implemented`, {
    status: 501,
  })
}

async function retrieveAllPosts() {
  const value = await GENERAL_KV.get('posts')
  return value;
}

async function addPost(dataObj) {
  dataObj.date = getCurrentTime();
  const existingPostsStr = await retrieveAllPosts();
  let existingPosts = JSON.parse(existingPostsStr);
  existingPosts = (existingPosts === null) ? [] : existingPosts;
  existingPosts.push(dataObj);
  return GENERAL_KV.put('posts', JSON.stringify(existingPosts));
}

/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request) {
  const { headers } = request
  const contentType = headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return JSON.stringify(await request.json())
  }
  else if (contentType.includes("application/text")) {
    return request.text()
  }
  else if (contentType.includes("text/html")) {
    return request.text()
  }
  else if (contentType.includes("form")) {
    const formData = await request.formData()
    const body = {}
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }
    return JSON.stringify(body)
  }
  else {
    // Perhaps some other type of data was submitted in the form
    // like an image, or some other binary data. 
    return 'a file';
  }
}

function getCurrentTime() {
  return new Date().toLocaleString();
}