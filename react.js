https://codesandbox.io/s/javascript-forked-7ngvn?file=/index.js

const React = {
  createTextElement(text) {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: []
      }
    };
  },
  createElement(type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map((child) =>
          typeof child === "object" ? child : React.createTextElement(child)
        )
      }
    };
  }
};

const camelToKebabCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const ReactDOM = {
  isProperty(key) {
    return key !== "children" && key !== "style";
  },
  render(element, container) {
    const dom =
      element.type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(element.type);

    element.props.children.forEach((child) => ReactDOM.render(child, dom));

    let style = "";
    if (element.props.style) {
      Object.keys(element.props.style).forEach((property) => {
        style += `${camelToKebabCase(property)}:${
          element.props.style[property]
        };`;
      });
    }

    if (style) {
      dom["style"] = style;
    }

    Object.keys(element.props)
      .filter(ReactDOM.isProperty)
      .forEach((name) => {
        dom[name] = element.props[name];
      });

    container.appendChild(dom);
  }
};

ReactDOM.render(
  React.createElement(
    "div",
    {
      id: "heading",
      style: {
        backgroundColor: "red",
        fontSize: "30px",
        height:"100px",
        width:"100px",
        display:"flex",
        justifyContent:"center",
        alignItems:"center"
      }
    },
    "Hi"
  ),
  document.getElementById("root")
);

