https://codesandbox.io/s/javascript-forked-7ngvn?file=/index.js:0-3825

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
}
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      )
    }
  };
}

const camelToKebabCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  const isProperty = (key) => key !== "children";
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });

  let style = "";
  if (fiber.props.style) {
    Object.keys(fiber.props.style).forEach((property) => {
      style += `${camelToKebabCase(property)}:${fiber.props.style[property]};`;
    });
  }

  if (style) {
    dom["style"] = style;
  }

  return dom;
}

let nextUnitOfWork = null;
let wipRoot = null;
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    }
  };
  nextUnitOfWork = wipRoot;
}

function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null;
}
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  // TODO add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  // TODO create new fibers
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;
  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
  // TODO return next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

const React = {
  createElement,
  render
};

React.render(
  React.createElement(
    "main",
    {
      style: {
        display: "flex"
      }
    },
    React.createElement(
      "div",
      {
        style: { height: "200px", width: "200px" }
      },
      "lvl1-child1"
    ),
    React.createElement(
      "div",
      {
        style: { height: "200px", width: "200px" }
      },
      React.createElement(
        "div",
        {
          style: { height: "200px", width: "200px" }
        },
        "lvl1-child2-child1",
      ),
      React.createElement(
        "div",
        {
          style: { height: "200px", width: "200px" }
        },
        "lvl1-child2-child3",
      ),
      React.createElement(
        "div",
        {
          style: { height: "200px", width: "200px" }
        },
        "lvl1-child2-child4",
      )
    ),
    React.createElement(
      "div",
      {
        style: { height: "200px", width: "200px" }
      },
      "lvl1-child3"
    )
  ),
  document.getElementById("root")
);

console.log(wipRoot);

