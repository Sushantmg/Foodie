import { describe, it, expect, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import App from "./App";
import { storage } from "./utils/helpers";

beforeEach(() => storage.clear());

describe("App", () => {
  it("renders the login screen when signed out", () => {
    const html = renderToString(<App />);
    expect(html).toContain("FoodiePOS");
    expect(html).toContain("Welcome Back");
  });
});
