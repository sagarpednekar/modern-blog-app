import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createBlogInput } from "@sagarpednekar/medium-common";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogsRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    };
}
>();


// Middleware to verify token
blogsRouter.use("/*", async (c, next) => {
    const header = c.req.header("Authorization") || "";
    const token = header.split(" ")[1];

    const response = await verify(token, c.env.JWT_SECRET);
    console.log("response", response);

    if (response.userId) {
        c.set("jwtPayload", response.userId);
        return next();
    } else {
        c.status(401);
        return c.json({ message: "Unauthorized" });
    }
});

blogsRouter.post("/", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: c.env.DATABASE_URL,
                },
            },
        }).$extends(withAccelerate());

        const body = await c.req.json();
        const {error} = createBlogInput.safeParse(body);
        if (error) {
            return c.json({ message: "Invalid input", error });
        }
        console.log("c.get('jwtPayload')", c.get("jwtPayload"));
        const data = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                published: body.published || false,
                authorId: c.get("jwtPayload"),
            },
        });
        return c.json({ message: "Blog created successfully", data });
    } catch (error) {
        return c.json({ message: "Blog creation failed", error });
    }
});

blogsRouter.get("/all", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: c.env.DATABASE_URL,
                },
            },
        }).$extends(withAccelerate());

        const data = await prisma.post.findMany({
            select: {
                title: true,
                content: true
            }
        });
        return c.json({ message: "Blogs fetched successfully", data });
    } catch (error) {
        return c.json({ message: "Blogs fetch failed", error });
    }
});

blogsRouter.get("/:authorId", async (c) => {
    try {
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: c.env.DATABASE_URL,
                },
            },
        }).$extends(withAccelerate());

        const authorId = c.req.param("authorId");

        if (!authorId) {
            const blogs = await prisma.post.findMany();
            return c.json({ message: "Blog fetched successfully", blogs });
        }

        const data = await prisma.post.findMany({
            where: {
                authorId: authorId,
            },
        });

        return c.json({ message: "Blog fetched successfully", data });
    } catch (error) {
        return c.json({ message: "Blog fetch failed", error });
    }
});

