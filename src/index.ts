import { config } from 'dotenv';

config();

interface IQuerystring {
  username: string;
  password: string;
}

interface IHeaders {
  'h-Custom': string;
}

interface IReply {
  200: { success: boolean };
  302: { url: string };
  '4xx': { error: string };
}


import fastify from 'fastify'
import authRoutes from './routes/auth.js';
import fastifyMysql from '@fastify/mysql';
import fastifyCookie from '@fastify/cookie';


const port = process.env.PORT as unknown as number;

const server = fastify({
    logger: true,
})


server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET
})
server.register(fastifyMysql, {
  connectionString: "mysql://root@localhost:3306/expensor"
});

server.register(authRoutes, {
  prefix: "/api/auth"
});

server.get('/', async (request, reply) => {
  return {
    message: "Authentication and Authorization Intro"
  }
})



const start = async () => {
  try {
    await server.listen({ port })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}


start();

