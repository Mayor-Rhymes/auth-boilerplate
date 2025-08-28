// import { config } from "dotenv";



// config();

// async function main() {

//     const users = await db.selectFrom("user").selectAll().execute();
//     console.log(process.env.DB_NAME);
//     console.log(users);
// }

// main();


const future = new Date();
future.setDate(new Date().getDate() - 30);

const intfuture = Math.floor(future.getTime() / 1000);

console.log(future);
console.log(intfuture);
console.log(new Date(intfuture * 1000));
      