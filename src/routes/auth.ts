import fastify, {
  type FastifyHttpOptions,
  type FastifyInstance,
} from "fastify";
import { db } from "../db/index.js";
import { tokenTable, userTable } from "../db/schema.js";
import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { generateRandomString } from "../helpers/genRandomValues.js";

interface IUser {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

interface IUserL {
  email: string;
  password: string;
}

async function authRoutes(fastify: FastifyInstance, options: any) {
  fastify.get("/", async (request, reply) => {
    return {
      message: "This is the auth route test scene",
    };
  });

  fastify.post("/signup", async (request, reply) => {
    const user = request.body as IUser;
    const passwordToHash = user.password;
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);
    const createdUserId = await db
      .insert(userTable)
      .values({
        first_name: user.firstName,
        last_name: user.lastName,
        username: user.username,
        email: user.email,
        password: hashedPassword,
      })
      .$returningId();

    if (createdUserId.length === 0) {
      reply
        .status(400)
        .send({ status: "error", message: "Signup failed", data: null });
    }
    const createdUserArr = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, createdUserId[0].id));

    const createdUser = createdUserArr[0];

    const tokenId = generateRandomString();

    const future = new Date();
    future.setDate(new Date().getDate() + 30);
    const expirationNumber = Math.floor(future.getTime() / 1000);

    const createdTokenId = await db.insert(tokenTable).values({
      id: tokenId,
      user_id: createdUser.id,
      expires_at: expirationNumber,
    });
    console.log(createdTokenId);
    if (createdTokenId[0].affectedRows === 0) {
      reply.status(400).send({
        status: "error",
        message: "Token creation failed",
        data: null,
      });
    }

    const createdTokenArr = await db
      .select()
      .from(tokenTable)
      .where(eq(tokenTable.id, tokenId));

    const createdToken = createdTokenArr[0];

    reply.setCookie("token", JSON.stringify(createdToken), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(createdToken.expires_at * 1000),
      signed: true,
    });
    return reply.status(201).send({
      status: "success",
      message: "Signup successful",
      data: {
        createdUser,
        createdToken,
        date: new Date(createdToken.expires_at * 1000),
      },
    });
  });

  fastify.post("/login", async (request, reply) => {
    const user = request.body as IUserL;

    // await bcrypt.compare()
    const userExistsArr = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, user.email));

    if (userExistsArr.length === 0) {
      reply
        .status(400)
        .send({ status: "error", message: "User does not exist", data: null });
    }

    const userExists = userExistsArr[0];

    const passwordMatch = await bcrypt.compare(
      user.password,
      userExists.password as string
    );

    if (!passwordMatch || !userExists) {
      reply.status(400).send({
        status: "error",
        message: "Invalid email or password",
        data: null,
      });
    }

    const tokenId = generateRandomString();

    const future = new Date();
    future.setDate(new Date().getDate() + 30);
    const expirationNumber = Math.floor(future.getTime() / 1000);

    const createdTokenResult = await db.insert(tokenTable).values({
      id: tokenId,
      user_id: userExists.id as string,
      expires_at: expirationNumber,
    });
    if (createdTokenResult[0].affectedRows === 0) {
      reply.status(400).send({
        status: "error",
        message: "Token creation failed",
        data: null,
      });
    }

    const createdTokenArr = await db
      .select()
      .from(tokenTable)
      .where(eq(tokenTable.id, tokenId));

    const createdToken = createdTokenArr[0];
    reply.setCookie("token", JSON.stringify(createdToken), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(createdToken.expires_at * 1000),
      signed: true,
    });
    reply.status(201).send({
      status: "success",
      message: "Login Successful",
      data: {
        userExists,
        createdToken,
        date: new Date(createdToken.expires_at * 1000),
      },
    });
  });

  fastify.post("/logout", async (request, reply) => {
    reply.clearCookie("token");
    reply.status(200).send({
      status: "success",
      message: "Logout Successful",
      data: null,
    });
  });
}

export default authRoutes;
