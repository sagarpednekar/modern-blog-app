import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@sagarpednekar/medium-common";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: c.env.DATABASE_URL,
        },
      },
    }).$extends(withAccelerate());

    const body = await c.req.json();

    const { error } = signupInput.safeParse(body);

    if (error) {
      return c.json({ message: "Invalid input", error });
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });

    console.log(body);

    return c.json({ message: "User signed up successfully", user: { user } });
  } catch (error) {
    console.error(error);
    return c.json({ message: "User signed up failed", error });
  }
});

userRouter.post("/signin", async (c) => {
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: c.env.DATABASE_URL,
        },
      },
    }).$extends(withAccelerate());

    const body = await c.req.json();

    const { error } = signinInput.safeParse(body);

    if (error) {
      return c.json({ message: "Invalid input", error });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      c.status(404);
      return c.json({ message: "User not found" });
    }

    const token = await sign({ userId: user?.id }, c.env.JWT_SECRET);

    return c.json({ message: "User signed in successfully", token });
  } catch (error) {
    return c.json({ message: "User signed in failed", error });
  }
});
