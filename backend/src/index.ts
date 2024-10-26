import { Hono } from "hono";
import { blogsRouter, userRouter } from "./routes";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.get("/", async (c) => {
  return c.json({ message: "Hello World" });
});

app.route("/api/v1/user",userRouter
)
app.route("/api/v1/blog",blogsRouter)



export default app;

