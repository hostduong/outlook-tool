export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Đăng ký tài khoản
    if (path === "/register" && method === "POST") {
      // Xử lý đăng ký user
      return await handleRegister(request, env);
    }
    // Đăng nhập tài khoản
    if (path === "/login" && method === "POST") {
      // Xử lý đăng nhập user
      return await handleLogin(request, env);
    }
    // Trang profile user
    if (path === "/profile" && method === "GET") {
      // Xử lý lấy thông tin user
      return await handleProfile(request, env);
    }

    // Các route cũ:
    if (path.endsWith("/refresh")) return xuLy_Token_Outlook(body, env, ctx);
    if (path.endsWith("/messenger")) return xuLy_Messenger_Outlook(body, env, ctx);

    // ... Các route khác ở dưới

    // Không match: trả 404
    return new Response("404 Not Found", { status: 404 });
  },
  scheduled // ...
};
