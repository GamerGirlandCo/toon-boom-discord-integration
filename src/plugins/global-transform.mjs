import { parse } from "acorn";
import { generate } from "astring";
import { walk } from "estree-walker";
export default function transformGlobals(options) {
	return {
		name: "keyword-transform",
		transform: {
			order: "post",
			sequential: true,
			handler: function (code, id) {
				// console.log(id)
				let ast = parse(code, {
					sourceType: "module",
				});
				/* ast.body = ast.body.map((x) => {
					if (x.type == "FunctionDeclaration" && !!x.id.name) {
						if (x.id.name != options.mainFunction) {
							return {
								type: "ExpressionStatement",
								expression: {
									type: "AssignmentExpression",
									left: {
										type: "MemberExpression",
										object: {
											type: "Identifier",
											name: "global",
										},
										computed: false,
										property: {
											type: "Identifier",
											name: x.id.name,
										},
									},
									operator: "=",
									right: {
										type: "FunctionExpression",
										id: "null",
										params: x.params,
										body: {
											type: "BlockStatement",
											body: x.body,
										},
										async: x.async,
										generator: x.generator,
									},
								},
							};
						}
					}
					return x;
				}); */
				ast.body.unshift({
					type: "VariableDeclaration",
					kind: "var",
					declarations: [
						{
							type: "VariableDeclarator",
							id: {
								type: "Identifier",
								name: "global",
							},
							init: {
								type: "MemberExpression",
								object: {
									type: "ThisExpression",
								},
								computed: false,
								property: {
									type: "Identifier",
									name: "__proto__",
								},
							},
						},
					],
				});
				return {
					code: generate(ast).replace(/\snative\s/g, " NATIVE "),
				};
			},
		},
	};
}
