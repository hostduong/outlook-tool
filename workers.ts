import { registerUser, loginUser } from "./user";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/register" && request.method === "POST") {
      return registerUser(request, env);
    }
    if (url.pathname === "/login" && request.method === "POST") {
      return loginUser(request, env);
    }
    return new Response("404 Not Found", { status: 404 });
  }
}
