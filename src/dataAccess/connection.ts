import mysql2 from "mysql2/promise";
mysql2;
// mysqlのコネクタ準備
export const connectMySQL = async () => {
  return await mysql2.createConnection({
    host: "localhost",
    database: "reversi",
    user: "reversi",
    password: process.env.PASSWORD,
  });
};
