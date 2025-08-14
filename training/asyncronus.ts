import fs from "fs";
import util from "util";

const promisifyReadFile = util.promisify(fs.readFile);

async function main() {
  const readfilePromise = await promisifyReadFile("package.json");
  const fileContent = readfilePromise.toString();
  console.log(fileContent);

  // readfilePromise.then((data) => {
  //   const fileContent = data.toString();
  //   console.log(fileContent);
  // });

  // let fileContent: string = "Not Loaded";
  // fs.readFile("package.json", (err, data) => {
  //   fileContent = data.toString();
  //   console.log(fileContent);
  // });
  // console.log(fileContent);
}

main();
