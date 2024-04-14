import { parse } from "acorn";
import { generate } from "astring";
import { walk } from "estree-walker";
export default function transformKeywords(options) {
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
						if(node.type == "VariableDeclaration") {	
							this.replace({...node, kind: "var"})
						}
					},
				});
				
				return {
					code: generate(ast)
					.replace(/\snative\s/g, " NATIVE "),
				};
			},
		},
	};
}
