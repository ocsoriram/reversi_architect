const numbers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
console.log(numbers);

numbers.forEach((num, i) => {
  console.log(i, num * 2);
});

const names = ["Alice", "Bob", "Carol"];
const users = names.map((name, id) => {
  return {
    id,
    name,
  };
});

console.log("users: ", users);

const evenIdUsers = users.filter((user) => {
  return user.id % 2 === 0;
});

console.log(`evenIdUsers: ${JSON.stringify(evenIdUsers)}`);
console.log("evenIdUsers: ", evenIdUsers);

const sum = numbers.reduce((previous, current) => {
  return previous + current;
}, 100);

console.log("sum: ", sum);
