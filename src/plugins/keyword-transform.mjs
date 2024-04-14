import { parse } from "acorn";
import { generate } from "astring";
import { walk } from "estree-walker";
export default function transformKeywords() {
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
				walk(ast, {
					leave(node, parent, prop, index) {
						if (node.type == "VariableDeclarator") {
							if (node.init?.property?.name == "default") {
								this.replace({
									...node,
									init: {
										...node.init,
										computed: true,
										property: {
											type: "Literal",
											value: "default",
										},
									},
								});
							}
						} else if (node.type == "Property") {
							if (
								node.key.name === "default" &&
								node.key.type === "Identifier"
							) {
								this.replace({
									...node,
									key: {
										type: "Literal",
										value: "default",
									},
								});
							}
						}
					},
				});
				
				return {
					code: generate(ast),
				};
			},
		},
	};
}
