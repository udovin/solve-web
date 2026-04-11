import Code, { Diagnostic } from ".";

export default {
	title: "Code",
};

const cppSource = `#include <iostream>
using namespace std;

int main() {
    int x = 5;
    cout << y << endl;
    string s = "hello";
    return 0;
}`;

const gccDiagnostics: Diagnostic[] = [
	{
		level: "error",
		span: { start: { line: 5, column: 12 }, end: { line: 5, column: 13 } },
		message: "'y' was not declared in this scope",
		details: [
			{
				level: "note",
				span: { start: { line: 4, column: 8 } },
				message: "suggested alternative: 'x'",
			},
		],
	},
	{
		level: "warning",
		span: { start: { line: 4, column: 8 }, end: { line: 4, column: 9 } },
		message: "unused variable 'x'",
		code: "-Wunused-variable",
	},
];

const linkerDiagnostics: Diagnostic[] = [
	{
		level: "error",
		message: "undefined reference to `foo()'",
	},
];

// --- Rust: borrow checker ---

const rustBorrowSource = `fn main() {
    let mut s = String::from("hello");
    let r1 = &s;
    let r2 = &mut s;
    println!("{} {}", r1, r2);
}`;

const rustBorrowDiagnostics: Diagnostic[] = [
	{
		level: "error",
		code: "E0502",
		span: { start: { line: 3, column: 14 }, end: { line: 3, column: 20 } },
		message: "cannot borrow `s` as mutable because it is also borrowed as immutable",
		details: [
			{
				level: "note",
				span: { start: { line: 2, column: 14 }, end: { line: 2, column: 16 } },
				message: "immutable borrow occurs here",
			},
			{
				level: "note",
				span: { start: { line: 4, column: 22 }, end: { line: 4, column: 24 } },
				message: "immutable borrow later used here",
			},
		],
	},
];

// --- Rust: lifetime mismatch ---

const rustLifetimeSource = `fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let s1 = String::from("long string");
    let result;
    {
        let s2 = String::from("xyz");
        result = longest(s1.as_str(), s2.as_str());
    }
    println!("{}", result);
}`;

const rustLifetimeDiagnostics: Diagnostic[] = [
	{
		level: "error",
		code: "E0106",
		span: { start: { line: 0, column: 33 }, end: { line: 0, column: 37 } },
		message: "missing lifetime specifier",
		details: [
			{
				level: "note",
				span: { start: { line: 0, column: 15 }, end: { line: 0, column: 19 } },
				message: "this parameter's lifetime `x` is one candidate",
			},
			{
				level: "note",
				span: { start: { line: 0, column: 24 }, end: { line: 0, column: 28 } },
				message: "this parameter's lifetime `y` is another candidate",
			},
			{
				level: "help",
				span: { start: { line: 0, column: 0 }, end: { line: 0, column: 38 } },
				message: "consider introducing a named lifetime parameter: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str`",
			},
		],
	},
];

// --- Rust: missing trait impl ---

const rustTraitSource = `use std::fmt;

struct Point {
    x: f64,
    y: f64,
}

fn print_point(p: &Point) {
    println!("{}", p);
}

fn distance(a: &Point, b: &Point) -> f64 {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    (dx * dx + dy * dy).sqrt()
}

fn main() {
    let p = Point { x: 1.0, y: 2.0 };
    let q = Point { x: 4.0, y: 6.0 };
    print_point(&p);
    println!("{}", distance(&p, &q));
}`;

const rustTraitDiagnostics: Diagnostic[] = [
	{
		level: "error",
		code: "E0277",
		span: { start: { line: 8, column: 20 }, end: { line: 8, column: 21 } },
		message: "`Point` doesn't implement `std::fmt::Display`",
		details: [
			{
				level: "note",
				message: "`Point` cannot be formatted with the default formatter",
			},
			{
				level: "note",
				message: "in format string, `{}` requires the trait `std::fmt::Display`, which is not implemented for `Point`",
			},
			{
				level: "help",
				message: "consider implementing `Display` for `Point`, or use `{:?}` and implement `Debug`",
			},
		],
	},
];

// --- Rust: multiple errors ---

const rustMultiSource = `fn main() {
    let x = String::from("hello");
    let y = x;
    println!("{}", x);

    let a: i32 = "not a number";

    let v = vec![1, 2, 3];
    let elem = v[10];
}`;

const rustMultiDiagnostics: Diagnostic[] = [
	{
		level: "error",
		code: "E0382",
		span: { start: { line: 3, column: 19 }, end: { line: 3, column: 20 } },
		message: "use of moved value: `x`",
		details: [
			{
				level: "note",
				span: { start: { line: 1, column: 8 }, end: { line: 1, column: 9 } },
				message: "move occurs because `x` has type `String`, which does not implement the `Copy` trait",
			},
			{
				level: "note",
				span: { start: { line: 2, column: 12 }, end: { line: 2, column: 13 } },
				message: "value moved here",
			},
			{
				level: "help",
				message: "consider cloning the value if the performance cost is acceptable",
			},
		],
	},
	{
		level: "error",
		code: "E0308",
		span: { start: { line: 5, column: 18 }, end: { line: 5, column: 32 } },
		message: "mismatched types: expected `i32`, found `&str`",
		details: [
			{
				level: "note",
				span: { start: { line: 5, column: 10 }, end: { line: 5, column: 13 } },
				message: "expected due to this",
			},
		],
	},
	{
		level: "warning",
		span: { start: { line: 8, column: 8 }, end: { line: 8, column: 12 } },
		message: "unused variable: `elem`",
		code: "unused_variables",
		details: [
			{
				level: "help",
				message: "if this is intentional, prefix it with an underscore: `_elem`",
			},
		],
	},
];

export const Default = () => <Code
	value={cppSource}
	language="cpp"
	readOnly
	showLineNumbers
/>;

export const GccErrors = () => <Code
	value={cppSource}
	language="cpp"
	readOnly
	showLineNumbers
	diagnostics={gccDiagnostics}
/>;

export const LinkerError = () => <Code
	value={cppSource}
	language="cpp"
	readOnly
	showLineNumbers
	diagnostics={linkerDiagnostics}
/>;

export const RustBorrowChecker = () => <Code
	value={rustBorrowSource}
	language="rs"
	readOnly
	showLineNumbers
	diagnostics={rustBorrowDiagnostics}
/>;

export const RustLifetimes = () => <Code
	value={rustLifetimeSource}
	language="rs"
	readOnly
	showLineNumbers
	diagnostics={rustLifetimeDiagnostics}
/>;

export const RustMissingTrait = () => <Code
	value={rustTraitSource}
	language="rs"
	readOnly
	showLineNumbers
	diagnostics={rustTraitDiagnostics}
/>;

export const RustMultipleErrors = () => <Code
	value={rustMultiSource}
	language="rs"
	readOnly
	showLineNumbers
	diagnostics={rustMultiDiagnostics}
/>;

export const Editable = () => <Code
	value={cppSource}
	language="cpp"
	editable
	showLineNumbers
/>;
