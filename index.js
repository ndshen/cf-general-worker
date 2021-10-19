addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
}

function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers;
  
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ){
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsHeaders,
    // Allow all future content Request headers to go back to browser
    // such as Authorization (Bearer) or X-Client-Name-Version
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers"),
    }

    return new Response(null, {
      headers: respHeaders,
    })
  }
  else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    })
  }
}

/**
 * Routes the request to different action.
 * @param {Request} request
 */
async function handleRequest(request) {
  if (request.method === "OPTIONS") {
    return handleOptions(request);
  }
  else if (request.method === "GET") {
    const posts = await retrieveAllPosts();
    if (posts == null) {
      return new Response("No posts yet.", {headers: corsHeaders, status: 404});
    }

    return new Response(posts, {headers: corsHeaders});
  }
  
  else if (request.method === "POST") {
    const reqBody = await readRequestBody(request);
    const dataObj = JSON.parse(reqBody);
    await addPost(dataObj);
    return new Response(JSON.stringify(dataObj), {headers: corsHeaders, status: 201});
  }

  return new Response(`${request.method} not implemented`, {
    headers: corsHeaders, status: 501,
  })
}

async function retrieveAllPosts() {
  let value = await GENERAL_KV.get('posts')
  if (value === "" || value === null) {
    value = "[]";
  }
  return value;
}

async function addPost(dataObj) {
  dataObj.date = getCurrentTime();
  const existingPostsStr = await retrieveAllPosts();
  let existingPosts = JSON.parse(existingPostsStr);
  existingPosts = (existingPosts === null) ? [] : existingPosts;
  existingPosts.unshift(dataObj);
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