import React from "react";

function simpleSlugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export const H2 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const text = typeof props.children === "string" ? props.children : React.Children.toArray(props.children).join("");
  const id = simpleSlugify(text);
  return (
    <h2 id={id} {...props}>
      {props.children}
    </h2>
  );
};
