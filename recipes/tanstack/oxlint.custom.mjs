const noTypeAssertionExceptObjectKeys = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      avoidTypeAssertion:
        "Avoid type assertions. Prefer structural typing, runtime checks, or fixing source types.",
    },
  },
  create(context) {
    const reportIfInvalid = (node) => {
      const isObjectKeysCall =
        node.expression?.type === "CallExpression" &&
        node.expression.callee?.type === "MemberExpression" &&
        !node.expression.callee.computed &&
        node.expression.callee.object?.type === "Identifier" &&
        node.expression.callee.object.name === "Object" &&
        node.expression.callee.property?.type === "Identifier" &&
        node.expression.callee.property.name === "keys"

      const isConstAssertion =
        node.typeAnnotation?.type === "TSTypeReference" &&
        node.typeAnnotation.typeName?.type === "Identifier" &&
        node.typeAnnotation.typeName.name === "const"

      if (!isObjectKeysCall && !isConstAssertion) {
        context.report({
          node,
          messageId: "avoidTypeAssertion",
        })
      }
    }

    return {
      TSAsExpression: reportIfInvalid,
      TSTypeAssertion: reportIfInvalid,
    }
  },
}

export default {
  meta: {
    name: "tohuhono",
  },
  rules: {
    "no-type-assertion-except-object-keys": noTypeAssertionExceptObjectKeys,
  },
}
