import AnsiLog from ".";

export default {
	title: "AnsiLog",
};

const plainLog = `warning: unused variable: \`y\`
 --> solution.rs:3:9
  |
3 |     let y = x;
  |         ^ help: if this is intentional, prefix it with an underscore: \`_y\`
  |
  = note: \`#[warn(unused_variables)]\` on by default

error[E0382]: borrow of moved value: \`x\`
 --> solution.rs:4:20

error: aborting due to previous error; 1 warning emitted
`;

const ansiLog = "\u001b[0m\u001b[1m\u001b[33mwarning\u001b[0m\u001b[0m\u001b[1m: unused variable: `y`\u001b[0m\n" +
	"\u001b[0m \u001b[0m\u001b[0m\u001b[1m\u001b[38;5;12m--> \u001b[0m\u001b[0msolution.rs:3:9\u001b[0m\n" +
	"\u001b[0m  \u001b[0m\u001b[0m\u001b[1m\u001b[38;5;12m|\u001b[0m\n" +
	"\u001b[0m\u001b[1m\u001b[38;5;12m3\u001b[0m\u001b[0m \u001b[0m\u001b[0m\u001b[1m\u001b[38;5;12m|\u001b[0m\u001b[0m \u001b[0m\u001b[0m    let y = x;\u001b[0m\n" +
	"\u001b[0m  \u001b[0m\u001b[0m\u001b[1m\u001b[38;5;12m| \u001b[0m\u001b[0m        \u001b[0m\u001b[0m\u001b[1m\u001b[33m^\u001b[0m\u001b[0m \u001b[0m\u001b[0m\u001b[1m\u001b[33mhelp: if this is intentional, prefix it with an underscore: `_y`\u001b[0m\n" +
	"\n" +
	"\u001b[0m\u001b[1m\u001b[38;5;9merror[E0382]\u001b[0m\u001b[0m\u001b[1m: borrow of moved value: `x`\u001b[0m\n" +
	"\u001b[0m \u001b[0m\u001b[0m\u001b[1m\u001b[38;5;12m--> \u001b[0m\u001b[0msolution.rs:4:20\u001b[0m\n";

export const Plain = () => <AnsiLog value={plainLog} />;
export const WithAnsiColors = () => <AnsiLog value={ansiLog} />;
